import { useMemo, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import type { LearningSession, SessionConfig } from '../domain/model';
import { buildQueue, questionBudgetFor } from '../domain/session';
import { DEFAULT_SETTINGS } from '../domain/settings';
import { Icon } from '../components/Icon';
import { OnboardingHeader } from '../features/onboarding/OnboardingHeader';

const MINUTE_OPTIONS = [5, 10, 15, 20] as const;
const WORD_OPTIONS = [4, 6, 8, 10] as const;
const TOPIC_ART = [
  { background: '#3d57e6', shapes: ['#d2f55d', '#ffffff', '#ff76d6'] },
  { background: '#ff9238', shapes: ['#ffcf3d', '#ffffff', '#3d57e6'] },
  { background: '#8a5cf0', shapes: ['#d2f55d', '#ffffff', '#ff76d6'] },
];

/**
 * Three optional steps after first sign-in (OB-Time, OB-NewWords, OB-Topic, M-Onboarding boards).
 * Skipping fills only that step's default; the topic is passed to the first session, never saved.
 */
export function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { catalog, snapshot, settings, repository, applySession, applySettings } = useLearning();
  const topics = useMemo(() => {
    const lessonTopic = new Map(catalog.lessons.map((lesson) => [lesson.id, lesson.topicId]));
    const senseTopic = new Map(catalog.senses.map((sense) => [sense.id, lessonTopic.get(sense.lessonId)]));
    const playable = new Set(catalog.exercises.filter((exercise) => exercise.active).map((exercise) => senseTopic.get(exercise.senseId)));
    return catalog.topics.filter((topic) => playable.has(topic.id))
      .sort((a, b) => Number(b.levelId === 'foundation') - Number(a.levelId === 'foundation') || a.position - b.position)
      .map((topic) => ({
        topic,
        senses: catalog.senses.filter((sense) => senseTopic.get(sense.id) === topic.id),
      }));
  }, [catalog]);
  // The first editorially ordered foundation topic with playable content.
  const defaultTopicId = topics[0]?.topic.id ?? null;

  const [step, setStep] = useState(1);
  const [minutes, setMinutes] = useState(DEFAULT_SETTINGS.dailyMinutes);
  const [words, setWords] = useState(DEFAULT_SETTINGS.newPerDay);
  const [topicId, setTopicId] = useState(defaultTopicId);
  const [status, setStatus] = useState<'idle' | 'finishing' | 'failed' | 'empty'>('idle');

  // While finishing, this page itself navigates into the first session.
  if (settings.onboardingCompleted && status !== 'finishing') return <Navigate to="/" replace />;

  async function finish(chosenTopic: string | null) {
    setStatus('finishing');
    const now = new Date();
    const config: SessionConfig = chosenTopic
      ? { mode: 'topic', topicId: chosenTopic, questionBudget: questionBudgetFor(minutes) }
      : { mode: 'daily', questionBudget: questionBudgetFor(minutes) };
    const queue = buildQueue({
      config, topics: catalog.topics, lessons: catalog.lessons, senses: catalog.senses,
      exercises: catalog.exercises, progress: snapshot.cards, now,
      timezone: settings.timezone, newPerDay: words,
    });
    if (queue.length === 0) {
      setStatus('empty');
      return;
    }
    const session: LearningSession = {
      id: crypto.randomUUID(), config, queue, cursor: 0, revision: 0, retryCounts: {},
      status: 'current', startedAt: now.toISOString(), updatedAt: now.toISOString(),
    };
    const changes = { dailyMinutes: minutes, newPerDay: words, onboardingCompleted: true };
    try {
      // The account is marked ready only after its first session exists.
      await repository.startSession(session);
      await repository.saveSettings(changes);
    } catch {
      setStatus('failed');
      return;
    }
    applySession(session);
    applySettings(changes);
    navigate('/session', { replace: true });
  }

  function next() {
    if (step < 3) setStep(step + 1);
    else void finish(topicId);
  }

  function skip() {
    if (step === 1) setMinutes(DEFAULT_SETTINGS.dailyMinutes);
    if (step === 2) setWords(DEFAULT_SETTINGS.newPerDay);
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setTopicId(defaultTopicId);
    void finish(defaultTopicId);
  }

  const busy = status === 'finishing';
  const topicTitle = topics.find((item) => item.topic.id === topicId)?.topic.title ?? '';
  let content: ReactNode;
  let footer: string;
  if (step === 1) {
    footer = t('onboarding.time.footer');
    content = (
      <StepFrame eyebrow={t('onboarding.time.eyebrow')} title={t('onboarding.time.title')} body={t('onboarding.time.body')} tone="yellow" step={step}>
        <div className="choice-list">
          {MINUTE_OPTIONS.map((value) => (
            <ChoiceCard key={value} name="minutes" checked={minutes === value} onChange={() => setMinutes(value)}>
              <span className={`choice-icon choice-icon-${value}`} aria-hidden="true"><PieIcon fraction={value / 20} /></span>
              <span className="choice-text">
                <span className="choice-title">
                  {t('onboarding.time.minutes', { minutes: value })}
                  {value === DEFAULT_SETTINGS.dailyMinutes && <span className="choice-badge">{t('onboarding.time.suggested')}</span>}
                </span>
                <span className="choice-body">{t(`onboarding.time.option${value}`)}</span>
              </span>
            </ChoiceCard>
          ))}
        </div>
      </StepFrame>
    );
  } else if (step === 2) {
    footer = t('onboarding.words.footer');
    content = (
      <StepFrame eyebrow={t('onboarding.words.eyebrow')} title={t('onboarding.words.title')} body={t('onboarding.words.body')} tone="purple" step={step}>
        <div className="choice-grid">
          {WORD_OPTIONS.map((value) => (
            <ChoiceCard key={value} name="words" checked={words === value} onChange={() => setWords(value)} tall>
              <span className="choice-text">
                <span className="choice-number">
                  {value}
                  {value === DEFAULT_SETTINGS.newPerDay && <span className="choice-badge">{t('onboarding.words.default')}</span>}
                </span>
                <span className="choice-body choice-body-strong">{t('onboarding.words.perDay', { pace: t(`onboarding.words.pace${value}`) })}</span>
                <span className={`choice-dots choice-dots-${value}`} aria-hidden="true">
                  {Array.from({ length: value }, (_, index) => <span key={index} />)}
                </span>
              </span>
            </ChoiceCard>
          ))}
        </div>
        <p className="notice onboarding-note"><Icon name="alert" size={18} />{t('onboarding.words.note')}</p>
      </StepFrame>
    );
  } else {
    footer = t('onboarding.topic.footer', { minutes, words, topic: topicTitle });
    content = (
      <StepFrame eyebrow={t('onboarding.topic.eyebrow')} title={t('onboarding.topic.title')} body={t('onboarding.topic.body')} tone="blue" step={step} wide>
        <div className="topic-grid">
          {topics.map(({ topic, senses }, index) => {
            const art = TOPIC_ART[index % TOPIC_ART.length];
            return (
              <ChoiceCard key={topic.id} name="topic" checked={topicId === topic.id} onChange={() => setTopicId(topic.id)} topic>
                <span className="topic-art" style={{ background: art.background }} aria-hidden="true">
                  <svg width="100%" height="100%" viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice">
                    <circle cx="70" cy="70" r="48" fill={art.shapes[0]} />
                    <rect x="98" y="46" width="70" height="70" rx="12" fill={art.shapes[1]} transform="rotate(12 133 81)" />
                    <circle cx="232" cy="124" r="56" fill={art.shapes[2]} />
                  </svg>
                </span>
                <span className="topic-text">
                  <span className="choice-title" lang="en">
                    {topic.title}
                    {topicId === topic.id && <span className="choice-badge">{t('onboarding.topic.selected')}</span>}
                  </span>
                  <span className="choice-body">{t('onboarding.topic.senseCount', { count: senses.length })}</span>
                  <span className="topic-chips" lang="en">
                    {senses.slice(0, 4).map((sense) => <span key={sense.id}>{sense.headword}</span>)}
                  </span>
                </span>
              </ChoiceCard>
            );
          })}
        </div>
      </StepFrame>
    );
  }

  return (
    <div className="onboarding">
      <OnboardingHeader step={step} disabled={busy} onBack={() => setStep(Math.max(1, step - 1))} onSkip={skip} />
      {content}
      <footer className="session-footer">
        <div className={step === 3 ? 'session-footer-inner onboarding-footer onboarding-footer-wide' : 'session-footer-inner onboarding-footer'}>
          <span className="muted session-footer-text">{footer}</span>
          {status === 'failed' && <p className="notice notice-error onboarding-error" role="alert"><Icon name="alert" size={18} />{t('onboarding.failed')}</p>}
          {status === 'empty' && <p className="notice onboarding-error" role="status">{t('onboarding.empty')}</p>}
          <button type="button" className="btn btn-primary btn-session" onClick={next} disabled={busy}>
            {busy ? t('onboarding.finishing') : step === 3 ? t('onboarding.finish') : t('onboarding.continue')}
            {!busy && <Icon name="arrowRight" />}
          </button>
        </div>
      </footer>
    </div>
  );
}

function StepFrame({ eyebrow, title, body, tone, step, wide = false, children }: {
  eyebrow: string;
  title: string;
  body: string;
  tone: 'yellow' | 'purple' | 'blue';
  step: number;
  wide?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <main className={wide ? 'onboarding-main onboarding-main-wide' : 'onboarding-main'} id="main">
      <p className="onboarding-step eyebrow">{t('onboarding.stepOf', { step })}</p>
      <span className={`pill onboarding-pill onboarding-pill-${tone}`}>{eyebrow}</span>
      <fieldset className="onboarding-fieldset">
        <legend><h1>{title}</h1></legend>
        <p className="onboarding-body muted">{body}</p>
        {children}
      </fieldset>
    </main>
  );
}

function ChoiceCard({ name, checked, onChange, tall = false, topic = false, children }: {
  name: string;
  checked: boolean;
  onChange: () => void;
  tall?: boolean;
  topic?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={['choice-card', tall && 'choice-card-tall', topic && 'choice-card-topic', checked && 'is-checked'].filter(Boolean).join(' ')}>
      {children}
      <input type="radio" className="choice-radio" name={name} checked={checked} onChange={onChange} />
    </label>
  );
}

function PieIcon({ fraction }: { fraction: number }) {
  const angle = fraction * 2 * Math.PI;
  const x = 12 + 8 * Math.sin(angle);
  const y = 12 - 8 * Math.cos(angle);
  const sector = fraction >= 1
    ? <circle cx="12" cy="12" r="8" />
    : <path d={`M12 12V4A8 8 0 ${fraction > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}Z`} />;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <g fill="currentColor">{sector}</g>
    </svg>
  );
}
