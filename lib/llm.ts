// PrepArsenal — LLM Gateway (Gemini primary, Groq fallback)

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LLMResponse {
  content: string;
  provider: 'gemini' | 'groq' | 'local';
  error?: string;
}

const SYSTEM_PROMPT = `You are PrepArsenal AI — an expert tutor for Indian government competitive exams (SSC CGL, RBI Grade B, NABARD, SEBI, RRB NTPC, UPSC APFO, LIC AAO, ACIO-II, IRDAI).

Your job is to:
1. Explain concepts clearly with examples
2. Break down problem-solving into step-by-step approaches
3. Share shortcuts and tricks commonly used in competitive exams
4. Relate topics to exam patterns — what gets asked and how
5. Use simple language — many users are Hindi-medium or come from non-English backgrounds

When explaining math problems:
- Show the complete working
- Highlight the shortcut method vs. the long method
- Mention if this type of question is frequently asked

When explaining GK/GA:
- Give context and connections to related facts
- Mention if this is a "repeat" topic in exams

Be encouraging, concise, and exam-focused. Use ✅ ❌ 💡 📌 emojis to make explanations scannable.`;

async function callGemini(messages: ChatMessage[]): Promise<LLMResponse> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
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
          parts: [{ text: SYSTEM_PROMPT }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
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
  
  return { content: text, provider: 'gemini' };
}

async function callGroq(messages: ChatMessage[]): Promise<LLMResponse> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  const formattedMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
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
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || 'No response generated';
  
  return { content: text, provider: 'groq' };
}

// Local fallback — basic responses without API
function localFallback(messages: ChatMessage[]): LLMResponse {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  const content = `⚠️ **AI Tutor is running in offline mode** (no API keys configured)

I noticed you asked: "${lastMessage.slice(0, 100)}..."

To enable the full AI tutor experience:
1. Get a free **Gemini API key** from [Google AI Studio](https://aistudio.google.com)
2. Get a free **Groq API key** from [Groq Console](https://console.groq.com)
3. Add them to your \`.env.local\` file:
   \`\`\`
   NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
   NEXT_PUBLIC_GROQ_API_KEY=your_key_here
   \`\`\`

💡 **Meanwhile, check the explanation below the question for a detailed breakdown!**`;

  return { content, provider: 'local' };
}

// Main chat function with failover
export async function chat(messages: ChatMessage[]): Promise<LLMResponse> {
  // Try Gemini first
  try {
    return await callGemini(messages);
  } catch (geminiError) {
    console.warn('Gemini failed, trying Groq...', geminiError);
  }

  // Try Groq as fallback
  try {
    return await callGroq(messages);
  } catch (groqError) {
    console.warn('Groq also failed, using local fallback', groqError);
  }

  // Local fallback
  return localFallback(messages);
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
