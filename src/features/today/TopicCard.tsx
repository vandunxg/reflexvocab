import { useTranslation } from 'react-i18next';
import type { CurriculumTopic, SessionConfig } from '../../domain/model';
import { StartPractice } from '../../components/StartPractice';

export interface TopicStats {
  topic: CurriculumTopic;
  tone: number;
  levelName: string;
  sample: string[];
  total: number;
  started: number;
  mastered: number;
  /** Whether a session for this topic would introduce a new word today. */
  offersNew: boolean;
  config: SessionConfig;
}

/** A topic on Today: persisted started/mastered counts and a secondary topic-practice action. */
export function TopicCard({ stats }: { stats: TopicStats }) {
  const { t } = useTranslation();
  const { topic, tone, levelName, sample, total, started, mastered, offersNew, config } = stats;
  return (
    <article className={`topic-card topic-tone-${tone}`}>
      <div className="topic-card-art" aria-hidden="true"><span /><span /></div>
      <div className="topic-card-body">
        <div className="topic-card-title">
          <h3 lang="en">{topic.title}</h3>
          <span className="topic-card-level">{levelName}</span>
        </div>
        <p className="topic-card-sample" lang="en">{sample.join(' · ')}</p>
        <div
          className="topic-card-bar"
          role="progressbar"
          aria-label={t('today.topics.progress', { title: topic.title, started, total })}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={started}
        >
          <span style={{ width: `${total ? (started / total) * 100 : 0}%` }} />
        </div>
        <p className="topic-card-meta">{t('today.topics.meta', { started, total, mastered })}</p>
        <StartPractice
          config={config}
          label={offersNew ? t('today.topics.learnNew') : t('today.topics.practise')}
          variant="secondary"
        />
      </div>
    </article>
  );
}
