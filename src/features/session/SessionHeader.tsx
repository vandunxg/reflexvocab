import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../components/Icon';

/** Focus-mode header: exit, session progress and position. No primary navigation. */
export function SessionHeader({ answered, total }: { answered: number; total: number }) {
  const { t } = useTranslation();
  const current = Math.min(answered + 1, total);
  return (
    <header className="session-header">
      <Link to="/" className="session-exit" aria-label={t('session.exit')}>
        <Icon name="close" size={24} />
      </Link>
      <div
        className="session-progress"
        role="progressbar"
        aria-label={t('session.progressLabel')}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
      >
        <div className="session-progress-fill" style={{ width: `${total ? (answered / total) * 100 : 0}%` }} />
      </div>
      <span className="session-position">{t('session.position', { current, total })}</span>
    </header>
  );
}
