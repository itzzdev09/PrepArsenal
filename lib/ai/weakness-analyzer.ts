// PrepArsenal — AI Weakness Analyzer & Knowledge Graph Diagnostic Engine
// Analyzes student practice history, identifies cognitive gaps, and propagates
// prerequisite vulnerabilities across the topic Knowledge Graph.

import { buildKnowledgeGraph, propagateWeakness, type KnowledgeGraph, type WeaknessExpansion } from './knowledge-graph';
import { topics as seedTopics, questions as seedQuestions } from '../data';
import type { TrendAnalytics } from '../db';

export interface UserReviewRecord {
  question_id: string;
  is_correct: boolean;
  time_taken_seconds: number;
  last_reviewed_at: string;
  questions?: {
    exam_code?: string;
    subject?: string;
    topic_id?: string;
    difficulty?: string;
  };
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subject: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;        // 0 - 100
  avgTimeSeconds: number;
  severityScore: number;   // 0.0 (mastered) to 1.0 (critical weakness)
  trendPredictionScore: number;
  lastAttemptedAt: string | null;
}

export interface WeaknessProfile {
  criticalWeaknesses: TopicPerformance[];   // Attempted & accuracy < 55%
  atRiskPropagated: WeaknessExpansion[];    // Found via Knowledge Graph prerequisite bleed
  neglectedHighYield: TopicPerformance[];   // High exam frequency (>75%) but 0 attempts
  strongAreas: TopicPerformance[];          // Accuracy > 75%
  overallAccuracy: number;
  totalAttempted: number;
  averagePaceSeconds: number;
  primarySubjectGap: string;
  summaryRationale: string;
}

/**
 * Builds the diagnostic weakness profile from raw user reviews
 */
export function analyzeUserWeaknesses(
  reviews: UserReviewRecord[],
  trends: TrendAnalytics[] = [],
  graph?: KnowledgeGraph
): WeaknessProfile {
  const kg = graph || buildKnowledgeGraph(seedTopics, trends, seedQuestions);

  // Group reviews by topic
  const topicStats = new Map<string, { total: number; correct: number; timeSum: number; lastDate: string | null; subject: string }>();

  let totalCorrect = 0;
  let totalTime = 0;

  for (const r of reviews) {
    const topicId = r.questions?.topic_id || 'unknown';
    const subject = r.questions?.subject || 'General';
    if (!topicStats.has(topicId)) {
      topicStats.set(topicId, { total: 0, correct: 0, timeSum: 0, lastDate: null, subject });
    }

    const st = topicStats.get(topicId)!;
    st.total++;
    if (r.is_correct) {
      st.correct++;
      totalCorrect++;
    }
    st.timeSum += r.time_taken_seconds || 30;
    totalTime += r.time_taken_seconds || 30;

    if (!st.lastDate || new Date(r.last_reviewed_at) > new Date(st.lastDate)) {
      st.lastDate = r.last_reviewed_at;
    }
  }

  const performanceList: TopicPerformance[] = [];

  // Map known topics
  for (const [id, node] of kg.nodes) {
    const st = topicStats.get(id);
    const trend = trends.find(t => t.topic_id === id);
    const trendPredictionScore = trend ? Number(trend.prediction_score) : 50;

    if (st && st.total > 0) {
      const accuracy = Math.round((st.correct / st.total) * 100);
      const avgTimeSeconds = Math.round(st.timeSum / st.total);

      // Severity formula: combines low accuracy, slow pace, and high trend prediction
      const accuracyDeficit = (100 - accuracy) / 100; // 0 to 1
      const paceFactor = Math.min(1.5, avgTimeSeconds / 60); // > 60s is slow
      const importanceWeight = trendPredictionScore / 100;

      const severityScore = Number(
        Math.min(1.0, (accuracyDeficit * 0.6 + (paceFactor > 1 ? 0.2 : 0) + importanceWeight * 0.2)).toFixed(2)
      );

      performanceList.push({
        topicId: id,
        topicName: node.name,
        subject: node.subject,
        totalAttempts: st.total,
        correctAttempts: st.correct,
        accuracy,
        avgTimeSeconds,
        severityScore,
        trendPredictionScore,
        lastAttemptedAt: st.lastDate,
      });
    } else {
      // Unattempted topic
      if (trendPredictionScore >= 75) {
        performanceList.push({
          topicId: id,
          topicName: node.name,
          subject: node.subject,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
          avgTimeSeconds: 0,
          severityScore: Number((trendPredictionScore / 100 * 0.8).toFixed(2)),
          trendPredictionScore,
          lastAttemptedAt: null,
        });
      }
    }
  }

  // Categorize
  const criticalWeaknesses = performanceList
    .filter(p => p.totalAttempts > 0 && p.accuracy < 60)
    .sort((a, b) => b.severityScore - a.severityScore);

  const strongAreas = performanceList
    .filter(p => p.totalAttempts >= 3 && p.accuracy >= 75)
    .sort((a, b) => b.accuracy - a.accuracy);

  const neglectedHighYield = performanceList
    .filter(p => p.totalAttempts === 0 && p.trendPredictionScore >= 80)
    .sort((a, b) => b.trendPredictionScore - a.trendPredictionScore);

  // Propagate critical weaknesses through Knowledge Graph
  const weakIds = criticalWeaknesses.map(c => c.topicId);
  const weaknessScores: Record<string, number> = {};
  criticalWeaknesses.forEach(c => { weaknessScores[c.topicId] = c.severityScore; });
  const atRiskPropagated = propagateWeakness(kg, weakIds, weaknessScores);

  // Subject Gap calculation
  const subjectFails: Record<string, { total: number; failed: number }> = {};
  for (const p of performanceList.filter(x => x.totalAttempts > 0)) {
    if (!subjectFails[p.subject]) subjectFails[p.subject] = { total: 0, failed: 0 };
    subjectFails[p.subject].total += p.totalAttempts;
    subjectFails[p.subject].failed += (p.totalAttempts - p.correctAttempts);
  }

  let primarySubjectGap = 'Quantitative Aptitude';
  let highestFailRate = -1;
  for (const [sub, data] of Object.entries(subjectFails)) {
    const failRate = data.total > 0 ? (data.failed / data.total) : 0;
    if (failRate > highestFailRate) {
      highestFailRate = failRate;
      primarySubjectGap = sub;
    }
  }

  const totalAttempted = reviews.length;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const averagePaceSeconds = totalAttempted > 0 ? Math.round(totalTime / totalAttempted) : 45;

  let summaryRationale = '';
  if (criticalWeaknesses.length > 0) {
    summaryRationale = `Identified ${criticalWeaknesses.length} critical topic bottlenecks in ${primarySubjectGap}, with prerequisite weakness propagating to ${atRiskPropagated.reduce((acc, a) => acc + a.expandedTopics.length, 0)} linked concepts.`;
  } else if (neglectedHighYield.length > 0) {
    summaryRationale = `Solid foundational accuracy (${overallAccuracy}%), but high-yield predicted exam topics like ${neglectedHighYield.slice(0, 2).map(n => n.topicName).join(', ')} require initial revision.`;
  } else {
    summaryRationale = `Balanced performance across core syllabus with ${overallAccuracy}% accuracy. Ready for timed mock test simulations and speed drills.`;
  }

  return {
    criticalWeaknesses,
    atRiskPropagated,
    neglectedHighYield,
    strongAreas,
    overallAccuracy,
    totalAttempted,
    averagePaceSeconds,
    primarySubjectGap,
    summaryRationale,
  };
}
