// PrepArsenal — Knowledge Graph Engine
// Models topic-concept relationships for GraphRAG multi-hop retrieval
// and weakness propagation across related topics.
//
// Graph is constructed from:
//   1. Static taxonomy (parent_topic_id from topics table)
//   2. Co-occurrence mining (topics appearing in same exam papers)
//   3. Hardcoded prerequisite/related-concept edges
//
// The graph is lightweight (~60 nodes) and built in-memory on demand.

import type { TrendAnalytics } from '../db';
import type { Question, Topic } from '../data';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export type EdgeType =
  | 'prerequisite_of'   // A is a prerequisite to understand B
  | 'subtopic_of'       // A is a subtopic of B (taxonomy)
  | 'co_occurs_with'    // A and B frequently appear in the same exam/paper
  | 'same_concept_as'   // A and B cover the same underlying concept
  | 'difficulty_next';  // B is the harder progression of A

export interface TopicNode {
  id: string;
  name: string;
  subject: string;
  /** Aggregated importance from trends, frequency, etc. */
  importance: number;
  metadata: Record<string, unknown>;
}

export interface TopicEdge {
  source: string;   // topic ID
  target: string;   // topic ID
  type: EdgeType;
  weight: number;   // 0–1 strength
  /** Human-readable reason for this edge. */
  reason: string;
}

export interface KnowledgeGraph {
  nodes: Map<string, TopicNode>;
  adjacency: Map<string, TopicEdge[]>;  // source → outgoing edges
  reverseAdj: Map<string, TopicEdge[]>; // target → incoming edges
}

export interface TraversalResult {
  topicId: string;
  topicName: string;
  subject: string;
  distance: number;       // hops from the origin
  pathScore: number;      // product of edge weights along path
  path: string[];         // topic IDs from origin to this node
  edgeTypes: EdgeType[];  // edge types along the path
}

export interface WeaknessExpansion {
  originalTopic: string;
  expandedTopics: Array<{
    topicId: string;
    topicName: string;
    propagationScore: number; // 0–1: how much the weakness "bleeds" here
    reason: string;
  }>;
}

// ────────────────────────────────────────────
// Hardcoded prerequisite / related-concept edges
// ────────────────────────────────────────────
// These encode domain knowledge about which topics are pedagogically linked.
// Keys are lowercase topic name substrings → related topic name substrings.

const PREREQUISITE_RULES: Array<{ from: string; to: string; type: EdgeType; weight: number; reason: string }> = [
  // Quant chains
  { from: 'percentage', to: 'profit', type: 'prerequisite_of', weight: 0.9, reason: 'Profit & Loss builds on percentage concepts' },
  { from: 'percentage', to: 'si/ci', type: 'prerequisite_of', weight: 0.85, reason: 'Simple/Compound Interest requires percentage' },
  { from: 'percentage', to: 'interest', type: 'prerequisite_of', weight: 0.85, reason: 'Interest calculations require percentage' },
  { from: 'ratio', to: 'mixture', type: 'prerequisite_of', weight: 0.8, reason: 'Mixture & Alligation requires ratio concepts' },
  { from: 'ratio', to: 'partnership', type: 'prerequisite_of', weight: 0.8, reason: 'Partnership problems use ratio' },
  { from: 'speed', to: 'time and work', type: 'same_concept_as', weight: 0.7, reason: 'Time & Work and Speed share inverse-proportion logic' },
  { from: 'algebra', to: 'quadratic', type: 'prerequisite_of', weight: 0.85, reason: 'Quadratic equations require algebraic foundations' },
  { from: 'number system', to: 'hcf', type: 'prerequisite_of', weight: 0.8, reason: 'HCF/LCM builds on number system' },
  { from: 'number system', to: 'lcm', type: 'prerequisite_of', weight: 0.8, reason: 'HCF/LCM builds on number system' },
  { from: 'trigonometry', to: 'height', type: 'prerequisite_of', weight: 0.9, reason: 'Heights & Distances applies trigonometry' },
  { from: 'mensuration', to: 'geometry', type: 'same_concept_as', weight: 0.7, reason: 'Mensuration and Geometry share spatial reasoning' },

  // Polity chains
  { from: 'fundamental rights', to: 'writs', type: 'prerequisite_of', weight: 0.9, reason: 'Writs enforce Fundamental Rights (Art 32)' },
  { from: 'fundamental rights', to: 'directive', type: 'same_concept_as', weight: 0.7, reason: 'FRs and DPSPs are related constitutional concepts' },
  { from: 'preamble', to: 'basic structure', type: 'prerequisite_of', weight: 0.85, reason: 'Basic Structure doctrine rooted in Preamble' },
  { from: 'parliament', to: 'legislative', type: 'subtopic_of', weight: 0.8, reason: 'Legislative process is part of Parliament' },
  { from: 'president', to: 'executive', type: 'subtopic_of', weight: 0.8, reason: 'President is head of Executive' },
  { from: 'amendment', to: 'basic structure', type: 'prerequisite_of', weight: 0.85, reason: 'Basic Structure limits amendment power' },
  { from: 'judiciary', to: 'judicial review', type: 'subtopic_of', weight: 0.9, reason: 'Judicial Review is a key judiciary concept' },

  // Economics chains
  { from: 'monetary policy', to: 'inflation', type: 'prerequisite_of', weight: 0.85, reason: 'Monetary policy tools target inflation' },
  { from: 'fiscal policy', to: 'budget', type: 'prerequisite_of', weight: 0.8, reason: 'Budget is the instrument of fiscal policy' },
  { from: 'gdp', to: 'national income', type: 'same_concept_as', weight: 0.9, reason: 'GDP and National Income are related measures' },
  { from: 'banking', to: 'monetary policy', type: 'prerequisite_of', weight: 0.8, reason: 'Monetary policy operates through banking system' },
  { from: 'taxation', to: 'gst', type: 'subtopic_of', weight: 0.85, reason: 'GST is a taxation mechanism' },

  // Reasoning chains
  { from: 'coding', to: 'decoding', type: 'same_concept_as', weight: 0.95, reason: 'Coding-Decoding is a single topic' },
  { from: 'syllogism', to: 'logical', type: 'same_concept_as', weight: 0.7, reason: 'Syllogism is a form of logical reasoning' },
  { from: 'series', to: 'pattern', type: 'same_concept_as', weight: 0.75, reason: 'Series and pattern recognition are related' },
  { from: 'analogy', to: 'classification', type: 'same_concept_as', weight: 0.7, reason: 'Analogy and Classification share comparison logic' },
];

// ────────────────────────────────────────────
// Graph Construction
// ────────────────────────────────────────────

/**
 * Build the knowledge graph from available data.
 * @param topics - Topic taxonomy from DB
 * @param trends - Trend analytics for importance weighting
 * @param questions - Questions for co-occurrence mining
 */
export function buildKnowledgeGraph(
  topics: Topic[],
  trends: TrendAnalytics[] = [],
  questions: Question[] = [],
): KnowledgeGraph {
  const nodes = new Map<string, TopicNode>();
  const adjacency = new Map<string, TopicEdge[]>();
  const reverseAdj = new Map<string, TopicEdge[]>();

  // Helper to add edge
  function addEdge(edge: TopicEdge) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    adjacency.get(edge.source)!.push(edge);
    if (!reverseAdj.has(edge.target)) reverseAdj.set(edge.target, []);
    reverseAdj.get(edge.target)!.push(edge);
  }

  // 1. Build nodes from topics
  for (const topic of topics) {
    const trendData = trends.find(t => t.topic_id === topic.id);
    const importance = trendData
      ? (trendData.prediction_score / 100)
      : 0.5;

    nodes.set(topic.id, {
      id: topic.id,
      name: topic.name,
      subject: topic.subject,
      importance,
      metadata: {},
    });
  }

  // 2. Taxonomy edges (parent_topic_id → subtopic_of)
  for (const topic of topics) {
    if (topic.parentTopic && nodes.has(topic.parentTopic)) {
      addEdge({
        source: topic.id,
        target: topic.parentTopic,
        type: 'subtopic_of',
        weight: 0.8,
        reason: `${topic.name} is a subtopic of ${nodes.get(topic.parentTopic)!.name}`,
      });
    }
  }

  // 3. Prerequisite/related edges from hardcoded rules
  const topicList = [...nodes.values()];
  for (const rule of PREREQUISITE_RULES) {
    const fromTopics = topicList.filter(t =>
      t.name.toLowerCase().includes(rule.from),
    );
    const toTopics = topicList.filter(t =>
      t.name.toLowerCase().includes(rule.to),
    );

    for (const from of fromTopics) {
      for (const to of toTopics) {
        if (from.id !== to.id) {
          addEdge({
            source: from.id,
            target: to.id,
            type: rule.type,
            weight: rule.weight,
            reason: rule.reason,
          });
        }
      }
    }
  }

  // 4. Co-occurrence mining from questions
  // Topics that appear together in questions for the same exam+year → co_occurs_with
  const examYearTopics = new Map<string, Set<string>>();
  for (const q of questions) {
    const key = `${q.examCode}_${q.year}`;
    if (!examYearTopics.has(key)) examYearTopics.set(key, new Set());
    examYearTopics.get(key)!.add(q.topic);
  }

  // Build co-occurrence counts
  const coOccurrence = new Map<string, number>();
  for (const [, topicSet] of examYearTopics) {
    const arr = [...topicSet];
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const pair = [arr[i], arr[j]].sort().join('|||');
        coOccurrence.set(pair, (coOccurrence.get(pair) || 0) + 1);
      }
    }
  }

  // Add edges for pairs with 2+ co-occurrences
  for (const [pair, count] of coOccurrence) {
    if (count < 2) continue;
    const [a, b] = pair.split('|||');
    // Find topic IDs that match these topic names
    const nodeA = topicList.find(t => t.name === a || t.id === a);
    const nodeB = topicList.find(t => t.name === b || t.id === b);
    if (nodeA && nodeB) {
      const weight = Math.min(0.9, 0.3 + count * 0.1);
      addEdge({
        source: nodeA.id,
        target: nodeB.id,
        type: 'co_occurs_with',
        weight,
        reason: `Appeared together in ${count} exam papers`,
      });
    }
  }

  return { nodes, adjacency, reverseAdj };
}

// ────────────────────────────────────────────
// Graph Traversal
// ────────────────────────────────────────────

/**
 * BFS traversal from a starting topic, returning related topics
 * ranked by path score (product of edge weights).
 */
export function getRelatedTopics(
  graph: KnowledgeGraph,
  startTopicId: string,
  options: {
    maxDepth?: number;
    maxResults?: number;
    edgeTypes?: EdgeType[];
    minPathScore?: number;
  } = {},
): TraversalResult[] {
  const { maxDepth = 2, maxResults = 10, edgeTypes, minPathScore = 0.1 } = options;
  const startNode = graph.nodes.get(startTopicId);
  if (!startNode) return [];

  const results: TraversalResult[] = [];
  const visited = new Set<string>([startTopicId]);

  // BFS queue: [topicId, distance, pathScore, path, edgeTypesAlongPath]
  const queue: Array<[string, number, number, string[], EdgeType[]]> = [
    [startTopicId, 0, 1.0, [startTopicId], []],
  ];

  while (queue.length > 0) {
    const [currentId, dist, score, path, pathEdges] = queue.shift()!;

    if (dist > 0) {
      const node = graph.nodes.get(currentId);
      if (node && score >= minPathScore) {
        results.push({
          topicId: currentId,
          topicName: node.name,
          subject: node.subject,
          distance: dist,
          pathScore: Number(score.toFixed(3)),
          path,
          edgeTypes: pathEdges,
        });
      }
    }

    if (dist >= maxDepth) continue;

    // Traverse outgoing edges
    const edges = graph.adjacency.get(currentId) || [];
    // Also traverse incoming edges (bidirectional traversal)
    const reverseEdges = (graph.reverseAdj.get(currentId) || []).map(e => ({
      ...e,
      // Flip source/target for reverse traversal
      source: e.target,
      target: e.source,
    }));

    const allEdges = [...edges, ...reverseEdges];

    for (const edge of allEdges) {
      const nextId = edge.target === currentId ? edge.source : edge.target;
      if (visited.has(nextId)) continue;
      if (edgeTypes && !edgeTypes.includes(edge.type)) continue;

      visited.add(nextId);
      queue.push([
        nextId,
        dist + 1,
        score * edge.weight,
        [...path, nextId],
        [...pathEdges, edge.type],
      ]);
    }
  }

  // Sort by path score descending, return top N
  return results
    .sort((a, b) => b.pathScore - a.pathScore)
    .slice(0, maxResults);
}

/**
 * Get the prerequisite chain for a topic (follow prerequisite_of edges backwards).
 */
export function getPrerequisiteChain(
  graph: KnowledgeGraph,
  topicId: string,
  maxDepth = 3,
): TraversalResult[] {
  return getRelatedTopics(graph, topicId, {
    maxDepth,
    edgeTypes: ['prerequisite_of'],
    maxResults: 8,
  });
}

// ────────────────────────────────────────────
// Weakness Propagation
// ────────────────────────────────────────────

/**
 * Given a set of weak topic IDs, propagate weakness through the graph.
 * If a student is weak in "Percentage", their weakness propagates to
 * "Profit & Loss", "SI/CI", etc. via prerequisite and same_concept edges.
 */
export function propagateWeakness(
  graph: KnowledgeGraph,
  weakTopicIds: string[],
  weaknessScores: Record<string, number> = {},
): WeaknessExpansion[] {
  const expansions: WeaknessExpansion[] = [];

  for (const topicId of weakTopicIds) {
    const baseWeakness = weaknessScores[topicId] ?? 0.8;
    const related = getRelatedTopics(graph, topicId, {
      maxDepth: 2,
      maxResults: 6,
      edgeTypes: ['prerequisite_of', 'same_concept_as', 'subtopic_of'],
      minPathScore: 0.2,
    });

    const expandedTopics = related.map(r => ({
      topicId: r.topicId,
      topicName: r.topicName,
      propagationScore: Number((baseWeakness * r.pathScore * 0.7).toFixed(3)),
      reason: `Weakness in "${graph.nodes.get(topicId)?.name}" propagates via ${r.edgeTypes.join(' → ')} (${r.distance} hop${r.distance > 1 ? 's' : ''})`,
    }));

    expansions.push({
      originalTopic: topicId,
      expandedTopics,
    });
  }

  return expansions;
}

// ────────────────────────────────────────────
// GraphRAG — Multi-hop retrieval for LLM context
// ────────────────────────────────────────────

export interface GraphRAGContext {
  /** Primary topic matched from the query. */
  primaryTopic: string;
  /** Related topics discovered via graph traversal. */
  relatedTopics: TraversalResult[];
  /** Human-readable graph path for citations. */
  graphCitationPath: string;
}

/**
 * Given a matched topic ID from BM25/vector retrieval, expand context
 * via the knowledge graph for richer LLM prompts.
 */
export function graphRAGExpand(
  graph: KnowledgeGraph,
  matchedTopicIds: string[],
): GraphRAGContext[] {
  const contexts: GraphRAGContext[] = [];

  for (const topicId of matchedTopicIds) {
    const node = graph.nodes.get(topicId);
    if (!node) continue;

    const related = getRelatedTopics(graph, topicId, {
      maxDepth: 2,
      maxResults: 4,
      minPathScore: 0.3,
    });

    const pathParts = related.map(
      r => `${r.topicName} (via ${r.edgeTypes.join('→')}, score: ${r.pathScore})`,
    );

    contexts.push({
      primaryTopic: node.name,
      relatedTopics: related,
      graphCitationPath: pathParts.length > 0
        ? `${node.name} → ${pathParts.join(' | ')}`
        : node.name,
    });
  }

  return contexts;
}

/**
 * Format GraphRAG context into an LLM-injectable prompt section.
 */
export function buildGraphPromptContext(contexts: GraphRAGContext[]): string {
  if (contexts.length === 0) return '';

  let text = '\n\n🔗 **KNOWLEDGE GRAPH CONTEXT (GraphRAG):**\n';
  text += 'The following related concepts were discovered via topic-relationship graph traversal. Use them to provide deeper, interconnected explanations:\n\n';

  for (const ctx of contexts) {
    text += `📌 **${ctx.primaryTopic}** connects to:\n`;
    for (const r of ctx.relatedTopics) {
      text += `  → ${r.topicName} (${r.subject}) — ${r.edgeTypes.join(' → ')} [relevance: ${(r.pathScore * 100).toFixed(0)}%]\n`;
    }
    text += '\n';
  }

  return text;
}
