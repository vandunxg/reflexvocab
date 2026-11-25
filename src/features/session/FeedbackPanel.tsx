import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Exercise, VocabularyContext } from '../../domain/model';
import { Icon } from '../../components/Icon';
import { answerText, correctAnswerText, feedbackHeading } from './content';
import type { CheckInput, CheckResult } from './Question';

// Ignore activation this soon after feedback appears so a fast double press cannot skip it.
const CONTINUE_DELAY_MS = 350;

/** Explains the answer in context. Outcome is carried by text and icon, not by color alone. */
export function FeedbackPanel({ exercise, context, answer, result, onContinue }: {
  exercise: Exercise;
  context: VocabularyContext | undefined;
  answer: CheckInput['answer'];
  result: CheckResult;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const shownAt = useRef(Number.POSITIVE_INFINITY);
  useEffect(() => {
    shownAt.current = performance.now();
  }, []);

  const heading = feedbackHeading(result.correct, result.evidence);
  const success = heading !== 'incorrect' && heading !== 'revealed';
  const given = answerText(exercise, answer);

  return (
    <footer className={success ? 'feedback feedback-success' : 'feedback feedback-support'}>
      <div className="feedback-inner">
        <div className="feedback-head">
          <span className="feedback-icon" aria-hidden="true"><Icon name={success ? 'check' : 'retry'} size={20} /></span>
          <h2 id={headingId}>{t(`session.feedback.${heading}`)}</h2>
        </div>
        {!result.correct && (
          <p className="feedback-given">
            {given === null ? t('session.feedback.noAnswer') : t('session.feedback.yourAnswer', { answer: given })}
            {' · '}{t('session.feedback.correctAnswer')}
          </p>
        )}
        <p className="feedback-answer" lang="en">{correctAnswerText(exercise)}</p>
        <p className="feedback-explanation" lang="en">{exercise.explanation}</p>
        {context && (
          <div className="feedback-context">
            <span className="eyebrow">{t('session.feedback.inContext')}</span>
            <p lang="en">{context.example}</p>
          </div>
        )}
        {result.supported && <p className="feedback-note">{t('session.feedback.supportedNote')}</p>}
        {result.recovery && (
          <p className="feedback-note feedback-recovery">
            <Icon name="retry" size={16} />
            {result.recovery === 'new-context' ? t('session.feedback.recovery') : t('session.feedback.recoverySame')}
          </p>
        )}
        <div className="feedback-actions">
          <button
            type="button"
            className="btn btn-primary btn-session"
            aria-describedby={headingId}
            autoFocus
            onKeyDown={(event) => { if (event.repeat) event.preventDefault(); }}
            onClick={() => { if (performance.now() - shownAt.current >= CONTINUE_DELAY_MS) onContinue(); }}
          >
            {t('session.continue')}<Icon name="arrowRight" />
          </button>
        </div>
      </div>
    </footer>
  );
}
