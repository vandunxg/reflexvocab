import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Exercise, VocabularyContext } from '../../domain/model';
import { Icon } from '../../components/Icon';
import { SpeakButton } from '../audio/SpeakButton';
import { answerText, correctAnswerText, feedbackHeading } from './content';
import type { CheckInput, CheckResult } from './Question';

export type SaveState = 'saving' | 'saved' | 'unavailable' | 'conflict' | 'rejected' | 'unauthenticated';

export interface SaveControls {
  state: SaveState;
  /** The saved answer completes the session. */
  isLast: boolean;
  onRetry: () => void;
  onReload: () => void;
  onSignIn: () => void;
}

// Ignore activation this soon after feedback appears so a fast double press cannot skip it.
const CONTINUE_DELAY_MS = 350;

/**
 * Explains the answer in context while it is saved. Outcome is carried by text and icon, not color
 * alone, and the next question opens only after the save is acknowledged.
 */
export function FeedbackPanel({ exercise, context, answer, result, save, onContinue }: {
  exercise: Exercise;
  context: VocabularyContext | undefined;
  answer: CheckInput['answer'];
  result: CheckResult;
  save: SaveControls;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const saveId = useId();
  const continueRef = useRef<HTMLButtonElement>(null);
  const shownAt = useRef(Number.POSITIVE_INFINITY);
  useEffect(() => {
    shownAt.current = performance.now();
  }, []);
  const saved = save.state === 'saved';
  useEffect(() => {
    if (saved) continueRef.current?.focus();
  }, [saved]);

  const heading = feedbackHeading(result.correct, result.evidence);
  const tone = heading === 'revealed' ? 'info' : heading === 'incorrect' ? 'support' : 'success';
  const given = answerText(exercise, answer);
  const failed = save.state !== 'saving' && !saved;

  return (
    <footer className={`feedback feedback-${tone}`}>
      <div className="feedback-inner">
        <div className="feedback-head">
          <span className="feedback-icon" aria-hidden="true"><Icon name={tone === 'success' ? 'check' : 'retry'} size={20} /></span>
          <h2 id={headingId}>{t(`session.feedback.${heading}`)}</h2>
        </div>
        {!result.correct && heading !== 'revealed' && (
          <p className="feedback-given">
            {given === null ? t('session.feedback.noAnswer') : t('session.feedback.yourAnswer', { answer: given })}
            {' · '}{t('session.feedback.correctAnswer')}
          </p>
        )}
        <p className="feedback-answer" lang="en">{correctAnswerText(exercise)}</p>
        <p className="feedback-explanation" lang="en">{exercise.explanation}</p>
        {context && (
          <div className="feedback-context">
            <div className="feedback-context-text">
              <span className="eyebrow">{t('session.feedback.inContext')}</span>
              <p lang="en">{context.example}</p>
            </div>
            <SpeakButton text={context.example} label={t('audio.listenExample')} small />
          </div>
        )}
        {result.supported && <p className="feedback-note">{t('session.feedback.supportedNote')}</p>}
        {result.recovery && (
          <p className="feedback-note feedback-recovery">
            <Icon name="retry" size={16} />
            {result.recovery === 'new-context' ? t('session.feedback.recovery') : t('session.feedback.recoverySame')}
          </p>
        )}
        {failed && (
          <div className="sync-error" role="alert">
            <Icon name="alert" />
            <div className="sync-error-body">
              <p className="sync-error-title">{t('session.save.errorTitle')}</p>
              <p>{t(`session.save.${save.state as Exclude<SaveState, 'saving' | 'saved'>}`)}</p>
              <div className="sync-error-actions">
                {save.state === 'unauthenticated' ? (
                  <button type="button" className="btn btn-secondary" onClick={save.onSignIn}>{t('session.save.signIn')}</button>
                ) : (
                  <>
                    {save.state === 'unavailable' && (
                      <button type="button" className="btn btn-secondary" onClick={save.onRetry}>
                        <Icon name="retry" size={18} />{t('session.save.retry')}
                      </button>
                    )}
                    <button type="button" className="text-button" onClick={save.onReload}>{t('session.save.reload')}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="feedback-actions">
          <span className={`save-state save-${saved ? 'saved' : failed ? 'failed' : 'saving'}`} id={saveId} role="status">
            {saved ? <Icon name="check" size={16} /> : failed ? <Icon name="alert" size={16} /> : <span className="save-dot" aria-hidden="true" />}
            {saved ? t('session.save.saved') : failed ? t('session.save.unsaved') : t('session.save.saving')}
          </span>
          <button
            ref={continueRef}
            type="button"
            className="btn btn-primary btn-session"
            aria-describedby={`${headingId} ${saveId}`}
            disabled={!saved}
            onKeyDown={(event) => { if (event.repeat) event.preventDefault(); }}
            onClick={() => { if (saved && performance.now() - shownAt.current >= CONTINUE_DELAY_MS) onContinue(); }}
          >
            {save.isLast ? t('session.save.seeResults') : t('session.continue')}<Icon name="arrowRight" />
          </button>
        </div>
      </div>
    </footer>
  );
}
