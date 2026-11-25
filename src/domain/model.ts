export type InterfaceLocale = 'en' | 'vi';

export interface CurriculumTopic {
  id: string;
  courseId: string;
  levelId: string;
  title: string;
  position: number;
}

export interface CurriculumLesson {
  id: string;
  topicId: string;
  title: string;
  position: number;
}

export interface VocabularySense {
  id: string;
  lessonId: string;
  headword: string;
  partOfSpeech: string;
  definition: string;
  viGloss: string | null;
  ipa: string | null;
  collocations: string[];
  version: number;
}

export interface VocabularyContext {
  senseId: string;
  id: string;
  example: string;
}

type Option = { id: string; text: string };
type NonEmpty<T> = [T, ...T[]];

type ExercisePayload = {
  'definition-match': { choices: NonEmpty<Option>; correctChoiceId: string };
  'multiple-choice-cloze': { choices: NonEmpty<Option>; correctChoiceId: string };
  'typing-cloze': { acceptedAnswers: NonEmpty<string> };
  'collocation-match': { choices: NonEmpty<Option>; correctChoiceId: string };
  'sentence-build': { chunks: NonEmpty<Option>; correctOrder: NonEmpty<string> };
};

export type ExerciseKind = keyof ExercisePayload;

export type ExerciseOf<Kind extends ExerciseKind> = {
  id: string;
  senseId: string;
  contextId: string;
  kind: Kind;
  prompt: string;
  explanation: string;
  version: number;
  active: boolean;
} & ExercisePayload[Kind];

export type Exercise = { [Kind in ExerciseKind]: ExerciseOf<Kind> }[ExerciseKind];

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface SerializedCard {
  version: number;
  dueAt: string;
  data: Record<string, JsonValue>;
}

export type RecallGrade = 'again' | 'hard' | 'good';
export type MasteryStage = 'new' | 'learning' | 'familiar' | 'mastered';

export interface MasteryEvidence {
  reviewDays: string[];
  contextIds: string[];
  hasTypingSuccess: boolean;
}

export interface CardProgress {
  senseId: string;
  card: SerializedCard;
  firstSeenAt: string;
  masteryStage: MasteryStage;
  evidence: MasteryEvidence;
  mistakeCount: number;
  lastMistakeAt: string | null;
}

export interface SessionConfig {
  mode: 'daily' | 'lesson' | 'quick' | 'due' | 'mistakes' | 'weak' | 'topic' | 'custom';
  questionBudget: number;
  topicId?: string;
  lessonId?: string;
  kinds?: ExerciseKind[];
  senseIds?: string[];
}

export interface QueueEntry {
  exerciseId: string;
  exerciseVersion: number;
  senseId: string;
  source: 'new' | 'due' | 'weak' | 'practice' | 'retry';
}

export interface LearningSession {
  id: string;
  config: SessionConfig;
  queue: QueueEntry[];
  cursor: number;
  revision: number;
  retryCounts: Partial<Record<string, number>>;
  status: 'current' | 'completed' | 'replaced';
  startedAt: string;
  updatedAt: string;
}

export type Attempt = {
  id: string;
  sessionId: string;
  exerciseId: string;
  senseId: string;
  contextId: string;
  exerciseVersion: number;
  outcome: 'correct' | 'incorrect';
  hintUsed: boolean;
  isRetry: boolean;
  qualifiedReview: boolean;
  grade: RecallGrade | null;
  attemptedAt: string;
  responseTimeMs: number | null;
} & (
  | { exerciseKind: 'sentence-build'; answer: string[]; answerRevealed: boolean }
  | {
      exerciseKind: Exclude<ExerciseKind, 'sentence-build'>;
      answer: string;
      answerRevealed: boolean;
    }
  | { exerciseKind: ExerciseKind; answer: null; answerRevealed: true; outcome: 'incorrect' }
);

export interface AttemptCommit {
  attempt: Attempt;
  progress: CardProgress;
  session: LearningSession;
  expectedRevision: number;
}

export interface UserSettings {
  locale: InterfaceLocale;
  dailyMinutes: number;
  newPerDay: number;
  voiceId: string | null;
  speechRate: number;
  timezone: string;
  onboardingCompleted: boolean;
}

export interface Bookmark {
  senseId: string;
}
