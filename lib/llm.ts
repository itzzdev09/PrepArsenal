// PrepArsenal — LLM Gateway with RAG Engine, Semantic Cache & Multi-Provider Failover
// Server-only: reads non-public API keys, must only be imported from Route Handlers / Server Components.
import { retrieveRelevantPassages, buildRagPromptContext, type RagSearchResult } from './rag/rag-engine';
import { querySemanticCache, storeInSemanticCache } from './cache/semantic-cache';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  /** Provider that produced the answer, e.g. 'cerebras', 'groq', 'semantic-cache', 'local'. */
  provider: string;
  cached?: boolean;
  similarityScore?: number;
  latencyMs?: number;
  citations?: RagSearchResult[];
  error?: string;
  /** Ordered list of providers/keys that were tried and failed before this response. */
  attempts?: string[];
}

// Kept intentionally lean — this prompt rides on every uncached request.
const BASE_SYSTEM_PROMPT = `You are PrepArsenal AI — an elite tutor for Indian government exams (SSC CGL, UPSC Prelims, RBI Grade B, NABARD, RRB NTPC, ACIO-II, LIC AAO).
Rules:
1. Explain rigorously; surface math shortcuts and exam patterns.
2. For polity/history/economics, ground answers in NCERT / standard textbooks.
3. Structure answers with markdown headers and ✅ ❌ 💡 📌 markers.
4. If RAG citations are supplied, treat them as authoritative — never contradict or invent facts.`;

// ---------------------------------------------------------------------------
// API key pooling
//
// Every provider reads `${NAME}_API_KEYS` (comma-separated) or falls back to the
// single `${NAME}_API_KEY`. Keys round-robin, and a key that returns 429/402/403
// is put on a short cooldown so the next request skips it. Adding a second free
// account is now just another comma in an env var.
// ---------------------------------------------------------------------------

interface KeyState {
  key: string;
  cooldownUntil: number;
}
interface KeyPool {
  keys: KeyState[];
  cursor: number;
}

const keyPools = new Map<string, KeyPool>();

function getPool(envName: string): KeyPool | null {
  const cached = keyPools.get(envName);
  if (cached) return cached.keys.length ? cached : null;

  const raw = process.env[`${envName}_API_KEYS`] ?? process.env[`${envName}_API_KEY`] ?? '';
  const keys: KeyState[] = raw
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)
    .map(key => ({ key, cooldownUntil: 0 }));

  const pool: KeyPool = { keys, cursor: 0 };
  keyPools.set(envName, pool);
  return keys.length ? pool : null;
}

/** Returns the next usable key for a provider, or null if none are configured / all cooling down. */
function takeKey(envName: string): string | null {
  const pool = getPool(envName);
  if (!pool) return null;

  const now = Date.now();
  const n = pool.keys.length;
  for (let i = 0; i < n; i++) {
    const idx = (pool.cursor + i) % n;
    if (pool.keys[idx].cooldownUntil <= now) {
      pool.cursor = (idx + 1) % n;
      return pool.keys[idx].key;
    }
  }
  return null;
}

function penalizeKey(envName: string, key: string, ms: number): void {
  const pool = keyPools.get(envName);
  const ks = pool?.keys.find(k => k.key === key);
  if (ks) ks.cooldownUntil = Date.now() + Math.min(ms, 10 * 60_000);
}

// ---------------------------------------------------------------------------
// Low-level callers
// ---------------------------------------------------------------------------

class ProviderError extends Error {
  status?: number;
  retryAfterMs?: number;
  constructor(message: string, opts: { status?: number; retryAfterMs?: number } = {}) {
    super(message);
    this.name = 'ProviderError';
    this.status = opts.status;
    this.retryAfterMs = opts.retryAfterMs;
  }
}

function parseRetryAfter(res: Response): number | undefined {
  const h = res.headers.get('retry-after');
  if (!h) return undefined;
  const secs = Number(h);
  if (!Number.isNaN(secs)) return secs * 1000;
  const date = Date.parse(h);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

interface OpenAICallOpts {
  baseUrl: string;
  model: string;
  apiKey: string;
  messages: ChatMessage[];
  systemPrompt: string;
  maxTokens?: number;
  extraHeaders?: Record<string, string>;
  timeoutMs?: number;
}

/** Works for any OpenAI-compatible /chat/completions endpoint: Groq, Cerebras, Mistral, OpenRouter, GitHub Models, Ollama. */
async function callOpenAICompatible(o: OpenAICallOpts): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), o.timeoutMs ?? 30_000);
  try {
    const res = await fetch(`${o.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${o.apiKey}`,
        ...o.extraHeaders,
      },
      body: JSON.stringify({
        model: o.model,
        messages: [
          { role: 'system', content: o.systemPrompt },
          ...o.messages.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.6,
        max_tokens: o.maxTokens ?? 1536,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new ProviderError(`HTTP ${res.status} ${body.slice(0, 300)}`, {
        status: res.status,
        retryAfterMs: parseRetryAfter(res),
      });
    }

    const data = await res.json();
    const text: string | undefined = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new ProviderError('empty completion');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(opts: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  systemPrompt: string;
}): Promise<string> {
  const contents = opts.messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent?key=${opts.apiKey}`,
      {
        method: 'POST',
        cache: 'no-store',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: opts.systemPrompt }] },
          generationConfig: {
            temperature: 0.6,
            // gemini-*-flash is a "thinking" model: reasoning tokens count against
            // maxOutputTokens, so keep headroom for the answer.
            maxOutputTokens: 4096,
            // This model rejects thinkingBudget: 0 (400 INVALID_ARGUMENT); give it a
            // small positive budget instead of trying to disable thinking.
            thinkingConfig: { thinkingBudget: 512 },
          },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new ProviderError(`Gemini HTTP ${res.status} ${body.slice(0, 300)}`, {
        status: res.status,
        retryAfterMs: parseRetryAfter(res),
      });
    }

    const data = await res.json();
    const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    // Empty text usually means the thinking budget consumed the whole response
    // (finishReason: MAX_TOKENS). Treat it as a failure so the next provider takes over.
    if (!text) {
      throw new ProviderError(
        `Gemini returned no text (finishReason: ${data.candidates?.[0]?.finishReason ?? 'unknown'})`,
      );
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Provider registry — order here is the failover order.
//
// Rationale: high daily-volume + fast providers first so scarce buckets
// (Gemini req/day, OpenRouter req/day) are preserved for when they're needed.
// A self-hosted Ollama, if configured, is the last always-available network hop
// before the RAG-only local fallback.
//
// Override the order at runtime with LLM_PROVIDER_ORDER="groq,mistral,gemini,...".
// ---------------------------------------------------------------------------

interface Provider {
  name: string;
  /** Env prefix for the key pool (e.g. 'GROQ' -> GROQ_API_KEY / GROQ_API_KEYS). Omit if no key is needed. */
  keyEnv?: string;
  available(): boolean;
  run(key: string, messages: ChatMessage[], systemPrompt: string): Promise<string>;
}

const PROVIDERS: Provider[] = [
  {
    name: 'cerebras', // ~1M tokens/day free, extremely fast, 70B quality
    keyEnv: 'CEREBRAS',
    available: () => !!getPool('CEREBRAS'),
    run: (key, m, s) =>
      callOpenAICompatible({
        baseUrl: 'https://api.cerebras.ai/v1',
        model: process.env.CEREBRAS_MODEL || 'llama-3.3-70b',
        apiKey: key,
        messages: m,
        systemPrompt: s,
        maxTokens: 1536, // free tier caps context at 8192; keep output modest
      }),
  },
  {
    name: 'groq', // very high req/day on the 8B instant model, fast
    keyEnv: 'GROQ',
    available: () => !!getPool('GROQ'),
    run: (key, m, s) =>
      callOpenAICompatible({
        baseUrl: 'https://api.groq.com/openai/v1',
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        apiKey: key,
        messages: m,
        systemPrompt: s,
        maxTokens: 2048,
      }),
  },
  {
    name: 'mistral', // ~1B tokens/month free — the largest single free bucket
    keyEnv: 'MISTRAL',
    available: () => !!getPool('MISTRAL'),
    run: (key, m, s) =>
      callOpenAICompatible({
        baseUrl: 'https://api.mistral.ai/v1',
        model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
        apiKey: key,
        messages: m,
        systemPrompt: s,
        maxTokens: 2048,
      }),
  },
  {
    name: 'gemini', // ~1,500 req/day PER key — add more keys via GEMINI_API_KEYS
    keyEnv: 'GEMINI',
    available: () => !!getPool('GEMINI'),
    run: (key, m, s) =>
      callGemini({
        apiKey: key,
        model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
        messages: m,
        systemPrompt: s,
      }),
  },
  {
    name: 'openrouter', // aggregates many ":free" models behind one key
    keyEnv: 'OPENROUTER',
    available: () => !!getPool('OPENROUTER'),
    run: (key, m, s) =>
      callOpenAICompatible({
        baseUrl: 'https://openrouter.ai/api/v1',
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
        apiKey: key,
        messages: m,
        systemPrompt: s,
        maxTokens: 2048,
        extraHeaders: {
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://preparsenal.app',
          'X-Title': 'PrepArsenal',
        },
      }),
  },
  {
    name: 'github-models', // free with a GitHub PAT; independent low-RPM bucket
    keyEnv: 'GITHUB_MODELS',
    available: () => !!getPool('GITHUB_MODELS'),
    run: (key, m, s) =>
      callOpenAICompatible({
        baseUrl: process.env.GITHUB_MODELS_BASE_URL || 'https://models.github.ai/inference',
        model: process.env.GITHUB_MODELS_MODEL || 'openai/gpt-4o-mini',
        apiKey: key,
        messages: m,
        systemPrompt: s,
        maxTokens: 2048,
      }),
  },
  {
    name: 'ollama', // self-hosted SLM (qwen2.5:3b etc.) — unlimited, no rate limit
    available: () => !!process.env.OLLAMA_BASE_URL,
    run: (_key, m, s) =>
      callOpenAICompatible({
        baseUrl: process.env.OLLAMA_BASE_URL!,
        model: process.env.OLLAMA_MODEL || 'qwen2.5:3b',
        apiKey: 'ollama', // Ollama ignores auth; header kept for the shared caller
        messages: m,
        systemPrompt: s,
        maxTokens: 1536,
        timeoutMs: 60_000, // CPU inference can be slow
      }),
  },
];

function orderedProviders(): Provider[] {
  const order = (process.env.LLM_PROVIDER_ORDER || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  if (!order.length) return PROVIDERS;

  const byName = new Map(PROVIDERS.map(p => [p.name, p]));
  const picked: Provider[] = [];
  for (const n of order) {
    const p = byName.get(n);
    if (p && !picked.includes(p)) picked.push(p);
  }
  for (const p of PROVIDERS) if (!picked.includes(p)) picked.push(p); // append the rest
  return picked;
}

// Max keys to burn on a single provider within one request before moving on.
const MAX_KEYS_PER_PROVIDER_PER_REQUEST = 2;

// ---------------------------------------------------------------------------
// Local fallback (RAG-only, no LLM)
// ---------------------------------------------------------------------------

function localFallback(messages: ChatMessage[], citations: RagSearchResult[]): LLMResponse {
  const lastMessage = messages[messages.length - 1]?.content || '';

  let content = `⚠️ **AI Tutor running in offline mode**\n\nI noticed you asked: "${lastMessage.slice(0, 100)}..."\n\n`;

  if (citations.length > 0) {
    content += `📚 **Verified Knowledge Base Insights:**\n`;
    for (const c of citations) {
      content += `\n**${c.chunk.title}** (${c.chunk.book}, p.${c.chunk.pageNumber}):\n${c.chunk.content}\n`;
    }
  } else {
    content += `Every free AI provider is currently rate-limited or unconfigured. Add more free keys (see \`.env.example\`) or a self-hosted \`OLLAMA_BASE_URL\` to restore full answers.`;
  }

  return { content, provider: 'local', citations };
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

/**
 * Main chat function:
 * 1. Semantic vector cache lookup (~0ms)
 * 2. RAG retrieval of textbook citations
 * 3. Multi-provider failover with per-key quota cooldowns
 * 4. Cache write-back
 * 5. RAG-only local fallback
 */
export async function chat(messages: ChatMessage[]): Promise<LLMResponse> {
  const startTime = Date.now();
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  // 1. Semantic cache
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

  // 2. RAG knowledge base retrieval
  const citations = retrieveRelevantPassages(lastUserMessage, { topK: 2 });
  const ragPromptContext = buildRagPromptContext(citations);
  const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}${ragPromptContext}`;

  // 3. Provider failover with key pooling
  const attempts: string[] = [];
  for (const provider of orderedProviders()) {
    if (!provider.available()) continue;

    for (let k = 0; k < MAX_KEYS_PER_PROVIDER_PER_REQUEST; k++) {
      const key = provider.keyEnv ? takeKey(provider.keyEnv) : '';
      if (key === null) break; // configured but every key is cooling down

      try {
        const content = await provider.run(key, messages, fullSystemPrompt);
        storeInSemanticCache(lastUserMessage, content, provider.name);
        return {
          content,
          provider: provider.name,
          cached: false,
          latencyMs: Date.now() - startTime,
          citations,
          attempts: attempts.length ? attempts : undefined,
        };
      } catch (err) {
        const pe = err as ProviderError;
        const status = pe?.status;
        attempts.push(`${provider.name}:${status ?? pe?.name ?? 'error'}`);
        console.warn(`[llm] ${provider.name} failed:`, pe?.message);

        // Quota / auth failures → cool this key down and try the next one.
        if (provider.keyEnv && key && (status === 429 || status === 402 || status === 403)) {
          penalizeKey(provider.keyEnv, key, pe.retryAfterMs ?? 60_000);
          continue;
        }
        break; // transient/other error → next provider
      }
    }
  }

  // 4. Local RAG-only fallback
  const fb = localFallback(messages, citations);
  fb.latencyMs = Date.now() - startTime;
  fb.attempts = attempts;
  return fb;
}

/** Snapshot of provider/key configuration and cooldown state — for /api/health. */
export function getProviderStatus(): Array<{
  name: string;
  configured: boolean;
  keys: number;
  keysCoolingDown: number;
}> {
  const now = Date.now();
  return PROVIDERS.map(p => {
    if (!p.keyEnv) {
      const configured = p.available();
      return { name: p.name, configured, keys: configured ? 1 : 0, keysCoolingDown: 0 };
    }
    getPool(p.keyEnv); // ensure the pool is parsed & cached
    const keys = keyPools.get(p.keyEnv)?.keys ?? [];
    return {
      name: p.name,
      configured: keys.length > 0,
      keys: keys.length,
      keysCoolingDown: keys.filter(k => k.cooldownUntil > now).length,
    };
  });
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
