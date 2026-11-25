import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CurriculumLesson, CurriculumTopic, Exercise, VocabularyContext, VocabularySense,
} from '../domain/model';

export interface Catalog {
  topics: CurriculumTopic[];
  lessons: CurriculumLesson[];
  senses: VocabularySense[];
  contexts: VocabularyContext[];
  /** Includes inactive exercises so a resumed queue can detect replaced content. */
  exercises: Exercise[];
}

type Rows = Record<string, unknown>[];

async function readAll(client: SupabaseClient, table: string, order: string[]): Promise<Rows> {
  const rows: Rows = [];
  for (;;) {
    let query = client.from(table).select('*');
    for (const column of order) query = query.order(column);
    const { data, error } = await query.range(rows.length, rows.length + 999);
    if (error) {
      throw Object.assign(new Error(error.message), {
        code: error.code === '42501' ? 'unauthenticated' : 'unavailable',
      });
    }
    rows.push(...(data as Rows));
    if (data.length < 1000) return rows;
  }
}

/** Reads the reviewed catalog through the signed-in learner's authenticated Data API session. */
export async function loadCatalog(client: SupabaseClient): Promise<Catalog> {
  const [topics, lessons, senses, contexts, exercises] = await Promise.all([
    readAll(client, 'curriculum_topics', ['position', 'id']),
    readAll(client, 'curriculum_lessons', ['position', 'id']),
    readAll(client, 'vocabulary_senses', ['lesson_id', 'id']),
    readAll(client, 'vocabulary_contexts', ['sense_id', 'id']),
    readAll(client, 'exercises', ['sense_id', 'id']),
  ]);
  return {
    topics: topics.map((row) => ({
      id: row.id, courseId: row.course_id, levelId: row.level_id, title: row.title, position: row.position,
    }) as CurriculumTopic),
    lessons: lessons.map((row) => ({
      id: row.id, topicId: row.topic_id, title: row.title, position: row.position,
    }) as CurriculumLesson),
    senses: senses.map((row) => ({
      id: row.id, lessonId: row.lesson_id, headword: row.headword, partOfSpeech: row.part_of_speech,
      definition: row.definition, viGloss: row.vi_gloss, ipa: row.ipa, collocations: row.collocations,
      version: row.version,
    }) as VocabularySense),
    contexts: contexts.map((row) => ({ senseId: row.sense_id, id: row.id, example: row.example }) as VocabularyContext),
    exercises: exercises.map((row) => ({
      ...(row.payload as object), id: row.id, senseId: row.sense_id, contextId: row.context_id, kind: row.kind,
      prompt: row.prompt, explanation: row.explanation, version: row.version, active: row.active,
    }) as Exercise),
  };
}
