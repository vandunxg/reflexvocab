import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import { localDay } from '../domain/mastery';
import type { QueueEntry, SessionConfig } from '../domain/model';
import { buildQueue, categorize, questionBudgetFor } from '../domain/session';
import { Icon } from '../components/Icon';
import { StartPractice } from '../components/StartPractice';
import { TopicCard, type TopicStats } from '../features/today/TopicCard';
import { levelName } from '../i18n';

type Filter = 'all' | 'due' | 'new' | 'weak';
const FILTERS: Filter[] = ['all', 'due', 'new', 'weak'];
const MIX = ['due', 'new', 'weak', 'practice'] as const;
// The repository loads at most this many recent attempts.
const ATTEMPT_WINDOW = 1000;

/** Today (`/`): one primary start-or-resume action, persisted counts and subordinate topic practice. */
export function HomePage() {
  const { t } = useTranslation();
  const { catalog, snapshot, settings } = useLearning();
  const [now] = useState(() => new Date());
  const [filter, setFilter] = useState<Filter>('all');
  const current = snapshot.currentSession?.status === 'current' ? snapshot.currentSession : null;
  const budget = questionBudgetFor(settings.dailyMinutes);

  const data = useMemo(() => {
    const plan = (config: SessionConfig) => buildQueue({
      config, topics: catalog.topics, lessons: catalog.lessons, senses: catalog.senses,
      exercises: catalog.exercises, progress: snapshot.cards, now,
      timezone: settings.timezone, newPerDay: settings.newPerDay,
    });
    const cards = new Map(snapshot.cards.map((card) => [card.senseId, card]));
    const topicOf = new Map(catalog.lessons.map((lesson) => [lesson.id, lesson.topicId]));
    const senses = catalog.senses.map((sense) => {
      const card = cards.get(sense.id);
      return { sense, card, topicId: topicOf.get(sense.lessonId), category: categorize(card, now) };
    });
    const topics: (TopicStats & { categories: Set<string> })[] = [...catalog.topics]
      .sort((a, b) => a.position - b.position)
      .map((topic, index) => {
        const own = senses.filter((item) => item.topicId === topic.id);
        const config: SessionConfig = { mode: 'topic', topicId: topic.id, questionBudget: budget };
        return {
          topic, tone: index % 3, config,
          levelName: levelName(t, topic.levelId),
          sample: own.slice(0, 4).map((item) => item.sense.headword),
          total: own.length,
          started: own.filter((item) => item.card).length,
          mastered: own.filter((item) => item.card?.masteryStage === 'mastered').length,
          offersNew: plan(config).some((entry) => entry.source === 'new'),
          categories: new Set(own.map((item) => item.category)),
        };
      })
      .filter((item) => item.total > 0);
    return {
      daily: plan({ mode: 'daily', questionBudget: budget }),
      topics,
      counts: {
        all: senses.length,
        due: senses.filter((item) => item.category === 'due').length,
        new: senses.filter((item) => item.category === 'new').length,
        weak: senses.filter((item) => item.category === 'weak').length,
      },
      started: snapshot.cards.length,
      mastered: snapshot.cards.filter((card) => card.masteryStage === 'mastered').length,
      attemptsToday: snapshot.attempts.filter((attempt) =>
        localDay(new Date(attempt.attemptedAt), settings.timezone) === localDay(now, settings.timezone)).length,
    };
  }, [catalog, snapshot.cards, snapshot.attempts, settings.timezone, settings.newPerDay, budget, now, t]);

  const mix = (queue: QueueEntry[]) => MIX
    .map((source) => ({ source, count: queue.filter((entry) => entry.source === source).length }))
    .filter((part) => part.count > 0)
    .map((part) => t(`today.mix.${part.source}`, { count: part.count }))
    .join(' · ');
  const sessionTitle = (config: SessionConfig) => {
    const mode = t(`today.modes.${config.mode}`);
    const topic = catalog.topics.find((item) => item.id === config.topicId);
    return topic ? t('today.modeTopic', { mode, topic: topic.title }) : mode;
  };
  const shownTopics = data.topics.filter((item) => filter === 'all' || item.categories.has(filter));

  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('today.title')}</h1>
        <p>{t('today.subtitle')}</p>
      </div>

      <div className="today-hero">
        <section className="today-primary" aria-labelledby="today-primary-title">
          <svg className="today-primary-art" width="230" height="200" viewBox="0 0 230 200" aria-hidden="true">
            <circle cx="150" cy="70" r="54" fill="#d2f55d" />
            <rect x="60" y="96" width="70" height="70" rx="14" fill="#ff76d6" transform="rotate(-14 95 131)" />
            <path d="M170 128l40 70h-80z" fill="#ffcf3d" />
          </svg>
          {current ? (
            <>
              <p className="today-eyebrow">{t('today.inProgress')}</p>
              <div className="today-primary-copy">
                <h2 id="today-primary-title">{sessionTitle(current.config)}</h2>
                <p>{mix(current.queue)}</p>
                <p>{t('today.resumeBody', { answered: current.cursor, total: current.queue.length })}</p>
              </div>
              <div className="today-progress">
                <div
                  className="today-progress-track"
                  role="progressbar"
                  aria-label={t('today.progressLabel')}
                  aria-valuemin={0}
                  aria-valuemax={current.queue.length}
                  aria-valuenow={current.cursor}
                >
                  <span style={{ width: `${(current.cursor / current.queue.length) * 100}%` }} />
                </div>
                <span>{t('today.position', { answered: current.cursor, total: current.queue.length })}</span>
              </div>
              <div className="today-primary-actions">
                <Link to="/session" className="btn btn-white">{t('today.resume')}<Icon name="arrowRight" /></Link>
                <span>{t('today.goal', { minutes: settings.dailyMinutes })}</span>
              </div>
            </>
          ) : data.daily.length > 0 ? (
            <>
              <p className="today-eyebrow">{t('today.recommended')}</p>
              <div className="today-primary-copy">
                <h2 id="today-primary-title">{t('today.modes.daily')}</h2>
                <p>{mix(data.daily)}</p>
              </div>
              <div className="today-primary-actions">
                <StartPractice config={{ mode: 'daily', questionBudget: budget }} label={t('start.daily')} variant="white" />
                <span>{t('today.goal', { minutes: settings.dailyMinutes })}</span>
              </div>
            </>
          ) : (
            <>
              <p className="today-eyebrow">{t('today.recommended')}</p>
              <div className="today-primary-copy">
                <h2 id="today-primary-title">{t('today.caughtUpTitle')}</h2>
                <p>{t('today.caughtUpBody')}</p>
              </div>
              <div className="today-primary-actions">
                <Link to="/library" className="btn btn-white">{t('today.explore')}<Icon name="arrowRight" /></Link>
              </div>
            </>
          )}
        </section>

        <section className="today-stats" aria-labelledby="today-stats-title">
          <div className="today-stats-head">
            <span className="today-stats-icon" aria-hidden="true"><Icon name="calendar" size={24} /></span>
            <div>
              <h2 id="today-stats-title">{t('today.activityTitle')}</h2>
              <p>{data.attemptsToday > 0 ? t('today.attemptsToday', { count: data.attemptsToday }) : t('today.noAttemptsToday')}</p>
            </div>
          </div>
          <dl className="today-stats-list">
            <div><dt>{t('today.stats.due')}</dt><dd>{data.counts.due}</dd></div>
            <div><dt>{t('today.stats.started')}</dt><dd>{data.started}<span>/{data.counts.all}</span></dd></div>
            <div><dt>{t('today.stats.mastered')}</dt><dd>{data.mastered}</dd></div>
          </dl>
        </section>
      </div>

      <section className="today-topics" aria-labelledby="today-topics-title">
        <div className="today-topics-head">
          <h2 id="today-topics-title">{t('today.topics.title')}</h2>
          <Link to="/learn" className="today-path-link">{t('today.topics.path')}<Icon name="arrowRight" size={18} /></Link>
        </div>
        <div className="today-chips" role="group" aria-label={t('today.topics.filterLabel')}>
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              className={filter === value ? 'chip is-on' : 'chip'}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {t(`today.topics.${value}`)}
              <span className="chip-count">{data.counts[value]}</span>
            </button>
          ))}
        </div>
        {shownTopics.length > 0 ? (
          <div className="topic-cards">
            {shownTopics.map((item) => <TopicCard key={item.topic.id} stats={item} />)}
          </div>
        ) : (
          <div className="today-empty">
            <p>{t('today.topics.emptyFilter')}</p>
            <button type="button" className="btn btn-secondary" onClick={() => setFilter('all')}>{t('today.topics.showAll')}</button>
          </div>
        )}
      </section>

      {snapshot.attempts.length >= ATTEMPT_WINDOW && (
        <p className="today-note">{t('today.historyNote', { count: ATTEMPT_WINDOW })}</p>
      )}
    </div>
  );
}
