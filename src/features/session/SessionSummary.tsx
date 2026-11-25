import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../../app/LearningProvider';
import type { LearningSession } from '../../domain/model';
import { dueByTomorrow, summarizeSession } from '../../domain/summary';
import { Icon } from '../../components/Icon';

/** Completion summary from recorded attempts. Completion is not presented as mastery. */
export function SessionSummary({ session }: { session: LearningSession }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { snapshot, settings } = useLearning();
  const [now] = useState(() => new Date());
  const summary = summarizeSession(snapshot.attempts, session.id);
  const due = dueByTomorrow(snapshot.cards, now, settings.timezone);
  return (
    <main className="summary" id="main">
      <svg className="summary-art" width="220" height="140" viewBox="0 0 220 140" aria-hidden="true">
        <rect x="18" y="26" width="34" height="34" rx="8" fill="#ff76d6" transform="rotate(-10 35 43)" />
        <circle cx="198" cy="20" r="13" fill="#3d57e6" />
        <path d="M205 96l16 28h-32z" fill="#ffcf3d" />
        <circle cx="110" cy="78" r="56" fill="#a9c93a" />
        <circle cx="110" cy="70" r="56" fill="#d2f55d" />
        <path d="M86 70l16 16 32-32" fill="none" stroke="#17181a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="eyebrow">{t('session.summary.eyebrow')}</p>
      <h1>{t('session.summary.title')}</h1>
      <p className="muted summary-body">{t('session.summary.body')}</p>
      <dl className="summary-stats">
        <div className="summary-stat"><dt>{t('session.summary.firstAttempts')}</dt><dd>{summary.firstAttempts}</dd></div>
        <div className="summary-stat summary-stat-correct"><dt>{t('session.summary.correct')}</dt><dd>{summary.correct}</dd></div>
        <div className="summary-stat summary-stat-recovery"><dt>{t('session.summary.recovery')}</dt><dd>{summary.recoveryPractice}</dd></div>
      </dl>
      <p className="summary-note">{t('session.summary.note')}</p>
      {due > 0 && <p className="summary-due"><Icon name="calendar" size={18} />{t('session.summary.dueTomorrow', { count: due })}</p>}
      <button type="button" className="btn btn-primary btn-session" onClick={() => navigate('/')}>
        {t('session.summary.action')}<Icon name="arrowRight" />
      </button>
    </main>
  );
}
