// PrepArsenal — Embedding gateway for the persistent semantic cache
// Server-only: reads non-public API keys.
import 'server-only';

export const EMBEDDING_DIM = 768;

// Short-lived memo so a cache MISS (which embeds the query to search L2) and the
// subsequent write-back (which needs the same embedding) only pay for one call.
const memo = new Map<string, { v: number[]; t: number }>();
const MEMO_TTL_MS = 5 * 60_000;
const MEMO_MAX = 500;

function memoGet(key: string): number[] | null {
  const e = memo.get(key);
  if (!e) return null;
  if (Date.now() - e.t > MEMO_TTL_MS) {
    memo.delete(key);
    return null;
  }
  return e.v;
}

function memoSet(key: string, v: number[]): void {
  if (memo.size >= MEMO_MAX) {
    const oldest = memo.keys().next().value;
    if (oldest !== undefined) memo.delete(oldest);
  }
  memo.set(key, { v, t: Date.now() });
}

function geminiKeys(): string[] {
  const raw = process.env.GEMINI_API_KEYS ?? process.env.GEMINI_API_KEY ?? '';
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

let geminiCursor = 0;

async function embedWithGemini(text: string): Promise<number[]> {
  const keys = geminiKeys();
  if (!keys.length) throw new Error('no Gemini key configured for embeddings');

  const key = keys[geminiCursor++ % keys.length];
  const model = process.env.EMBEDDINGS_MODEL || 'text-embedding-004';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${key}`,
      {
        method: 'POST',
        cache: 'no-store',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${model}`,
          content: { parts: [{ text }] },
          outputDimensionality: EMBEDDING_DIM,
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Gemini embed HTTP ${res.status} ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const values: number[] | undefined = data.embedding?.values;
    if (!values?.length) throw new Error('Gemini embed: empty vector');
    return values;
  } finally {
    clearTimeout(timer);
  }
}

async function embedWithOllama(text: string): Promise<number[]> {
  const base = process.env.OLLAMA_BASE_URL;
  if (!base) throw new Error('no OLLAMA_BASE_URL configured for embeddings');

  const model = process.env.OLLAMA_EMBEDDINGS_MODEL || 'nomic-embed-text';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/embeddings`, {
      method: 'POST',
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ollama' },
      body: JSON.stringify({ model, input: text }),
    });
    if (!res.ok) throw new Error(`Ollama embed HTTP ${res.status}`);
    const data = await res.json();
    const values: number[] | undefined = data.data?.[0]?.embedding ?? data.embedding;
    if (!values?.length) throw new Error('Ollama embed: empty vector');
    return values;
  } finally {
    clearTimeout(timer);
  }
}

/** True if at least one embedding backend is configured. */
export function embeddingsConfigured(): boolean {
  return geminiKeys().length > 0 || !!process.env.OLLAMA_BASE_URL;
}

/**
 * Embed `text` into a 768-d vector. Tries backends in EMBEDDINGS_ORDER
 * (default "gemini,ollama"). Throws only if every configured backend fails.
 */
export async function embedText(text: string): Promise<number[]> {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 8000);
  if (!clean) throw new Error('embedText: empty input');

  const cached = memoGet(clean);
  if (cached) return cached;

  const order = (process.env.EMBEDDINGS_ORDER || 'gemini,ollama')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  let lastErr: unknown;
  for (const backend of order) {
    try {
      const v = backend === 'ollama' ? await embedWithOllama(clean) : await embedWithGemini(clean);
      if (v.length !== EMBEDDING_DIM) {
        throw new Error(
          `${backend} returned ${v.length} dims, expected ${EMBEDDING_DIM} — set EMBEDDINGS_MODEL to a 768-d model`,
        );
      }
      memoSet(clean, v);
      return v;
    } catch (err) {
      lastErr = err;
      console.warn(`[embeddings] ${backend} failed:`, (err as Error).message);
    }
  }
  throw new Error(`all embedding backends failed: ${(lastErr as Error)?.message ?? String(lastErr)}`);
}
