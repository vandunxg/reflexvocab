import { useMemo } from 'react';
import { useLearning } from '../../app/LearningProvider';
import { buildPath, type PathLesson } from '../../domain/curriculum';

/** The curriculum path with committed coverage for the signed-in learner. */
export function useLearningPath() {
  const { catalog, snapshot } = useLearning();
  return useMemo(() => buildPath({
    topics: catalog.topics, lessons: catalog.lessons, senses: catalog.senses,
    exercises: catalog.exercises, cards: snapshot.cards,
  }), [catalog, snapshot.cards]);
}

export const lessonHref = (item: PathLesson) => `/learn/lessons/${encodeURIComponent(item.lesson.id)}`;
export const padNumber = (value: number) => String(value).padStart(2, '0');
