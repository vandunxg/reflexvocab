import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import { questionBudgetFor } from '../domain/session';
import { Icon } from '../components/Icon';
import { StartPractice } from '../components/StartPractice';

/** Today (`/`). Start or resume a daily session; the full board composition lands in P04-T03. */
export function HomePage() {
  const { t } = useTranslation();
  const { snapshot, settings } = useLearning();
  const current = snapshot.currentSession?.status === 'current' ? snapshot.currentSession : null;
  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('today.title')}</h1>
        <p>{t('today.subtitle')}</p>
      </div>
      <section className="section-card session-entry">
        {current ? (
          <>
            <h2>{t('today.resumeTitle')}</h2>
            <p>{t('today.resumeBody', { answered: current.cursor, total: current.queue.length })}</p>
            <Link to="/session" className="btn btn-primary">{t('today.resume')}<Icon name="arrowRight" /></Link>
          </>
        ) : (
          <>
            <h2>{t('today.startTitle')}</h2>
            <p>{t('today.startBody', { minutes: settings.dailyMinutes })}</p>
            <StartPractice
              config={{ mode: 'daily', questionBudget: questionBudgetFor(settings.dailyMinutes) }}
              label={t('start.daily')}
            />
          </>
        )}
      </section>
    </div>
  );
}
