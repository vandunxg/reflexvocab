import { createCard, scheduleRecall } from './fsrs.ts';
import type { CardProgress, ExerciseKind, MasteryEvidence, RecallGrade } from './model';

const MASTERY_DAYS = 3;
const MASTERY_CONTEXTS = 2;
const MASTERY_STABILITY_DAYS = 14;

type Review = {
  correct: boolean;
  hintUsed: boolean;
  answerRevealed: boolean;
  isRetry: boolean;
  contextId: string;
  exerciseKind: ExerciseKind;
  now: Date;
  timezone: string;
};

export function localDay(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const part = (name: string) => parts.find((item) => item.type === name)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function emptyEvidence(): MasteryEvidence {
  return { reviewDays: [], contextIds: [], hasTypingSuccess: false };
}

export function startProgress(senseId: string, now: Date): CardProgress {
  return {
    senseId, card: createCard(now), firstSeenAt: now.toISOString(), masteryStage: 'learning',
    evidence: emptyEvidence(), mistakeCount: 0, lastMistakeAt: null,
  };
}

export function applyReview(progress: CardProgress, review: Review): {
  progress: CardProgress; grade: RecallGrade | null; qualifiedReview: boolean;
} {
  const now = review.now;
  const day = localDay(now, review.timezone);
  const firstDay = localDay(new Date(progress.firstSeenAt), review.timezone);
  const qualifiedReview = !review.isRetry && now.getTime() >= Date.parse(progress.card.dueAt);
  const failed = !review.correct || review.answerRevealed;
  const grade: RecallGrade | null = !qualifiedReview ? null
    : failed ? 'again' : review.hintUsed ? 'hard' : 'good';
  const card = grade ? scheduleRecall(progress.card, grade, now) : progress.card;
  let evidence = progress.evidence;
  let masteryStage = progress.masteryStage;
  if (grade === 'again') {
    evidence = emptyEvidence();
    masteryStage = 'learning';
  } else if (grade === 'good' && day > firstDay) {
    evidence = {
      reviewDays: [...new Set([...evidence.reviewDays, day])],
      contextIds: [...new Set([...evidence.contextIds, review.contextId])],
      hasTypingSuccess: evidence.hasTypingSuccess || review.exerciseKind === 'typing-cloze',
    };
    masteryStage = evidence.reviewDays.length >= MASTERY_DAYS
      && evidence.contextIds.length >= MASTERY_CONTEXTS && evidence.hasTypingSuccess
      && typeof card.data.stability === 'number' && card.data.stability >= MASTERY_STABILITY_DAYS
      ? 'mastered' : 'familiar';
  }
  return {
    grade, qualifiedReview,
    progress: {
      ...progress, card, evidence, masteryStage,
      mistakeCount: progress.mistakeCount + (failed ? 1 : 0),
      lastMistakeAt: failed ? now.toISOString() : progress.lastMistakeAt,
    },
  };
}
