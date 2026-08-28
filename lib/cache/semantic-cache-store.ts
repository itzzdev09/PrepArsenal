// PrepArsenal — Persistent semantic cache (L2), backed by Supabase + pgvector.
// Server-only. Sits behind the in-process L1 cache in ./semantic-cache.ts.
//
// Every function here is failure-tolerant: a lookup returns null and a write is
// a no-op if embeddings or Supabase are unavailable. The AI tutor must keep
// working even when the cache layer is down.
import 'server-only';
import { embedText, embeddingsConfigured } from '@/lib/embeddings';
import { getAdminSupabase } from '@/lib/supabase/admin';

const TABLE = 'semantic_cache';

export interface VectorCacheHit {
  content: string;
  provider: string;
  similarity: number;
  tokensSaved: number;
}

function minSimilarity(): number {
  const v = Number(process.env.SEMANTIC_CACHE_MIN_SIMILARITY);
  return Number.isFinite(v) && v > 0 && v <= 1 ? v : 0.92;
}

function normalize(query: string): string {
  return query.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 2000);
}

/** True if the persistent cache can actually be used (embeddings + Supabase configured). */
export function vectorCacheAvailable(): boolean {
  return embeddingsConfigured() && !!getAdminSupabase();
}

/**
 * L2 lookup. Never throws — returns null on miss or on any failure.
 */
export async function queryVectorCache(query: string): Promise<VectorCacheHit | null> {
  if (!vectorCacheAvailable()) return null;
  const supabase = getAdminSupabase()!;

  try {
    const embedding = await embedText(query);
    const { data, error } = await supabase.rpc('match_semantic_cache', {
      query_embedding: embedding,
      match_threshold: minSimilarity(),
      match_count: 1,
    });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : null;
    if (!row?.response) return null;

    // Fire-and-forget hit-stat bump.
    void supabase.rpc('touch_semantic_cache', { row_id: row.id });

    return {
      content: row.response,
      provider: row.provider ?? 'semantic-cache',
      similarity: Number(row.similarity ?? 0),
      tokensSaved: row.tokens_saved ?? 0,
    };
  } catch (err) {
    console.warn('[semantic-cache L2] lookup failed:', (err as Error).message);
    return null;
  }
}

/**
 * L2 write-back. Never throws. Upserts on the normalised query so repeated
 * answers for the same question just refresh the stored response.
 */
export async function storeVectorCache(
  query: string,
  response: string,
  provider: string,
): Promise<void> {
  if (!vectorCacheAvailable()) return;
  const supabase = getAdminSupabase()!;

  const queryNorm = normalize(query);
  if (!queryNorm || !response) return;

  try {
    const embedding = await embedText(query); // served from memo after a preceding lookup
    const { error } = await supabase.from(TABLE).upsert(
      {
        query: query.slice(0, 4000),
        query_norm: queryNorm,
        response,
        provider,
        embedding,
        model: process.env.EMBEDDINGS_MODEL || 'text-embedding-004',
        tokens_saved: Math.ceil(response.length / 4),
      },
      { onConflict: 'query_norm' },
    );
    if (error) throw error;
  } catch (err) {
    console.warn('[semantic-cache L2] store failed:', (err as Error).message);
  }
}

/** Aggregate stats for /api/health and the admin dashboard. Never throws. */
export async function getVectorCacheStats(): Promise<{
  available: boolean;
  entries: number;
  totalHits: number;
  tokensSaved: number;
} | null> {
  if (!vectorCacheAvailable()) return { available: false, entries: 0, totalHits: 0, tokensSaved: 0 };
  const supabase = getAdminSupabase()!;
  try {
    const { count } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true });
    const { data } = await supabase.from(TABLE).select('hit_count, tokens_saved').limit(10_000);
    const totalHits = (data ?? []).reduce((a, r) => a + (r.hit_count ?? 0), 0);
    const tokensSaved = (data ?? []).reduce((a, r) => a + (r.tokens_saved ?? 0) * (r.hit_count ?? 0), 0);
    return { available: true, entries: count ?? 0, totalHits, tokensSaved };
  } catch (err) {
    console.warn('[semantic-cache L2] stats failed:', (err as Error).message);
    return { available: true, entries: 0, totalHits: 0, tokensSaved: 0 };
  }
}
