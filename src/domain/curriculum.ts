import type { CardProgress, CurriculumLesson, CurriculumTopic, Exercise, MasteryStage, VocabularySense } from './model';

export interface PathLesson {
  lesson: CurriculumLesson;
  topic: CurriculumTopic;
  /** 1-based topic order within its level and lesson order within its topic, for labels. */
  topicNumber: number;
  lessonNumber: number;
  senses: VocabularySense[];
  /** Senses with committed learning activity; opening, browsing or skipping adds none. */
  covered: number;
  unavailable: number;
  mastered: number;
  status: 'untouched' | 'partial' | 'complete';
}

export interface PathLevel {
  courseId: string;
  levelId: string;
  lessons: PathLesson[];
}

/**
 * Course → level → topic → lesson in reviewed catalog order. Completion requires committed progress
 * for every sense, including those without an active exercise. Completion is coverage, not mastery.
 */
export function buildPath(input: {
  topics: CurriculumTopic[];
  lessons: CurriculumLesson[];
  senses: VocabularySense[];
  exercises: Exercise[];
  cards: CardProgress[];
}): PathLevel[] {
  const practisable = new Set(input.exercises.filter((exercise) => exercise.active).map((exercise) => exercise.senseId));
  const stages = new Map<string, MasteryStage>(input.cards.map((card) => [card.senseId, card.masteryStage]));
  const levels: PathLevel[] = [];
  for (const topic of [...input.topics].sort((a, b) => a.position - b.position)) {
    let level = levels.find((item) => item.courseId === topic.courseId && item.levelId === topic.levelId);
    if (!level) {
      level = { courseId: topic.courseId, levelId: topic.levelId, lessons: [] };
      levels.push(level);
    }
    const topicNumber = new Set(level.lessons.map((item) => item.topic.id)).size + 1;
    const lessons = input.lessons.filter((lesson) => lesson.topicId === topic.id).sort((a, b) => a.position - b.position);
    lessons.forEach((lesson, index) => {
      const senses = input.senses.filter((sense) => sense.lessonId === lesson.id);
      if (!senses.length) return;
      const covered = senses.filter((sense) => stages.has(sense.id)).length;
      level.lessons.push({
        lesson, topic, topicNumber, lessonNumber: index + 1, senses, covered,
        unavailable: senses.filter((sense) => !stages.has(sense.id) && !practisable.has(sense.id)).length,
        mastered: senses.filter((sense) => stages.get(sense.id) === 'mastered').length,
        status: covered === 0 ? 'untouched' : covered === senses.length ? 'complete' : 'partial',
      });
    });
  }
  return levels.filter((level) => level.lessons.length > 0);
}

/** Suggest the first lesson with uncovered senses that can currently be practised. */
export function nextLesson(path: PathLevel[]): PathLesson | undefined {
  return path.flatMap((level) => level.lessons).find((item) => item.covered + item.unavailable < item.senses.length);
}
