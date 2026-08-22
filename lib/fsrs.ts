// PrepArsenal — FSRS Spaced Repetition Integration
import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs';

const scheduler = fsrs({
  request_retention: 0.9, // Target 90% retention
  maximum_interval: 365,
  w: [
    0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589,
    1.5330, 0.1110, 1.0070, 1.9265, 0.1170, 0.3120, 2.2260, 0.2280,
    2.8670, 0.6580, 0.5680,
  ],
});

export interface FSRSCardState {
  card: Card;
  questionId: string;
  lastReview: string | null;
  nextReview: string | null;
  reviewCount: number;
}

// Create a new card for a question
export function createNewCard(questionId: string): FSRSCardState {
  const card = createEmptyCard();
  return {
    card,
    questionId,
    lastReview: null,
    nextReview: new Date().toISOString(),
    reviewCount: 0,
  };
}

// Review a card and get the next schedule
export function reviewCard(
  cardState: FSRSCardState,
  rating: 'again' | 'hard' | 'good' | 'easy'
): FSRSCardState {
  const ratingMap: Record<string, Rating> = {
    again: Rating.Again,
    hard: Rating.Hard,
    good: Rating.Good,
    easy: Rating.Easy,
  };

  const now = new Date();
  const result = scheduler.repeat(cardState.card, now);
  const r = ratingMap[rating];
  const record = (result as unknown as Record<number, { card: Card }>)[r as number];
  const newCard = record.card;

  return {
    ...cardState,
    card: newCard,
    lastReview: now.toISOString(),
    nextReview: newCard.due.toISOString(),
    reviewCount: cardState.reviewCount + 1,
  };
}

// Get cards due for review
export function getDueCards(cards: FSRSCardState[]): FSRSCardState[] {
  const now = new Date();
  return cards.filter(c => {
    if (!c.nextReview) return true;
    return new Date(c.nextReview) <= now;
  });
}

// Get review rating based on correctness and time
export function getAutoRating(
  isCorrect: boolean,
  timeTakenSec: number,
  expectedTimeSec: number
): 'again' | 'hard' | 'good' | 'easy' {
  if (!isCorrect) return 'again';
  
  const timeRatio = timeTakenSec / expectedTimeSec;
  
  if (timeRatio < 0.5) return 'easy';
  if (timeRatio < 1.0) return 'good';
  return 'hard';
}

// Statistics
export function getCardStats(cards: FSRSCardState[]) {
  const now = new Date();
  const due = cards.filter(c => !c.nextReview || new Date(c.nextReview) <= now);
  const upcoming = cards.filter(c => c.nextReview && new Date(c.nextReview) > now);
  const newCards = cards.filter(c => c.reviewCount === 0);
  
  return {
    total: cards.length,
    due: due.length,
    upcoming: upcoming.length,
    new: newCards.length,
    reviewed: cards.filter(c => c.reviewCount > 0).length,
  };
}
