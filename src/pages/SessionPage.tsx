import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import type { AttemptCommit, LearningSession } from '../domain/model';
import { RETRY_SPACING } from '../domain/session';
import { submitAnswer } from '../domain/transition';
import { StatePanel } from '../components/StatePanel';
import { IntroCard } from '../features/session/IntroCard';
import { Question, type CheckInput, type CheckResult } from '../features/session/Question';
import { SessionHeader } from '../features/session/SessionHeader';

/** Focus-mode session: introduction, question and feedback for the current queue item. */
export function SessionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { catalog, snapshot, settings } = useLearning();
  const index = useMemo(() => ({
    exercises: new Map(catalog.exercises.map((item) => [item.id, item])),
    senses: new Map(catalog.senses.map((item) => [item.id, item])),
    lessons: new Map(catalog.lessons.map((item) => [item.id, item])),
    topics: new Map(catalog.topics.map((item) => [item.id, item])),
  }), [catalog]);
  // Answers advance a local copy of the saved session; durable saving is connected separately.
  const [session, setSession] = useState<LearningSession | null>(snapshot.currentSession);
  const [cards, setCards] = useState(() => new Map(snapshot.cards.map((card) => [card.senseId, card])));
  const [attempts, setAttempts] = useState(snapshot.attempts);
  const [pending, setPending] = useState<AttemptCommit | null>(null);
  const [introduced, setIntroduced] = useState<string | null>(null);

  const goHome = { label: t('session.none.action'), onClick: () => navigate('/') };
  if (!session || session.status !== 'current') {
    const complete = session?.status === 'completed';
    return (
      <main className="center-screen" id="main">
        <StatePanel
          title={complete ? t('session.complete.title') : t('session.none.title')}
          body={complete ? t('session.complete.body') : t('session.none.body')}
          action={goHome}
        />
      </main>
    );
  }

  const item = session.queue[session.cursor];
  const exercise = index.exercises.get(item.exerciseId);
  const sense = index.senses.get(item.senseId);
  if (!exercise || !sense || !exercise.active || exercise.version !== item.exerciseVersion || exercise.senseId !== sense.id) {
    return (
      <main className="center-screen" id="main">
        <StatePanel title={t('session.contentChanged.title')} body={t('session.contentChanged.body')} action={goHome} role="alert" />
      </main>
    );
  }

  const itemKey = `${session.id}:${session.cursor}`;
  const contexts = catalog.contexts.filter((context) => context.senseId === sense.id);
  const showIntro = item.source === 'new' && !cards.has(sense.id) && introduced !== itemKey;
  const lesson = index.lessons.get(sense.lessonId);
  // A retry is "in a new context" relative to the latest failed or revealed attempt that caused it.
  const lastFailure = attempts
    .filter((attempt) => attempt.sessionId === session.id && attempt.senseId === sense.id
      && (attempt.outcome === 'incorrect' || attempt.answerRevealed))
    .reduce<(typeof attempts)[number] | undefined>((latest, attempt) => (
      !latest || attempt.attemptedAt > latest.attemptedAt ? attempt : latest), undefined);

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
    setPending(transition.commit);
    const next = transition.commit.session;
    const inserted = next.queue.length > session.queue.length
      ? next.queue[Math.min(session.cursor + 1 + RETRY_SPACING, session.queue.length)]
      : undefined;
    const retryContext = inserted && index.exercises.get(inserted.exerciseId)?.contextId;
    return {
      correct: transition.correct,
      evidence: transition.evidence,
      supported: input.hintUsed || input.answerRevealed,
      recovery: !inserted ? null : retryContext !== exercise.contextId ? 'new-context' : 'same-context',
    };
  }

  function advance() {
    if (!pending) return;
    setSession(pending.session);
    setCards((current) => new Map(current).set(pending.progress.senseId, pending.progress));
    setAttempts((current) => [...current, pending.attempt]);
    setPending(null);
  }

  return (
    <div className="session-screen">
      <SessionHeader answered={session.cursor} total={session.queue.length} />
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
          onCheck={check}
          onContinue={advance}
        />
      )}
    </div>
  );
}
