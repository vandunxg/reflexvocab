import { localDay } from './mastery.ts';
import type { Attempt, CardProgress } from './model';

export interface SessionSummary {
  /** Questions answered for the first time in this session (retries excluded). */
  firstAttempts: number;
  /** First attempts answered correctly without showing the answer. */
  correct: number;
  /** Recovery retries practised after a mistake or reveal. */
  recoveryPractice: number;
}

/** Counts each recorded attempt once, even if the same saved attempt was delivered twice. */
export function summarizeSession(attempts: Attempt[], sessionId: string): SessionSummary {
  const unique = new Map(attempts.filter((attempt) => attempt.sessionId === sessionId)
    .map((attempt) => [attempt.id, attempt]));
  const summary: SessionSummary = { firstAttempts: 0, correct: 0, recoveryPractice: 0 };
  for (const attempt of unique.values()) {
    if (attempt.isRetry) {
      summary.recoveryPractice += 1;
    } else {
      summary.firstAttempts += 1;
      if (attempt.outcome === 'correct' && !attempt.answerRevealed) summary.correct += 1;
    }
  }
  return summary;
}

/** Senses whose review falls on or before tomorrow in the learner's timezone. */
export function dueByTomorrow(cards: CardProgress[], now: Date, timezone: string): number {
  const tomorrow = localDay(new Date(now.getTime() + 24 * 60 * 60 * 1000), timezone);
  return cards.filter((card) => localDay(new Date(card.card.dueAt), timezone) <= tomorrow).length;
}
