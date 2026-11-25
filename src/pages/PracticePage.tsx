import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import { Select } from '../components/Select';
import { Icon, type IconName } from '../components/Icon';
import { StartPractice } from '../components/StartPractice';
import type { ExerciseKind, SessionConfig } from '../domain/model';
import { buildQueue } from '../domain/session';

const PRESETS: { mode: 'quick' | 'due' | 'mistakes' | 'weak'; icon: IconName }[] = [
  { mode: 'quick', icon: 'calendar' },
  { mode: 'due', icon: 'retry' },
  { mode: 'mistakes', icon: 'alert' },
  { mode: 'weak', icon: 'practice' },
];
const KINDS: ExerciseKind[] = ['definition-match', 'multiple-choice-cloze', 'typing-cloze', 'collocation-match', 'sentence-build'];

export function PracticePage() {
  const { t } = useTranslation();
  const { catalog, snapshot, settings } = useLearning();
  const [topic, setTopic] = useState('');
  const [kind, setKind] = useState<ExerciseKind | ''>('');
  const [budget, setBudget] = useState(10);
  const now = new Date();
  const countFor = (config: SessionConfig) => buildQueue({
    config, topics: catalog.topics, lessons: catalog.lessons, senses: catalog.senses,
    exercises: catalog.exercises, progress: snapshot.cards, now,
    timezone: settings.timezone, newPerDay: settings.newPerDay,
  }).length;
  const custom: SessionConfig = {
    mode: 'custom', questionBudget: budget,
    ...(topic ? { topicId: topic } : {}),
    ...(kind ? { kinds: [kind] } : {}),
  };
  const customCount = countFor(custom);
  const current = snapshot.currentSession?.status === 'current' ? snapshot.currentSession : null;

  return (
    <div className="page practice-page">
      <div className="page-heading">
        <h1>{t('practice.title')}</h1>
        <p>{t('practice.intro')}</p>
      </div>
      {current && (
        <div className="practice-resume" role="status">
          <p>{t('practice.unfinished', { current: current.cursor, total: current.queue.length })}</p>
          <Link to="/session">{t('practice.resume')}</Link>
        </div>
      )}
      <section aria-labelledby="practice-presets">
        <h2 id="practice-presets">{t('practice.presets')}</h2>
        <div className="practice-presets">
          {PRESETS.map(({ mode, icon }) => {
            const config: SessionConfig = { mode, questionBudget: 10 };
            const count = countFor(config);
            return (
              <article className={`practice-card practice-${mode}`} key={mode}>
                <span className="practice-icon"><Icon name={icon} size={26} /></span>
                <div>
                  <h3>{t(`practice.modes.${mode}.title`)}</h3>
                  <p>{t(`practice.modes.${mode}.description`)}</p>
                  <p className="muted">{t('practice.available', { count })}</p>
                  <StartPractice config={config} label={t('practice.start')} variant="secondary" />
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="practice-custom" aria-labelledby="practice-custom">
        <h2 id="practice-custom">{t('practice.customTitle')}</h2>
        <p>{t('practice.customBody')}</p>
        <div className="practice-fields">
          <label className="field">{t('practice.topic')}
            <Select value={topic} onValueChange={setTopic}>
              <option value="">{t('library.allTopics')}</option>
              {catalog.topics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </Select>
          </label>
          <label className="field">{t('practice.kind')}
            <Select value={kind} onValueChange={(value) => setKind(value as ExerciseKind | '')}>
              <option value="">{t('practice.allKinds')}</option>
              {KINDS.map((item) => <option key={item} value={item}>{t(`session.kinds.${item}`)}</option>)}
            </Select>
          </label>
          <label className="field">{t('practice.budget')}
            <input type="number" min={1} max={30} value={budget}
              onChange={(event) => setBudget(Math.min(30, Math.max(1, Number(event.target.value) || 1)))} />
          </label>
        </div>
        <p className="notice" role="status">
          {customCount === 0 ? t('practice.none') : customCount < budget
            ? t('practice.undersized', { count: customCount, requested: budget })
            : t('practice.available', { count: customCount })}
        </p>
        <StartPractice config={custom} label={t('practice.create')} />
        {topic && <StartPractice config={{ mode: 'topic', topicId: topic, questionBudget: 10 }}
          label={t('practice.topicStart')} variant="secondary" />}
      </section>
    </div>
  );
}
