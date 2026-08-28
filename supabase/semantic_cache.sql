-- =========================================================
-- PrepArsenal: Persistent Semantic LLM Cache (pgvector)
--
-- Stores past AI-tutor answers keyed by an embedding of the user's question so
-- that paraphrased repeats are served from Postgres instead of burning a free
-- LLM provider quota. This is the shared L2 behind the per-instance in-memory
-- L1 cache in lib/cache/semantic-cache.ts.
--
-- Embedding dimension 768 == Gemini `text-embedding-004` == Ollama
-- `nomic-embed-text`. If you switch EMBEDDINGS_MODEL to something with a
-- different native size, set outputDimensionality to 768 or migrate this column.
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.semantic_cache (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query        TEXT NOT NULL,
    query_norm   TEXT NOT NULL,
    response     TEXT NOT NULL,
    provider     TEXT NOT NULL DEFAULT 'unknown',
    embedding    vector(768) NOT NULL,
    model        TEXT NOT NULL DEFAULT 'text-embedding-004',
    hit_count    INT NOT NULL DEFAULT 0,
    tokens_saved INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_hit_at  TIMESTAMPTZ
);

-- One row per normalised question (upsert target for write-back).
CREATE UNIQUE INDEX IF NOT EXISTS uq_semantic_cache_query_norm
    ON public.semantic_cache (query_norm);

-- Approximate nearest-neighbour index for cosine distance (pgvector >= 0.5).
CREATE INDEX IF NOT EXISTS idx_semantic_cache_embedding
    ON public.semantic_cache USING hnsw (embedding vector_cosine_ops);

-- Similarity search: rows whose cosine similarity >= match_threshold, closest first.
CREATE OR REPLACE FUNCTION public.match_semantic_cache(
    query_embedding vector(768),
    match_threshold  float DEFAULT 0.9,
    match_count      int   DEFAULT 1
)
RETURNS TABLE (
    id           uuid,
    query        text,
    response     text,
    provider     text,
    tokens_saved int,
    similarity   float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        c.id,
        c.query,
        c.response,
        c.provider,
        c.tokens_saved,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM public.semantic_cache c
    WHERE 1 - (c.embedding <=> query_embedding) >= match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Bump hit stats when a cached row is served.
CREATE OR REPLACE FUNCTION public.touch_semantic_cache(row_id uuid)
RETURNS void
LANGUAGE sql
AS $$
    UPDATE public.semantic_cache
    SET hit_count = hit_count + 1,
        last_hit_at = NOW()
    WHERE id = row_id;
$$;

-- ---------------------------------------------------------
-- Access control
-- ---------------------------------------------------------
ALTER TABLE public.semantic_cache ENABLE ROW LEVEL SECURITY;

-- Derived, non-sensitive data. Reads are open. The permissive write policies
-- keep the feature working when only the anon key is configured on the server.
-- In production, set SUPABASE_SERVICE_ROLE_KEY (which bypasses RLS) and tighten
-- the INSERT/UPDATE policies to `TO service_role`.
DROP POLICY IF EXISTS "semantic_cache read"   ON public.semantic_cache;
DROP POLICY IF EXISTS "semantic_cache insert" ON public.semantic_cache;
DROP POLICY IF EXISTS "semantic_cache update" ON public.semantic_cache;
CREATE POLICY "semantic_cache read"   ON public.semantic_cache FOR SELECT USING (true);
CREATE POLICY "semantic_cache insert" ON public.semantic_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "semantic_cache update" ON public.semantic_cache FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON public.semantic_cache TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.match_semantic_cache(vector, float, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.touch_semantic_cache(uuid) TO anon, authenticated, service_role;
