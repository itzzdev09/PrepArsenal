// PrepArsenal — Ensemble Trend Prediction Engine
// Combines 5 interpretable statistical signals into a blended prediction score.
//
// Sub-models:
//   1. Exponential Moving Average (EMA)       — recent years weighted heavier
//   2. Linear Regression Slope                — upward/downward trajectory
//   3. Recency Burst Detector                 — sharp spike in last 1-2 years
//   4. Consistency Score                      — appears every year reliably
//   5. Cross-Exam Spillover                   — topic surge in related exams
//
// Each signal produces a 0–100 score.  The ensemble blends them with
// configurable weights and returns both the final score and a per-signal
// breakdown for UI explainability.

import type { TrendAnalytics } from '../db';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface SignalBreakdown {
  name: string;
  score: number;    // 0–100
  weight: number;   // 0–1 (sums to 1.0 across all signals)
  weighted: number; // score × weight
  description: string;
}

export interface EnsemblePrediction {
  /** Final blended score 0–100. */
  score: number;
  /** Per-signal breakdown for UI explainability. */
  signals: SignalBreakdown[];
  /** Human-readable summary of why the prediction is high/low. */
  summary: string;
  /** Confidence tier label. */
  tier: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
}

export interface EnsembleWeights {
  ema: number;
  slope: number;
  recency: number;
  consistency: number;
  spillover: number;
}

export const DEFAULT_WEIGHTS: EnsembleWeights = {
  ema: 0.30,
  slope: 0.25,
  recency: 0.20,
  consistency: 0.15,
  spillover: 0.10,
};

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

/** Sorted ascending years + their counts from a TrendAnalytics row. */
function extractTimeSeries(trend: TrendAnalytics): { years: number[]; counts: number[] } {
  const entries = Object.entries(trend.yearly_frequencies || {})
    .map(([y, c]) => [Number(y), c as number] as const)
    .sort(([a], [b]) => a - b);
  return {
    years: entries.map(([y]) => y),
    counts: entries.map(([, c]) => c),
  };
}

/** Clamp a value between 0 and 100. */
function clamp100(v: number): number {
  return Math.max(0, Math.min(100, v));
}

// ────────────────────────────────────────────
// Signal 1: Exponential Moving Average (EMA)
// ────────────────────────────────────────────
// Gives more weight to recent years.  The EMA of question counts is
// normalised against the max observed count across all years in this
// topic.  Higher EMA → the topic is getting asked more recently.

export function computeEMA(trend: TrendAnalytics, alpha = 0.35): number {
  const { counts } = extractTimeSeries(trend);
  if (counts.length === 0) return 0;

  let ema = counts[0];
  for (let i = 1; i < counts.length; i++) {
    ema = alpha * counts[i] + (1 - alpha) * ema;
  }

  // Normalise: divide by the max observed count (the "ceiling"), then
  // scale to 0-100.  If the topic's peak was 1 question a year the
  // EMA still evaluates fairly relative to *its own* history.
  const maxCount = Math.max(1, ...counts);
  return clamp100((ema / maxCount) * 100);
}

// ────────────────────────────────────────────
// Signal 2: Linear Regression Slope
// ────────────────────────────────────────────
// Ordinary least-squares slope of (year_index, count).  Positive slope
// means the topic is on an upward trajectory.  The slope is scaled
// relative to the mean so that a doubling over the year span ≈ 100.

export function computeLinearSlope(trend: TrendAnalytics): number {
  const { counts } = extractTimeSeries(trend);
  const n = counts.length;
  if (n < 2) return 50; // neutral when we can't fit a line

  // x = 0, 1, 2, …
  const meanX = (n - 1) / 2;
  const meanY = counts.reduce((s, c) => s + c, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (counts[i] - meanY);
    den += (i - meanX) ** 2;
  }

  const slope = den === 0 ? 0 : num / den;

  // Normalise: a slope equal to the mean (≈ doubling over the range)
  // maps to +50 on top of the baseline 50.  Negative slopes map below 50.
  const normalisedSlope = meanY === 0 ? 0 : (slope / Math.max(meanY, 0.5)) * 50;
  return clamp100(50 + normalisedSlope);
}

// ────────────────────────────────────────────
// Signal 3: Recency Burst Detector
// ────────────────────────────────────────────
// Compares the most recent 1-2 years against the rolling mean of the
// 3 years before that.  A sudden spike returns a high score.

export function computeRecencyBurst(trend: TrendAnalytics): number {
  const { counts } = extractTimeSeries(trend);
  if (counts.length < 3) return 50;

  // "Recent" = last 1 (if ≤4 data points) or last 2 years
  const recentLen = counts.length <= 4 ? 1 : 2;
  const recentSlice = counts.slice(-recentLen);
  const recentAvg = recentSlice.reduce((s, c) => s + c, 0) / recentLen;

  // "Baseline" = 3 years before the recent window
  const baselineSlice = counts.slice(
    Math.max(0, counts.length - recentLen - 3),
    counts.length - recentLen,
  );
  if (baselineSlice.length === 0) return 50;

  const baselineAvg = baselineSlice.reduce((s, c) => s + c, 0) / baselineSlice.length;

  if (baselineAvg <= 0) {
    // Topic didn't exist in baseline → any recent appearance is a burst
    return recentAvg > 0 ? 90 : 30;
  }

  const ratio = recentAvg / baselineAvg;

  // ratio ~1.0 → 50, ratio ~2.0 → 85, ratio ~0.5 → 25
  return clamp100(50 + (ratio - 1) * 40);
}

// ────────────────────────────────────────────
// Signal 4: Consistency Score
// ────────────────────────────────────────────
// % of years in which the topic appeared (at least 1 question).
// Topics that never miss a year are safer bets for prediction.

export function computeConsistency(trend: TrendAnalytics): number {
  const { counts } = extractTimeSeries(trend);
  if (counts.length === 0) return 0;

  const nonZero = counts.filter(c => c > 0).length;
  return clamp100((nonZero / counts.length) * 100);
}

// ────────────────────────────────────────────
// Signal 5: Cross-Exam Spillover
// ────────────────────────────────────────────
// Weighted average of this topic's performance in OTHER exams.
// Uses only the EMA signal from sister exams to keep it simple.

export function computeCrossExamSpillover(
  trend: TrendAnalytics,
  allTrends: TrendAnalytics[],
): number {
  // Find the same topic_id in other exams
  const siblings = allTrends.filter(
    t => t.topic_id === trend.topic_id && t.exam_code !== trend.exam_code,
  );

  if (siblings.length === 0) return 50; // neutral — no cross-exam data

  const emaScores = siblings.map(s => computeEMA(s));
  const avg = emaScores.reduce((s, v) => s + v, 0) / emaScores.length;
  return clamp100(avg);
}

// ────────────────────────────────────────────
// Ensemble Blend
// ────────────────────────────────────────────

export function ensemblePrediction(
  trend: TrendAnalytics,
  allTrends: TrendAnalytics[],
  weights: EnsembleWeights = DEFAULT_WEIGHTS,
): EnsemblePrediction {
  const emaScore = computeEMA(trend);
  const slopeScore = computeLinearSlope(trend);
  const recencyScore = computeRecencyBurst(trend);
  const consistencyScore = computeConsistency(trend);
  const spilloverScore = computeCrossExamSpillover(trend, allTrends);

  const signals: SignalBreakdown[] = [
    {
      name: 'Recent Weight (EMA)',
      score: emaScore,
      weight: weights.ema,
      weighted: emaScore * weights.ema,
      description: 'Exponentially weighted average favoring recent years',
    },
    {
      name: 'Trajectory',
      score: slopeScore,
      weight: weights.slope,
      weighted: slopeScore * weights.slope,
      description: 'Linear trend direction — rising or falling over time',
    },
    {
      name: 'Recency Burst',
      score: recencyScore,
      weight: weights.recency,
      weighted: recencyScore * weights.recency,
      description: 'Sudden spike in the last 1–2 years compared to prior baseline',
    },
    {
      name: 'Consistency',
      score: consistencyScore,
      weight: weights.consistency,
      weighted: consistencyScore * weights.consistency,
      description: 'Fraction of years where at least 1 question appeared',
    },
    {
      name: 'Cross-Exam',
      score: spilloverScore,
      weight: weights.spillover,
      weighted: spilloverScore * weights.spillover,
      description: 'How this topic is trending in other related exams',
    },
  ];

  const score = clamp100(
    signals.reduce((sum, s) => sum + s.weighted, 0),
  );

  // Tier classification
  let tier: EnsemblePrediction['tier'];
  if (score >= 80) tier = 'Very High';
  else if (score >= 65) tier = 'High';
  else if (score >= 45) tier = 'Moderate';
  else if (score >= 25) tier = 'Low';
  else tier = 'Very Low';

  // Human-readable summary (top 2 contributing signals)
  const sorted = [...signals].sort((a, b) => b.weighted - a.weighted);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const summary = `Driven by ${top1.name} (${top1.score.toFixed(0)}) and ${top2.name} (${top2.score.toFixed(0)})`;

  return { score: Number(score.toFixed(1)), signals, summary, tier };
}

// ────────────────────────────────────────────
// Batch Computation (for a full exam's worth of trends)
// ────────────────────────────────────────────

export interface EnrichedTrend extends TrendAnalytics {
  ensemble: EnsemblePrediction;
}

/**
 * Compute ensemble predictions for an array of trends belonging to
 * the same exam.  `allTrendsForSpillover` should contain trends from
 * *all* exams so the cross-exam signal works properly; if not provided,
 * the spillover signal will be neutral (50).
 */
export function computeEnsembleBatch(
  examTrends: TrendAnalytics[],
  allTrendsForSpillover: TrendAnalytics[] = [],
  weights?: EnsembleWeights,
): EnrichedTrend[] {
  // Merge exam trends into the spillover pool so sibling lookups work
  const pool = allTrendsForSpillover.length > 0
    ? allTrendsForSpillover
    : examTrends;

  return examTrends.map(t => ({
    ...t,
    ensemble: ensemblePrediction(t, pool, weights),
  }));
}
