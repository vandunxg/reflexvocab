import { localDay } from './mastery.ts';
import type {
  CardProgress, CurriculumLesson, CurriculumTopic, Exercise, ExerciseKind, LearningSession,
  QueueEntry, SessionConfig, VocabularySense,
} from './model';

// Provisional product defaults from DECISIONS.md, not validated learning thresholds.
export const MAX_QUESTION_BUDGET = 30;
export const RETRY_LIMIT = 2;
export const RETRY_SPACING = 3;
// Daily minutes guide session size at about 40 seconds per question (DECISIONS.md); not a countdown.
export function questionBudgetFor(dailyMinutes: number): number {
  return Math.min(MAX_QUESTION_BUDGET, Math.max(1, Math.round(dailyMinutes * 1.5)));
}

const SELECTION_PATTERN = ['due', 'due', 'new', 'weak'] as const;

// Lower numbers give more support (recognition); higher numbers ask for more recall.
const KIND_DEMAND: Record<ExerciseKind, number> = {
  'definition-match': 0,
  'multiple-choice-cloze': 1,
  'collocation-match': 2,
  'sentence-build': 3,
  'typing-cloze': 4,
};

type Category = Exclude<QueueEntry['source'], 'retry'>;
type Candidate = { sense: VocabularySense; exercise: Exercise; progress?: CardProgress; category: Category };

export interface QueueInput {
  config: SessionConfig;
  topics: CurriculumTopic[];
  lessons: CurriculumLesson[];
  senses: VocabularySense[];
  exercises: Exercise[];
  progress: CardProgress[];
  now: Date;
  timezone: string;
  newPerDay: number;
}

// A mistake stays weak until a qualified independent recall on a later day leaves `learning`.
function isWeak(progress: CardProgress): boolean {
  return progress.lastMistakeAt !== null && progress.masteryStage === 'learning';
}

function categorize(progress: CardProgress | undefined, now: Date): Category {
  if (!progress) return 'new';
  if (Date.parse(progress.card.dueAt) <= now.getTime()) return 'due';
  return isWeak(progress) ? 'weak' : 'practice';
}

function eligible(mode: SessionConfig['mode'], candidate: Candidate): boolean {
  const { category, progress } = candidate;
  switch (mode) {
    case 'due': return category === 'due';
    case 'weak': return progress !== undefined && isWeak(progress);
    case 'mistakes': return progress !== undefined && progress.lastMistakeAt !== null;
    case 'daily':
    case 'quick': return category !== 'practice';
    case 'lesson':
    case 'topic':
    case 'custom': return true;
  }
}

// Consistent independent success moves toward recall; recent difficulty returns to recognition.
function chooseExercise(options: Exercise[], progress: CardProgress | undefined): Exercise {
  const target = !progress || isWeak(progress)
    ? 0 : Math.min(progress.evidence.reviewDays.length + 1, KIND_DEMAND['typing-cloze']);
  const seenContexts = new Set(progress?.evidence.contextIds);
  return [...options].sort((a, b) =>
    Math.abs(KIND_DEMAND[a.kind] - target) - Math.abs(KIND_DEMAND[b.kind] - target)
    || KIND_DEMAND[a.kind] - KIND_DEMAND[b.kind]
    || Number(seenContexts.has(a.contextId)) - Number(seenContexts.has(b.contextId))
    || a.id.localeCompare(b.id))[0];
}

/**
 * Builds the initial queue: one entry per sense, filters never widened, and a `due → due → new → weak`
 * rotation that skips empty pools. Lesson, topic and custom sessions then fill with early practice.
 * New senses respect the daily allowance in the learner's timezone; when due reviews alone exceed the
 * budget, that session's new allowance is halved (rounded down). A `new` entry tells the session to
 * introduce the sense before its first question. An empty array means nothing eligible exists.
 */
export function buildQueue(input: QueueInput): QueueEntry[] {
  const { config, now, timezone } = input;
  const budget = config.questionBudget;
  if (!Number.isInteger(budget) || budget < 1 || budget > MAX_QUESTION_BUDGET) {
    throw new RangeError('Invalid question budget');
  }
  if (!Number.isInteger(input.newPerDay) || input.newPerDay < 0) throw new RangeError('Invalid new-sense limit');

  const lessons = new Map(input.lessons.map((lesson) => [lesson.id, lesson]));
  const topicPosition = new Map(input.topics.map((topic) => [topic.id, topic.position]));
  const progressBySense = new Map(input.progress.map((item) => [item.senseId, item]));
  const today = localDay(now, timezone);
  const pools: Record<Category, Candidate[]> = { due: [], new: [], weak: [], practice: [] };

  for (const sense of input.senses) {
    const lesson = lessons.get(sense.lessonId);
    if ((config.lessonId && sense.lessonId !== config.lessonId)
      || (config.topicId && lesson?.topicId !== config.topicId)
      || (config.senseIds && !config.senseIds.includes(sense.id))) continue;
    const options = input.exercises.filter((exercise) => exercise.active && exercise.senseId === sense.id
      && (!config.kinds || config.kinds.includes(exercise.kind)));
    if (!options.length) continue;
    const progress = progressBySense.get(sense.id);
    const candidate = { sense, progress, category: categorize(progress, now), exercise: chooseExercise(options, progress) };
    if (eligible(config.mode, candidate)) pools[candidate.category].push(candidate);
  }

  const curriculumRank = (sense: VocabularySense) => {
    const lesson = lessons.get(sense.lessonId);
    return [topicPosition.get(lesson?.topicId ?? '') ?? Infinity, lesson?.position ?? Infinity];
  };
  pools.new.sort((a, b) => {
    const [topicA, lessonA] = curriculumRank(a.sense);
    const [topicB, lessonB] = curriculumRank(b.sense);
    return topicA - topicB || lessonA - lessonB;
  });
  pools.due.sort((a, b) => Date.parse(a.progress!.card.dueAt) - Date.parse(b.progress!.card.dueAt));
  pools.weak.sort((a, b) => Date.parse(b.progress!.lastMistakeAt!) - Date.parse(a.progress!.lastMistakeAt!));
  pools.practice.sort((a, b) => Date.parse(a.progress!.card.dueAt) - Date.parse(b.progress!.card.dueAt));

  const introducedToday = input.progress
    .filter((item) => localDay(new Date(item.firstSeenAt), timezone) === today).length;
  const remainingNew = Math.max(0, input.newPerDay - introducedToday);
  pools.new = pools.new.slice(0, pools.due.length > budget ? Math.floor(remainingNew / 2) : remainingNew);

  const selected: Candidate[] = [];
  for (let slot = 0; selected.length < budget; slot++) {
    if (SELECTION_PATTERN.every((category) => !pools[category].length)) break;
    const next = pools[SELECTION_PATTERN[slot % SELECTION_PATTERN.length]].shift();
    if (next) selected.push(next);
  }
  selected.push(...pools.practice.slice(0, budget - selected.length));

  return selected.map(({ exercise, category }) => ({
    exerciseId: exercise.id, exerciseVersion: exercise.version, senseId: exercise.senseId, source: category,
  }));
}

/**
 * Adds a bounded recovery item for the mistake at the session cursor. It prefers another authored
 * context, then a more supported kind, stays within the session's kind filter and is placed after up
 * to RETRY_SPACING other questions. Returns the same session when no retry is available or allowed.
 */
export function addRecovery(session: LearningSession, exercises: Exercise[]): LearningSession {
  const failed = session.queue[session.cursor];
  if (!failed) throw new RangeError('No active session item');
  const used = session.retryCounts[failed.senseId] ?? 0;
  if (used >= RETRY_LIMIT) return session;

  const failedContext = exercises.find((exercise) => exercise.id === failed.exerciseId)?.contextId;
  const kinds = session.config.kinds;
  const [retry] = exercises
    .filter((exercise) => exercise.active && exercise.senseId === failed.senseId
      && (!kinds || kinds.includes(exercise.kind)))
    .sort((a, b) =>
      Number(a.id === failed.exerciseId) - Number(b.id === failed.exerciseId)
      || Number(a.contextId === failedContext) - Number(b.contextId === failedContext)
      || KIND_DEMAND[a.kind] - KIND_DEMAND[b.kind]
      || a.id.localeCompare(b.id));
  if (!retry) return session;

  const at = Math.min(session.cursor + 1 + RETRY_SPACING, session.queue.length);
  const entry: QueueEntry = {
    exerciseId: retry.id, exerciseVersion: retry.version, senseId: retry.senseId, source: 'retry',
  };
  return {
    ...session,
    queue: [...session.queue.slice(0, at), entry, ...session.queue.slice(at)],
    retryCounts: { ...session.retryCounts, [failed.senseId]: used + 1 },
  };
}
