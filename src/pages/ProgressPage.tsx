import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import { attemptMetrics, recentAttempts } from '../domain/progress';
import type { MasteryStage } from '../domain/model';
import { useLearningPath } from '../features/learn/path';

const STAGES: MasteryStage[] = ['new', 'learning', 'familiar', 'mastered'];

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
  const now = new Date();
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
        <div><dt>{t('progress.started')}</dt><dd>{catalog.senses.filter((sense) => cards.has(sense.id)).length} / {catalog.senses.length}</dd></div>
        <div><dt>{t('progress.mastered')}</dt><dd>{stages.find((item) => item.stage === 'mastered')?.count ?? 0}</dd></div>
        <div><dt>{t('progress.lessons')}</dt><dd>{lessons.filter((item) => item.status === 'complete').length} / {lessons.length}</dd></div>
        <div><dt>{t('progress.due')}</dt><dd>{due}</dd></div>
      </dl>
      <p className="muted">{t('progress.scope', { limit: snapshot.attemptHistoryLimit, count: metrics.attempts })}</p>
      <div className="progress-panels">
        <section className="progress-panel" aria-labelledby="progress-memory">
          <h2 id="progress-memory">{t('progress.memory')}</h2>
          <ul className="progress-stages">
            {stages.map(({ stage, count }) => (
              <li key={stage}>
                <span>{t(`mastery.${stage}`)}</span>
                <div className="progress-stage-bar" aria-hidden="true"><span className={`progress-stage-${stage}`}
                  style={{ width: `${catalog.senses.length ? count / catalog.senses.length * 100 : 0}%` }} /></div>
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
      <section className="progress-panel" aria-labelledby="progress-accuracy">
        <h2 id="progress-accuracy">{t('progress.accuracy')}</h2>
        <p>{metrics.firstUnassisted ? t('progress.ratio', { correct: metrics.firstCorrect, total: metrics.firstUnassisted }) : t('progress.insufficient')}</p>
        <p className="muted">{t('progress.accuracyNote', { assisted: metrics.assisted, retries: metrics.retries })}</p>
      </section>
      <section className="progress-panel" aria-labelledby="progress-history">
        <div className="progress-history-head"><h2 id="progress-history">{t('progress.history')}</h2><Link to="/practice">{t('progress.practice')}</Link></div>
        {history.length === 0 ? <p className="muted">{t('progress.empty')}</p> : (
          <ul className="progress-history">
            {history.map((attempt) => (
              <li key={attempt.id}>
                <span className="tag">{t(`practice.result.${attempt.answerRevealed ? 'revealed' : attempt.outcome}`)}</span>
                <strong lang="en">{senses.get(attempt.senseId)?.headword ?? t('practice.result.unknownWord')}</strong>
                <span>{t(`session.kinds.${attempt.exerciseKind}`)}{attempt.hintUsed && !attempt.answerRevealed ? ` · ${t('practice.result.hint')}` : ''}{attempt.isRetry ? ` · ${t('practice.result.retry')}` : ''}</span>
                <time dateTime={attempt.attemptedAt}>{format.format(new Date(attempt.attemptedAt))}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
