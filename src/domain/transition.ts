import { evaluateAnswer, type Evidence } from './answers.ts';
import { applyReview, startProgress } from './mastery.ts';
import { addRecovery } from './session.ts';
import type { Attempt, AttemptCommit, CardProgress, Exercise, LearningSession } from './model';

export interface AnswerSubmission {
  session: LearningSession;
  exercise: Exercise;
  /** Saved progress for the active sense; undefined on first exposure. */
  progress: CardProgress | undefined;
  /** Active catalog exercises, used to choose a recovery item after a mistake. */
  exercises: Exercise[];
  answer: unknown;
  hintUsed: boolean;
  answerRevealed: boolean;
  attemptId: string;
  attemptedAt: Date;
  responseTimeMs: number | null;
  timezone: string;
}

export type AnswerTransition =
  | { ok: true; correct: boolean; evidence: Evidence; commit: AttemptCommit }
  | { ok: false; code: 'session-closed' | 'exercise-mismatch' | 'invalid-answer' };

/**
 * Consumes one answer for the active queue item and returns feedback plus the complete commit payload.
 * Inputs are never mutated, so a rejected submission leaves the previous snapshot intact and an accepted
 * payload can be retried unchanged.
 */
export function submitAnswer(input: AnswerSubmission): AnswerTransition {
  const { session, exercise, attemptedAt: now } = input;
  const item = session.queue[session.cursor];
  if (session.status !== 'current' || !item) return { ok: false, code: 'session-closed' };
  if (exercise.id !== item.exerciseId || exercise.version !== item.exerciseVersion
    || exercise.senseId !== item.senseId || !exercise.active
    || (input.progress && input.progress.senseId !== item.senseId)) {
    return { ok: false, code: 'exercise-mismatch' };
  }
  if (!input.attemptId || !Number.isFinite(now.getTime())
    || (input.responseTimeMs !== null && !(Number.isInteger(input.responseTimeMs) && input.responseTimeMs >= 0))
    || (input.answer === null && !input.answerRevealed)
    || (Array.isArray(input.answer) && input.answer.some((chunk) => chunk === ''))) {
    return { ok: false, code: 'invalid-answer' };
  }

  const isRetry = item.source === 'retry';
  const { hintUsed, answerRevealed } = input;
  let result: ReturnType<typeof evaluateAnswer>;
  try {
    result = evaluateAnswer(exercise, input.answer, { hintUsed, answerRevealed, isRetry });
  } catch {
    return { ok: false, code: 'invalid-answer' };
  }
  const failed = !result.correct || answerRevealed;

  let progress: CardProgress;
  let review: { grade: Attempt['grade']; qualifiedReview: boolean } = { grade: null, qualifiedReview: false };
  if (input.progress) {
    const applied = applyReview(input.progress, {
      correct: result.correct, hintUsed, answerRevealed, isRetry, contextId: exercise.contextId,
      exerciseKind: exercise.kind, now, timezone: input.timezone,
    });
    progress = applied.progress;
    review = applied;
  } else {
    // First exposure initializes the card without counting as a review.
    progress = {
      ...startProgress(item.senseId, now),
      mistakeCount: failed ? 1 : 0,
      lastMistakeAt: failed ? now.toISOString() : null,
    };
  }

  const recovered = failed ? addRecovery(session, input.exercises) : session;
  const cursor = session.cursor + 1;
  const nextSession: LearningSession = {
    ...recovered,
    cursor,
    revision: session.revision + 1,
    status: cursor >= recovered.queue.length ? 'completed' : 'current',
    updatedAt: now.toISOString(),
  };

  const base = {
    id: input.attemptId, sessionId: session.id, exerciseId: exercise.id, senseId: exercise.senseId,
    contextId: exercise.contextId, exerciseVersion: exercise.version, hintUsed, isRetry,
    qualifiedReview: review.qualifiedReview, grade: review.grade, attemptedAt: now.toISOString(),
    responseTimeMs: input.responseTimeMs,
  };
  const outcome = result.correct ? 'correct' : 'incorrect';
  const attempt: Attempt = input.answer === null
    ? { ...base, exerciseKind: exercise.kind, answer: null, answerRevealed: true, outcome: 'incorrect' }
    : exercise.kind === 'sentence-build'
      ? { ...base, exerciseKind: exercise.kind, answer: [...(input.answer as string[])], answerRevealed, outcome }
      : { ...base, exerciseKind: exercise.kind, answer: input.answer as string, answerRevealed, outcome };

  return {
    ok: true,
    correct: result.correct,
    evidence: result.evidence,
    commit: { attempt, progress, session: nextSession, expectedRevision: session.revision },
  };
}
