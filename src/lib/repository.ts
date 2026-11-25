import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Attempt, AttemptCommit, Bookmark, CardProgress, LearningSession, UserSettings,
} from '../domain/model';

type Row<T> = { [K in keyof T]: T[K] };
type CardRow = {
  sense_id: string; card: CardProgress['card']; first_seen_at: string;
  mastery_stage: CardProgress['masteryStage']; evidence: CardProgress['evidence'];
  mistake_count: number; last_mistake_at: string | null;
};
type SessionRow = {
  id: string; config: LearningSession['config']; queue: LearningSession['queue'];
  cursor: number; revision: number; retry_counts: LearningSession['retryCounts'];
  status: LearningSession['status']; started_at: string; updated_at: string;
};
type SettingsRow = {
  locale: UserSettings['locale']; daily_minutes: number; new_per_day: number;
  voice_id: string | null; speech_rate: number; timezone: string; onboarding_completed: boolean;
};
type AttemptRow = {
  id: string; session_id: string; exercise_id: string; sense_id: string; context_id: string;
  exercise_kind: Attempt['exerciseKind']; exercise_version: number; answer: Attempt['answer'];
  outcome: Attempt['outcome']; hint_used: boolean; answer_revealed: boolean; is_retry: boolean;
  qualified_review: boolean; grade: Attempt['grade']; attempted_at: string; response_time_ms: number | null;
};

export type RepositoryErrorCode = 'conflict' | 'invalid-input' | 'unauthenticated' | 'unavailable';

function fail(error: { code?: string; message: string }): never {
  const code: RepositoryErrorCode =
    error.code === '40001' ? 'conflict'
      : error.code === '42501' ? 'unauthenticated'
        : /^(22|23)/.test(error.code ?? '') ? 'invalid-input' : 'unavailable';
  throw Object.assign(new Error(error.message), { code });
}

export function createLearningRepository(client: SupabaseClient) {
  async function rpc(name: string, args: Record<string, unknown>) {
    const { error } = await client.rpc(name, args);
    if (error) fail(error);
  }
  async function loadSenses(table: 'card_progress' | 'bookmarks') {
    const rows: Record<string, unknown>[] = [];
    for (;;) {
      const { data, error } = await client.from(table).select('*')
        .order('sense_id').range(rows.length, rows.length + 999);
      if (error) fail(error);
      if (!data?.length) return rows;
      rows.push(...data);
    }
  }
  async function loadAttempts() {
    const rows: AttemptRow[] = [];
    while (rows.length < 1000) {
      const { data, error } = await client.from('attempts').select('*')
        .order('attempted_at', { ascending: false }).order('id', { ascending: false })
        .range(rows.length, 999);
      if (error) fail(error);
      if (!data?.length) break;
      rows.push(...data as AttemptRow[]);
    }
    return rows;
  }
  return {
    async load(): Promise<{
      cards: CardProgress[]; attempts: Attempt[]; attemptHistoryLimit: number;
      currentSession: LearningSession | null; settings: UserSettings | null; bookmarks: Bookmark[];
    }> {
      const [cards, bookmarks, attempts, ...results] = await Promise.all([
        loadSenses('card_progress'),
        loadSenses('bookmarks'),
        loadAttempts(),
        client.from('learning_sessions').select('*').eq('status', 'current'),
        client.from('user_settings').select('*'),
      ]);
      for (const result of results) if (result.error) fail(result.error);
      const [sessions, settings] = results.map((result) => result.data ?? []);
      const session = (sessions as SessionRow[])[0];
      const setting = (settings as SettingsRow[])[0];
      return {
        cards: (cards as unknown as CardRow[]).map((row) => ({
          senseId: row.sense_id, card: row.card, firstSeenAt: row.first_seen_at,
          masteryStage: row.mastery_stage, evidence: row.evidence,
          mistakeCount: row.mistake_count, lastMistakeAt: row.last_mistake_at,
        })),
        attempts: (attempts as AttemptRow[]).map((row) => ({
          id: row.id, sessionId: row.session_id, exerciseId: row.exercise_id,
          senseId: row.sense_id, contextId: row.context_id, exerciseKind: row.exercise_kind,
          exerciseVersion: row.exercise_version, answer: row.answer, outcome: row.outcome,
          hintUsed: row.hint_used, answerRevealed: row.answer_revealed, isRetry: row.is_retry,
          qualifiedReview: row.qualified_review, grade: row.grade, attemptedAt: row.attempted_at,
          responseTimeMs: row.response_time_ms,
        }) as Attempt),
        attemptHistoryLimit: 1000,
        currentSession: session ? {
          id: session.id, config: session.config, queue: session.queue, cursor: session.cursor,
          revision: session.revision, retryCounts: session.retry_counts, status: session.status,
          startedAt: session.started_at, updatedAt: session.updated_at,
        } : null,
        settings: setting ? {
          locale: setting.locale, dailyMinutes: setting.daily_minutes, newPerDay: setting.new_per_day,
          voiceId: setting.voice_id, speechRate: setting.speech_rate, timezone: setting.timezone,
          onboardingCompleted: setting.onboarding_completed,
        } : null,
        bookmarks: (bookmarks as unknown as Row<{ sense_id: string }>[]).map((row) => ({ senseId: row.sense_id })),
      };
    },
    startSession(session: LearningSession) {
      return rpc('start_learning_session', {
        session_id: session.id, config: session.config, queue: session.queue, started_at: session.startedAt,
      });
    },
    commitAttempt(change: AttemptCommit) {
      return rpc('commit_learning_attempt', { request: change });
    },
    saveSettings(changes: Partial<UserSettings>) {
      return rpc('save_settings', { changes });
    },
    setBookmark(senseId: string, saved: boolean) {
      return rpc('set_bookmark', { sense_id: senseId, saved });
    },
  };
}
