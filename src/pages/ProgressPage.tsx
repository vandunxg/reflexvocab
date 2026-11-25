import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import { attemptMetrics, recentAttempts } from '../domain/progress';
import type { MasteryStage } from '../domain/model';
import { useLearningPath } from '../features/learn/path';
import { studyActivity } from '../domain/activity';
import { Icon, type IconName } from '../components/Icon';
import { ActivityCalendar } from '../features/today/ActivityCalendar';
import { useClock } from '../features/today/useClock';

const STAGES: MasteryStage[] = ['new', 'learning', 'familiar', 'mastered'];
const RESULT_ICONS: Record<'correct' | 'incorrect' | 'revealed', IconName> = { correct: 'check', incorrect: 'retry', revealed: 'hint' };

/** A headline number with the coloured icon tile from the Progress board. */
function Stat({ icon, tone, label, children }: { icon: IconName; tone: string; label: string; children: ReactNode }) {
  return (
    <div>
      <dt><span className={`progress-stat-icon progress-tone-${tone}`} aria-hidden="true"><Icon name={icon} size={22} /></span>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function ProgressPage() {
  const { t, i18n } = useTranslation();
  const { catalog, snapshot, settings } = useLearning();
  const path = useLearningPath();
  const lessons = path.flatMap((level) => level.lessons);
  const cards = new Map(snapshot.cards.map((card) => [card.senseId, card]));
  const stages = STAGES.map((stage) => ({
    stage, count: catalog.senses.filter((sense) => (cards.get(sense.id)?.masteryStage ?? 'new') === stage).length,
  }));
  const recent = recentAttempts(snapshot.attempts, snapshot.attemptHistoryLimit);
  const metrics = attemptMetrics(recent);
  const history = recent.slice(0, 10);
  const now = useClock();
  const activity = studyActivity(snapshot.attempts, snapshot.attemptHistoryLimit, now, settings.timezone);
  const senses = new Map(catalog.senses.map((sense) => [sense.id, sense]));
  const due = catalog.senses.filter((sense) => {
    const card = cards.get(sense.id);
    return card && Date.parse(card.card.dueAt) <= now.getTime();
  }).length;
  const format = new Intl.DateTimeFormat(i18n.language, {
    timeZone: settings.timezone, dateStyle: 'medium', timeStyle: 'short',
  });

  return (
    <div className="page progress-page">
      <div className="page-heading"><h1>{t('progress.title')}</h1><p>{t('progress.intro')}</p></div>
      <dl className="progress-stats">
        <Stat icon="sprout" tone="lime" label={t('progress.started')}>
          {catalog.senses.filter((sense) => cards.has(sense.id)).length}<small> / {catalog.senses.length}</small>
        </Stat>
        <Stat icon="check" tone="green" label={t('progress.mastered')}>{stages.find((item) => item.stage === 'mastered')?.count ?? 0}</Stat>
        <Stat icon="learn" tone="blue" label={t('progress.lessons')}>
          {lessons.filter((item) => item.status === 'complete').length}<small> / {lessons.length}</small>
        </Stat>
        <Stat icon="retry" tone="orange" label={t('progress.due')}>{due}</Stat>
      </dl>
      <p className="muted">{t('progress.scope', { limit: snapshot.attemptHistoryLimit, count: metrics.attempts })}</p>
      <div className="progress-panels">
        <section className="progress-panel" aria-labelledby="progress-memory">
          <div className="progress-panel-head">
            <h2 id="progress-memory">{t('progress.memory')}</h2>
            <span className="muted">{t('learn.senseCount', { count: catalog.senses.length })}</span>
          </div>
          {/* The legend carries the numbers; the stacked bar is their picture. */}
          <div className="progress-stack" aria-hidden="true">
            {stages.filter(({ count }) => count > 0).map(({ stage, count }) => (
              <span key={stage} className={`progress-stage-${stage}`} style={{ flexGrow: count }} />
            ))}
          </div>
          <ul className="progress-legend">
            {stages.map(({ stage, count }) => (
              <li key={stage}>
                <span className={`progress-swatch progress-stage-${stage}`} aria-hidden="true" />
                <span>{t(`mastery.${stage}`)}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </section>
        <section className="progress-panel" aria-labelledby="progress-retention">
          <h2 id="progress-retention">{t('progress.retention')}</h2>
          <p>{t('progress.observed')}</p>
          <strong>{metrics.reviews ? t('progress.ratio', { correct: metrics.reviewCorrect, total: metrics.reviews }) : t('progress.insufficient')}</strong>
          <p className="muted">{t('progress.retentionNote')}</p>
        </section>
      </div>
      <section className="progress-panel" aria-labelledby="progress-week">
        <h2 id="progress-week">{t('activity.week')}</h2>
        <p className="muted">{t('activity.timezone', { timezone: settings.timezone })}</p>
        <ActivityCalendar activity={activity} timezone={settings.timezone} />
        <p>{activity.streakLowerBound ? t('activity.streakAtLeast', { count: activity.streak }) : t('activity.streak', { count: activity.streak })}</p>
      </section>
      <section className="progress-panel" aria-labelledby="progress-accuracy">
        <h2 id="progress-accuracy">{t('progress.accuracy')}</h2>
        <p>{metrics.firstUnassisted ? t('progress.ratio', { correct: metrics.firstCorrect, total: metrics.firstUnassisted }) : t('progress.insufficient')}</p>
        <p className="muted">{t('progress.accuracyNote', { assisted: metrics.assisted, retries: metrics.retries })}</p>
      </section>
      <section className="progress-panel" aria-labelledby="progress-history">
        <div className="progress-history-head"><h2 id="progress-history">{t('progress.history')}</h2><Link to="/practice">{t('progress.practice')}</Link></div>
        {history.length === 0 ? <p className="muted">{t('progress.empty')}</p> : (
          <ul className="progress-history">
            {history.map((attempt) => {
              const result = attempt.answerRevealed ? 'revealed' : attempt.outcome;
              return (
                <li key={attempt.id}>
                  <span className={`tag progress-result progress-result-${result}`}><Icon name={RESULT_ICONS[result]} size={14} />{t(`practice.result.${result}`)}</span>
                  <strong lang="en">{senses.get(attempt.senseId)?.headword ?? t('practice.result.unknownWord')}</strong>
                  <span>{t(`session.kinds.${attempt.exerciseKind}`)}{attempt.hintUsed && !attempt.answerRevealed ? ` · ${t('practice.result.hint')}` : ''}{attempt.isRetry ? ` · ${t('practice.result.retry')}` : ''}</span>
                  <time dateTime={attempt.attemptedAt}>{format.format(new Date(attempt.attemptedAt))}</time>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
