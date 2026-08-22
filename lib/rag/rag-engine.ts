// PrepArsenal — Hybrid RAG Retrieval Engine
// Lexical BM25 + Vector Similarity for Verbatim Exam Knowledge Citations

import { KNOWLEDGE_CORPUS, type KnowledgeChunk } from './knowledge-corpus';

export interface RagSearchResult {
  chunk: KnowledgeChunk;
  score: number;
  matchedKeywords: string[];
  citationBadge: string;
}

// Tokenize and clean text
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

// Compute term frequency vector
function getTermFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

// Vector Cosine Similarity
function cosineSimilarity(tfA: Map<string, number>, tfB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, count] of tfA.entries()) {
    normA += count * count;
    if (tfB.has(term)) {
      dotProduct += count * (tfB.get(term) || 0);
    }
  }

  for (const count of tfB.values()) {
    normB += count * count;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Hybrid Search combining exact tag matching, lexical TF-IDF, and vector cosine similarity
 */
export function retrieveRelevantPassages(
  query: string,
  options: { subject?: string; topK?: number; minScore?: number } = {}
): RagSearchResult[] {
  const { subject, topK = 3, minScore = 0.12 } = options;
  const queryTokens = tokenize(query);
  const queryTf = getTermFrequencies(queryTokens);

  if (queryTokens.length === 0) return [];

  const scoredResults: RagSearchResult[] = [];

  for (const chunk of KNOWLEDGE_CORPUS) {
    if (subject && chunk.subject.toLowerCase() !== subject.toLowerCase()) {
      // Allow cross-subject if generic, else skip
      continue;
    }

    // 1. Tag matching bonus
    let tagMatches = 0;
    const lowerQuery = query.toLowerCase();
    const matchedKeywords: string[] = [];

    for (const tag of chunk.tags) {
      if (lowerQuery.includes(tag.toLowerCase())) {
        tagMatches += 1.5;
        matchedKeywords.push(tag);
      }
    }

    // 2. Lexical & Vector score on content and title
    const chunkTokens = tokenize(`${chunk.title} ${chunk.content} ${chunk.topic}`);
    const chunkTf = getTermFrequencies(chunkTokens);
    const vectorScore = cosineSimilarity(queryTf, chunkTf);

    // 3. Keyword overlap score
    let keywordOverlap = 0;
    for (const qToken of queryTokens) {
      if (chunkTf.has(qToken)) {
        keywordOverlap += 0.2;
      }
    }

    const totalScore = vectorScore * 0.6 + tagMatches * 0.3 + keywordOverlap * 0.1;

    if (totalScore >= minScore) {
      scoredResults.push({
        chunk,
        score: Math.min(Number(totalScore.toFixed(3)), 1.0),
        matchedKeywords,
        citationBadge: `[${chunk.book} • ${chunk.editionOrClass} • p.${chunk.pageNumber}]`,
      });
    }
  }

  // Sort descending by score
  return scoredResults.sort((a, b) => b.score - a.score).slice(0, topK);
}

/**
 * Formats retrieved RAG context for injection into LLM system prompt
 */
export function buildRagPromptContext(results: RagSearchResult[]): string {
  if (results.length === 0) return '';

  let contextText = '\n\n📚 **VERIFIED TEXTBOOK CITATIONS & KNOWLEDGE RETRIEVAL (RAG):**\n';
  contextText += 'Use the following exact textbook passages to provide authoritative, zero-hallucination explanations. When applicable, quote the book and chapter citation:\n\n';

  for (const [idx, item] of results.entries()) {
    contextText += `[Citation Source ${idx + 1}]:\n`;
    contextText += `• Source: ${item.chunk.book} (${item.chunk.editionOrClass}, p.${item.chunk.pageNumber})\n`;
    contextText += `• Chapter/Topic: ${item.chunk.chapter} (${item.chunk.topic})\n`;
    contextText += `• Historical PYQ Frequency: ${item.chunk.pyqFrequency} (Asked in: ${item.chunk.examMentions.join(', ')})\n`;
    contextText += `• Verified Content:\n${item.chunk.content}\n\n`;
  }

  return contextText;
}
