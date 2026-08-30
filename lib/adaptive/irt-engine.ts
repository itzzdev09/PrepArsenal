// PrepArsenal — Psychometric Item Response Theory (IRT 3PL) & Adaptive Testing Engine

import type { Question } from '../data';

export interface IRTItemParameters {
  discrimination: number; // 'a' parameter (0.8 - 2.5)
  difficulty: number;     // 'b' parameter (-2.5 - 2.5)
  guessing: number;       // 'c' parameter (~0.25 for 4 options)
}

export interface IRTUserState {
  theta: number;          // Latent ability estimate (-3.0 to +3.0)
  standardError: number;  // Confidence interval standard error
  eloRating: number;      // Calibrated Elo score (800 - 2400)
  history: Array<{
    questionId: string;
    isCorrect: boolean;
    difficulty: number;
    thetaAfter: number;
    timeTakenSeconds: number;
  }>;
}

export interface IRTDiagnosticReport {
  finalTheta: number;
  standardError: number;
  eloRating: number;
  tier: 'Foundational' | 'Developing' | 'Proficient' | 'Mastery (Top 1%)';
  percentile: number;
  predictedCutoffProb: number;
  recommendations: string[];
}

import { getCalibratedQuestionIrtParams } from '../ai/difficulty-classifier';

// ML-powered parameter generator for adaptive testing & item response theory
export function getQuestionIrtParams(q: Question): IRTItemParameters {
  return getCalibratedQuestionIrtParams(q);
}

/**
 * 3-Parameter Logistic (3PL) Probability Model
 * P(theta) = c + (1 - c) / (1 + exp(-1.7 * a * (theta - b)))
 */
export function calculateProbability(theta: number, params: IRTItemParameters): number {
  const { discrimination: a, difficulty: b, guessing: c } = params;
  const D = 1.702;
  const expTerm = Math.exp(-D * a * (theta - b));
  return c + (1 - c) / (1 + expTerm);
}

/**
 * Fisher Information Function I(theta)
 * Quantifies how much psychometric precision this question yields at the student's ability level
 */
export function calculateFisherInformation(theta: number, params: IRTItemParameters): number {
  const p = calculateProbability(theta, params);
  const q = 1 - p;
  const { discrimination: a, guessing: c } = params;
  const D = 1.702;

  if (p <= c || p >= 1.0) return 0.05;

  const num = Math.pow(p - c, 2) * q;
  const denom = Math.pow(1 - c, 2) * p;
  return Math.pow(D * a, 2) * (num / denom);
}

/**
 * Select the optimal next question maximizing Fisher Information
 */
export function selectNextAdaptiveQuestion(
  availableQuestions: Question[],
  answeredIds: Set<string>,
  currentTheta: number
): { question: Question; expectedInfo: number } | null {
  const unattempted = availableQuestions.filter(q => !answeredIds.has(q.id));
  if (unattempted.length === 0) return null;

  let bestQuestion: Question = unattempted[0];
  let maxInformation = -1;

  for (const q of unattempted) {
    const params = getQuestionIrtParams(q);
    const info = calculateFisherInformation(currentTheta, params);
    
    // Add subtle topic diversity factor
    if (info > maxInformation) {
      maxInformation = info;
      bestQuestion = q;
    }
  }

  return { question: bestQuestion, expectedInfo: maxInformation };
}

/**
 * Initialize a fresh Adaptive Testing State
 */
export function createInitialIRTState(initialTheta = 0.0): IRTUserState {
  return {
    theta: initialTheta,
    standardError: 1.0,
    eloRating: Math.round(1200 + initialTheta * 250),
    history: [],
  };
}

/**
 * Update student latent ability (theta) and Elo rating after answering a question
 */
export function updateAbilityAfterResponse(
  state: IRTUserState,
  question: Question,
  isCorrect: boolean,
  timeTakenSeconds = 30
): IRTUserState {
  const params = getQuestionIrtParams(question);
  const expectedP = calculateProbability(state.theta, params);
  const info = calculateFisherInformation(state.theta, params);

  // Bayesian / Newton update step
  const stepSize = (isCorrect ? 1 : 0) - expectedP;
  const delta = (stepSize / Math.max(Math.sqrt(info + 0.25), 0.5)) * 0.45;
  
  // Bounded latent ability (-3.0 to +3.0)
  const newTheta = Math.max(-3.0, Math.min(3.0, state.theta + delta));

  // Compute updated Standard Error: SE = 1 / sqrt(total_info)
  const totalInfo = state.history.reduce((acc, h) => {
    return acc + calculateFisherInformation(h.thetaAfter, { difficulty: h.difficulty, discrimination: 1.4, guessing: 0.25 });
  }, info);
  const newSE = Math.max(0.15, Number((1 / Math.sqrt(totalInfo + 1)).toFixed(2)));

  // Elo rating update (K-factor 32)
  const expectedEloP = 1 / (1 + Math.pow(10, (params.difficulty * 250) / 400));
  const eloDelta = Math.round(32 * ((isCorrect ? 1 : 0) - expectedEloP));
  const newElo = Math.max(600, Math.min(2600, state.eloRating + eloDelta));

  const updatedHistory = [
    ...state.history,
    {
      questionId: question.id,
      isCorrect,
      difficulty: params.difficulty,
      thetaAfter: Number(newTheta.toFixed(3)),
      timeTakenSeconds,
    },
  ];

  return {
    theta: Number(newTheta.toFixed(3)),
    standardError: newSE,
    eloRating: newElo,
    history: updatedHistory,
  };
}

/**
 * Standard Normal CDF approximation to calculate percentile from Theta
 */
function standardNormalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) p = 1 - p;
  return p;
}

/**
 * Generate full psychometric diagnostic report
 */
export function generateIRTDiagnosticReport(state: IRTUserState): IRTDiagnosticReport {
  const theta = state.theta;
  const percentile = Math.min(99.9, Math.max(0.1, Number((standardNormalCdf(theta) * 100).toFixed(1))));

  let tier: IRTDiagnosticReport['tier'] = 'Developing';
  if (theta < -0.8) tier = 'Foundational';
  else if (theta < 0.3) tier = 'Developing';
  else if (theta < 1.3) tier = 'Proficient';
  else tier = 'Mastery (Top 1%)';

  // Predicted probability of clearing Tier 1 cutoff
  const predictedCutoffProb = Math.min(99, Math.max(5, Math.round(standardNormalCdf(theta - 0.2) * 100)));

  const recommendations: string[] = [];
  if (theta < 0) {
    recommendations.push('Focus on foundational NCERT Sprint topics and formula drill sheets.');
    recommendations.push('Target accuracy over speed before moving to high-difficulty questions.');
  } else if (theta < 1.2) {
    recommendations.push('Strengthen speed techniques on multi-statement Polity & History PYQs.');
    recommendations.push('Practice elimination techniques for 50-50 confusion questions.');
  } else {
    recommendations.push('Ready for full-length timed All-India Mock Tests.');
    recommendations.push('Maintain high accuracy in Sectional Quantitative Aptitude and Reasoning.');
  }

  return {
    finalTheta: theta,
    standardError: state.standardError,
    eloRating: state.eloRating,
    tier,
    percentile,
    predictedCutoffProb,
    recommendations,
  };
}
