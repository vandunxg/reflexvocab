import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import type { AttemptCommit, LearningSession } from '../domain/model';
import { RETRY_SPACING } from '../domain/session';
import { submitAnswer } from '../domain/transition';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatePanel } from '../components/StatePanel';
import type { SaveState } from '../features/session/FeedbackPanel';
import { IntroCard } from '../features/session/IntroCard';
import { Question, type CheckInput, type CheckResult } from '../features/session/Question';
import { SessionHeader } from '../features/session/SessionHeader';
import { SessionSummary } from '../features/session/SessionSummary';

/** The answered question stays on screen, with its exact commit, until that commit is saved. */
interface Answered {
  session: LearningSession;
  commit: AttemptCommit;
  save: SaveState;
}

function saveFailure(error: unknown): SaveState {
  const code = (error as { code?: string }).code;
  if (code === 'conflict') return 'conflict';
  if (code === 'unauthenticated') return 'unauthenticated';
  return code === 'invalid-input' ? 'rejected' : 'unavailable';
}

/** Focus-mode session: introduction, question, saved feedback and completion summary. */
export function SessionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { auth, catalog, snapshot, settings, repository, refresh, applyCommit } = useLearning();
  const index = useMemo(() => ({
    exercises: new Map(catalog.exercises.map((item) => [item.id, item])),
    senses: new Map(catalog.senses.map((item) => [item.id, item])),
    lessons: new Map(catalog.lessons.map((item) => [item.id, item])),
    topics: new Map(catalog.topics.map((item) => [item.id, item])),
  }), [catalog]);
  const cards = useMemo(() => new Map(snapshot.cards.map((card) => [card.senseId, card])), [snapshot.cards]);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [introduced, setIntroduced] = useState<string | null>(null);
  const [dialog, setDialog] = useState<'exit' | 'reload' | null>(null);
  const unsaved = answered !== null && answered.save !== 'saved';

  // Closing the tab cannot keep an unsaved answer; ask the browser to warn first.
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsaved]);

  const session = answered?.session ?? snapshot.currentSession;
  const goHome = () => navigate('/');

  if (session?.status === 'completed') {
    return (
      <div className="session-screen">
        <SessionHeader answered={session.queue.length} total={session.queue.length} />
        <SessionSummary session={session} />
      </div>
    );
  }
  if (!session || session.status !== 'current') {
    return (
      <main className="center-screen" id="main">
        <StatePanel title={t('session.none.title')} body={t('session.none.body')} action={{ label: t('session.none.action'), onClick: goHome }} />
      </main>
    );
  }

  const item = session.queue[session.cursor];
  const exercise = index.exercises.get(item.exerciseId);
  const sense = index.senses.get(item.senseId);
  if (!exercise || !sense || !exercise.active || exercise.version !== item.exerciseVersion || exercise.senseId !== sense.id) {
    return (
      <main className="center-screen" id="main">
        <StatePanel
          title={t('session.contentChanged.title')}
          body={t('session.contentChanged.body')}
          action={{ label: t('session.contentChanged.action'), onClick: goHome }}
          role="alert"
        />
      </main>
    );
  }

  const itemKey = `${session.id}:${session.cursor}`;
  const contexts = catalog.contexts.filter((context) => context.senseId === sense.id);
  const showIntro = item.source === 'new' && !cards.has(sense.id) && introduced !== itemKey;
  const lesson = index.lessons.get(sense.lessonId);
  // A retry is "in a new context" relative to the latest failed or revealed attempt that caused it.
  const lastFailure = snapshot.attempts
    .filter((attempt) => attempt.sessionId === session.id && attempt.senseId === sense.id
      && (attempt.outcome === 'incorrect' || attempt.answerRevealed))
    .reduce<(typeof snapshot.attempts)[number] | undefined>((latest, attempt) => (
      !latest || attempt.attemptedAt > latest.attemptedAt ? attempt : latest), undefined);

  async function save(commit: AttemptCommit) {
    setAnswered((current) => current?.commit === commit ? { ...current, save: 'saving' } : current);
    try {
      await repository.commitAttempt(commit);
    } catch (error) {
      setAnswered((current) => current?.commit === commit ? { ...current, save: saveFailure(error) } : current);
      return;
    }
    applyCommit(commit);
    setAnswered((current) => current?.commit === commit ? { ...current, save: 'saved' } : current);
  }

  function check(input: CheckInput): CheckResult | null {
    if (!session || !exercise) return null;
    const transition = submitAnswer({
      session,
      exercise,
      progress: cards.get(exercise.senseId),
      exercises: catalog.exercises,
      ...input,
      attemptId: crypto.randomUUID(),
      attemptedAt: new Date(),
      timezone: settings.timezone,
    });
    if (!transition.ok) {
      console.error('Answer rejected by the session transition', transition.code);
      return null;
    }
    const { commit } = transition;
    setAnswered({ session, commit, save: 'saving' });
    void save(commit);
    const inserted = commit.session.queue.length > session.queue.length
      ? commit.session.queue[Math.min(session.cursor + 1 + RETRY_SPACING, session.queue.length)]
      : undefined;
    const retryContext = inserted && index.exercises.get(inserted.exerciseId)?.contextId;
    return {
      correct: transition.correct,
      evidence: transition.evidence,
      supported: input.hintUsed || input.answerRevealed,
      recovery: !inserted ? null : retryContext !== exercise.contextId ? 'new-context' : 'same-context',
    };
  }

  async function reload() {
    setDialog(null);
    try {
      await refresh();
    } catch {
      return; // Still offline: keep the unsaved answer and its retry option.
    }
    setAnswered(null);
  }

  function exit(event: MouseEvent) {
    if (!unsaved) return;
    event.preventDefault();
    setDialog('exit');
  }

  return (
    <div className="session-screen">
      <SessionHeader answered={session.cursor} total={session.queue.length} onExit={exit} />
      {showIntro ? (
        <IntroCard
          key={itemKey}
          sense={sense}
          contexts={contexts}
          topicLabel={(lesson && index.topics.get(lesson.topicId)?.title) ?? null}
          onContinue={() => setIntroduced(itemKey)}
        />
      ) : (
        <Question
          key={itemKey}
          exercise={exercise}
          sense={sense}
          context={contexts.find((context) => context.id === exercise.contextId)}
          isRetry={item.source === 'retry'}
          retryNewContext={lastFailure !== undefined && lastFailure.contextId !== exercise.contextId}
          save={answered && {
            state: answered.save,
            isLast: answered.commit.session.status === 'completed',
            onRetry: () => void save(answered.commit),
            onReload: () => setDialog('reload'),
            onSignIn: () => void auth.signOut(),
          }}
          onCheck={check}
          onContinue={() => setAnswered((current) => current?.save === 'saved' ? null : current)}
        />
      )}
      <ConfirmDialog
        open={dialog === 'reload'}
        title={t('session.reloadDialog.title')}
        body={t('session.reloadDialog.body')}
        cancelLabel={t('session.reloadDialog.stay')}
        confirmLabel={t('session.reloadDialog.confirm')}
        onCancel={() => setDialog(null)}
        onConfirm={() => void reload()}
      />
      <ConfirmDialog
        open={dialog === 'exit'}
        title={t('session.exitDialog.title')}
        body={t('session.exitDialog.body')}
        cancelLabel={t('session.exitDialog.stay')}
        confirmLabel={t('session.exitDialog.confirm')}
        onCancel={() => setDialog(null)}
        onConfirm={goHome}
      />
    </div>
  );
}
