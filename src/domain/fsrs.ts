import { createEmptyCard, fsrs, generatorParameters, Rating, type Card } from 'ts-fsrs';
import type { RecallGrade, SerializedCard } from './model';

const scheduler = fsrs(generatorParameters({ request_retention: 0.9, enable_fuzz: false }));
const ratings = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good } as const;
const numericFields = [
  'stability', 'difficulty', 'elapsed_days', 'scheduled_days', 'learning_steps', 'reps', 'lapses', 'state',
] as const;

function restoreCard(saved: SerializedCard): Card {
  if (saved.version !== 1 || !saved.data || typeof saved.data !== 'object'
    || !Number.isFinite(Date.parse(saved.dueAt))
    || numericFields.some((key) => typeof saved.data[key] !== 'number'
      || !Number.isFinite(saved.data[key]) || Number(saved.data[key]) < 0)
    || ['elapsed_days', 'scheduled_days', 'learning_steps', 'reps', 'lapses'].some(
      (key) => !Number.isInteger(saved.data[key]),
    )
    || !Number.isInteger(saved.data.state) || Number(saved.data.state) < 0 || Number(saved.data.state) > 3
    || (saved.data.last_review !== undefined
      && (typeof saved.data.last_review !== 'string' || !Number.isFinite(Date.parse(saved.data.last_review))))) {
    throw new Error('Invalid or unsupported scheduler card');
  }
  return {
    ...saved.data,
    due: new Date(saved.dueAt),
    last_review: saved.data.last_review === undefined ? undefined : new Date(saved.data.last_review as string),
  } as Card;
}

function serialize(card: Card): SerializedCard {
  const { due, last_review, ...data } = card;
  return {
    version: 1,
    dueAt: due.toISOString(),
    data: { ...data, ...(last_review ? { last_review: last_review.toISOString() } : {}) },
  };
}

export function createCard(now: Date): SerializedCard {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid scheduler input');
  return serialize(createEmptyCard(now));
}

export function scheduleRecall(card: SerializedCard | undefined, grade: RecallGrade, now: Date): SerializedCard {
  if (!Number.isFinite(now.getTime()) || !Object.hasOwn(ratings, grade)) throw new Error('Invalid scheduler input');
  return serialize(scheduler.next(card ? restoreCard(card) : createEmptyCard(now), now, ratings[grade]).card);
}
