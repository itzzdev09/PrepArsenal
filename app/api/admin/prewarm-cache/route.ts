import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { chat } from '@/lib/llm';
import { vectorCacheAvailable, getVectorCacheStats } from '@/lib/cache/semantic-cache-store';
import { DEFAULT_PREWARM_QUERIES } from '@/lib/cache/prewarm-queries';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Authorise either a signed-in user (admin dashboard button) or a cron caller
// presenting `Authorization: Bearer ${CRON_SECRET}`.
async function authorize(request: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) {
    return true;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

export async function GET(request: Request) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    available: vectorCacheAvailable(),
    defaultQueryCount: DEFAULT_PREWARM_QUERIES.length,
    stats: await getVectorCacheStats(),
  });
}

export async function POST(request: Request) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!vectorCacheAvailable()) {
    return NextResponse.json(
      {
        error:
          'Persistent semantic cache is not configured. Needs an embeddings backend (GEMINI_API_KEY or OLLAMA_BASE_URL) plus Supabase, and the supabase/semantic_cache.sql migration applied.',
      },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    queries?: unknown;
    limit?: unknown;
    delayMs?: unknown;
  };

  const custom = Array.isArray(body.queries)
    ? body.queries.filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
    : [];
  const limit = Math.min(Math.max(Number(body.limit) || 40, 1), 200);
  const delayMs = Math.min(Math.max(Number(body.delayMs) || 400, 0), 5000);

  const queries = (custom.length ? custom : DEFAULT_PREWARM_QUERIES).slice(0, limit);

  const started = Date.now();
  const results: Array<{ query: string; provider: string; ms: number }> = [];

  for (const q of queries) {
    const t = Date.now();
    try {
      const res = await chat([{ role: 'user', content: q }]);
      results.push({ query: q, provider: res.provider, ms: Date.now() - t });
    } catch (err) {
      results.push({ query: q, provider: 'error', ms: Date.now() - t });
      console.warn('[prewarm] failed for', JSON.stringify(q), (err as Error).message);
    }
    if (delayMs) await new Promise(r => setTimeout(r, delayMs));
  }

  const byProvider = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.provider] = (acc[r.provider] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    totalMs: Date.now() - started,
    requested: queries.length,
    warmed: results.filter(r => r.provider !== 'error' && r.provider !== 'local').length,
    fellBackToLocal: byProvider['local'] ?? 0,
    failed: byProvider['error'] ?? 0,
    byProvider,
    stats: await getVectorCacheStats(),
    results,
  });
}
