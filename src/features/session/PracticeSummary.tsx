import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../../app/LearningProvider';
import type { LearningSession, SessionConfig } from '../../domain/model';
import { summarizeSession } from '../../domain/summary';
import { SpeakButton } from '../audio/SpeakButton';
import { Icon } from '../../components/Icon';

export function PracticeSummary({ session, mode }: {
  session: LearningSession;
  mode: Exclude<SessionConfig['mode'], 'daily' | 'lesson'>;
}) {
  const { t } = useTranslation();
  const { catalog, snapshot } = useLearning();
  const summary = summarizeSession(snapshot.attempts, session.id);
  const attempts = [...new Map(snapshot.attempts.filter((attempt) => attempt.sessionId === session.id)
    .map((attempt) => [attempt.id, attempt])).values()].sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt));
  const senses = new Map(catalog.senses.map((sense) => [sense.id, sense]));
  return (
    <main className="summary" id="main">
      <span className="practice-result-icon" aria-hidden="true"><Icon name="retry" size={48} /></span>
      <p className="eyebrow">{t('practice.result.eyebrow')} · {t(`practice.modeLabels.${mode}`)}</p>
      <h1>{t('practice.result.title')}</h1>
      <dl className="summary-stats">
        <div className="summary-stat"><dt>{t('session.summary.firstAttempts')}</dt><dd>{summary.firstAttempts}</dd></div>
        <div className="summary-stat summary-stat-correct"><dt>{t('session.summary.correct')}</dt><dd>{summary.correct}</dd></div>
        <div className="summary-stat"><dt>{t('session.summary.assisted')}</dt><dd>{summary.assisted}</dd></div>
        <div className="summary-stat summary-stat-recovery"><dt>{t('session.summary.recovery')}</dt><dd>{summary.recoveryPractice}</dd></div>
      </dl>
      <section className="practice-results" aria-labelledby="practice-results-title">
        <h2 id="practice-results-title">{t('practice.result.attempts')}</h2>
        <ul>
          {attempts.map((attempt) => {
            const sense = senses.get(attempt.senseId);
            return (
              <li key={attempt.id}>
                <div>
                  <strong lang="en">{sense?.headword ?? t('practice.result.unknownWord')}</strong>
                  <p>{t(`session.kinds.${attempt.exerciseKind}`)}</p>
                </div>
                <div className="practice-result-tags">
                  <span className="tag">{t(`practice.result.${attempt.answerRevealed ? 'revealed' : attempt.outcome}`)}</span>
                  {attempt.hintUsed && !attempt.answerRevealed && <span className="tag">{t('practice.result.hint')}</span>}
                  {attempt.isRetry && <span className="tag">{t('practice.result.retry')}</span>}
                  {sense && <SpeakButton text={sense.headword} label={t('library.listen', { word: sense.headword })} small />}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <p className="summary-note">{t('practice.result.note')}</p>
      <Link to="/practice" className="btn btn-primary btn-session">{t('practice.result.back')}<Icon name="arrowRight" /></Link>
    </main>
  );
}
