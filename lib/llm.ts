// PrepArsenal — LLM Gateway with RAG Engine & Semantic Cache
// Server-only: reads non-public API keys, must only be imported from Route Handlers / Server Components.
import { retrieveRelevantPassages, buildRagPromptContext, type RagSearchResult } from './rag/rag-engine';
import { querySemanticCache, storeInSemanticCache } from './cache/semantic-cache';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  provider: 'gemini' | 'groq' | 'semantic-cache' | 'local';
  cached?: boolean;
  similarityScore?: number;
  latencyMs?: number;
  citations?: RagSearchResult[];
  error?: string;
}

const BASE_SYSTEM_PROMPT = `You are PrepArsenal AI — an elite AI tutor for Indian government competitive exams (SSC CGL, UPSC Prelims, RBI Grade B, NABARD, RRB NTPC, ACIO-II, LIC AAO).

Your core mandates:
1. Explain concepts rigorously, highlighting mathematical shortcuts and exam patterns.
2. When answering polity, history, or economics questions, reference verified textbooks and NCERT chapters where applicable.
3. Keep answers highly structured with ✅ ❌ 💡 📌 emojis and clear markdown headers.
4. If the prompt includes RAG verified citations, use them as authoritative evidence without inventing facts.`;

async function callGemini(messages: ChatMessage[], systemPrompt: string): Promise<{ content: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048,
          // gemini-3.6-flash is a "thinking" model — without this it burns the
          // output budget on internal reasoning tokens before any visible text.
          thinkingConfig: { thinkingBudget: 0 },
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
  
  return { content: text };
}

async function callGroq(messages: ChatMessage[], systemPrompt: string): Promise<{ content: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  const formattedMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: formattedMessages,
      temperature: 0.6,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || 'No response generated';
  
  return { content: text };
}

// Local fallback with RAG guidance
function localFallback(messages: ChatMessage[], citations: RagSearchResult[]): LLMResponse {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  let fallbackContent = `⚠️ **AI Tutor running in offline mode**\n\nI noticed you asked: "${lastMessage.slice(0, 100)}..."\n\n`;
  
  if (citations.length > 0) {
    fallbackContent += `📚 **Verified Knowledge Base Insights:**\n`;
    for (const c of citations) {
      fallbackContent += `\n**${c.chunk.title}** (${c.chunk.book}, p.${c.chunk.pageNumber}):\n${c.chunk.content}\n`;
    }
  } else {
    fallbackContent += `To enable full AI tutor responses, add your free **Gemini API key** in \`.env.local\`!`;
  }

  return {
    content: fallbackContent,
    provider: 'local',
    citations,
  };
}

/**
 * Main chat function orchestrating:
 * 1. Semantic Vector Cache lookup (0ms)
 * 2. RAG retrieval of textbook citations
 * 3. Gemini / Groq streaming with augmented prompt
 * 4. Cache write-back
 */
export async function chat(messages: ChatMessage[]): Promise<LLMResponse> {
  const startTime = Date.now();
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  // 1. Check Semantic Cache
  if (lastUserMessage) {
    const cacheResult = querySemanticCache(lastUserMessage, 0.86);
    if (cacheResult.hit && cacheResult.content) {
      const citations = retrieveRelevantPassages(lastUserMessage, { topK: 2 });
      return {
        content: cacheResult.content,
        provider: 'semantic-cache',
        cached: true,
        similarityScore: cacheResult.similarity,
        latencyMs: Date.now() - startTime,
        citations,
      };
    }
  }

  // 2. RAG Knowledge Base Retrieval
  const citations = retrieveRelevantPassages(lastUserMessage, { topK: 3 });
  const ragPromptContext = buildRagPromptContext(citations);
  const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}${ragPromptContext}`;

  // 3. Try Gemini first
  try {
    const res = await callGemini(messages, fullSystemPrompt);
    storeInSemanticCache(lastUserMessage, res.content, 'gemini');
    return {
      content: res.content,
      provider: 'gemini',
      cached: false,
      latencyMs: Date.now() - startTime,
      citations,
    };
  } catch (geminiError) {
    console.warn('Gemini call failed, falling back to Groq...', geminiError);
  }

  // 4. Try Groq as secondary
  try {
    const res = await callGroq(messages, fullSystemPrompt);
    storeInSemanticCache(lastUserMessage, res.content, 'groq');
    return {
      content: res.content,
      provider: 'groq',
      cached: false,
      latencyMs: Date.now() - startTime,
      citations,
    };
  } catch (groqError) {
    console.warn('Groq also failed, using local RAG fallback', groqError);
  }

  // 5. Local fallback
  return localFallback(messages, citations);
}

export interface GeneratedMCQ {
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

function parseGeneratedMCQs(raw: string): GeneratedMCQ[] {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const parsed = JSON.parse(cleaned);
  const list = Array.isArray(parsed) ? parsed : parsed.questions;
  if (!Array.isArray(list)) throw new Error('Model did not return a question array');

  return list.map((q: any) => {
    if (
      typeof q.questionText !== 'string' ||
      !Array.isArray(q.options) || q.options.length !== 4 ||
      typeof q.correctOption !== 'number' ||
      typeof q.explanation !== 'string'
    ) {
      throw new Error('Malformed generated question');
    }
    return {
      questionText: q.questionText,
      options: q.options,
      correctOption: q.correctOption,
      explanation: q.explanation,
    };
  });
}

/**
 * Generates MCQs strictly grounded in the given chapter notes (no outside facts),
 * for the "mark chapter read -> take chapter test" NCERT Booster flow.
 */
export async function generateChapterMCQs(
  chapterTitle: string,
  subject: string,
  notes: string[]
): Promise<GeneratedMCQ[]> {
  const prompt = `You are writing a chapter test for the NCERT ${subject} chapter "${chapterTitle}", for Indian government exam aspirants (SSC/UPSC/Banking).

Chapter notes (the ONLY source of truth — do not introduce facts not present here):
${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}

Write exactly 5 multiple-choice questions testing these notes. Respond with ONLY a JSON array, no markdown fences, no commentary, in this exact shape:
[{"questionText": string, "options": [string, string, string, string], "correctOption": 0-3, "explanation": string}]`;

  const messages: ChatMessage[] = [{ role: 'user', content: prompt }];
  const systemPrompt = 'You output only valid JSON arrays of MCQs grounded strictly in the provided notes.';

  try {
    const res = await callGemini(messages, systemPrompt);
    return parseGeneratedMCQs(res.content);
  } catch (geminiError) {
    console.warn('generateChapterMCQs: Gemini failed, falling back to Groq...', geminiError);
  }

  const res = await callGroq(messages, systemPrompt);
  return parseGeneratedMCQs(res.content);
}

// Build context for a question
export function buildQuestionContext(question: {
  questionText: string;
  options: string[];
  correctOption: number;
  explanation: string;
  topic: string;
  subject: string;
}): string {
  return `📋 **Question Context:**
Subject: ${question.subject} | Topic: ${question.topic}

**Question:** ${question.questionText}

**Options:**
${question.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}

**Correct Answer:** ${String.fromCharCode(65 + question.correctOption)}) ${question.options[question.correctOption]}

**Explanation:** ${question.explanation}`;
}
