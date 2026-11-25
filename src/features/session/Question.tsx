import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Evidence } from '../../domain/answers';
import type { Exercise, VocabularyContext, VocabularySense } from '../../domain/model';
import { Icon } from '../../components/Icon';
import { correctAnswerText, feedbackHeading, hintItems, shuffle, splitOnWord, type HintItem } from './content';
import { FeedbackPanel } from './FeedbackPanel';

export interface CheckInput {
  answer: string | string[] | null;
  hintUsed: boolean;
  answerRevealed: boolean;
  responseTimeMs: number | null;
}

export interface CheckResult {
  correct: boolean;
  evidence: Evidence;
  /** A hint or the answer was shown before answering. */
  supported: boolean;
  /** A spaced retry was added for this sense, preferably in another context. */
  recovery: 'new-context' | 'same-context' | null;
}

type Option = { id: string; text: string };

/**
 * One question from first view to feedback. Keyed by queue position, so every question starts
 * with fresh answer, hint and timing state.
 */
export function Question({ exercise, sense, context, isRetry, retryNewContext, onCheck, onContinue }: {
  exercise: Exercise;
  sense: VocabularySense;
  context: VocabularyContext | undefined;
  isRetry: boolean;
  retryNewContext: boolean;
  onCheck: (input: CheckInput) => CheckResult | null;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const [options] = useState<Option[]>(() => exercise.kind === 'typing-cloze' ? []
    : shuffle(exercise.kind === 'sentence-build' ? exercise.chunks : exercise.choices));
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [submitted, setSubmitted] = useState<{ answer: CheckInput['answer']; result: CheckResult } | null>(null);
  const checking = useRef(false);
  const timing = useRef({ start: 0, interrupted: false });

  // Response time is evidence only when the question stayed visible from display to answer.
  useEffect(() => {
    timing.current = { start: performance.now(), interrupted: document.visibilityState === 'hidden' };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') timing.current.interrupted = true;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const isChoice = exercise.kind !== 'typing-cloze' && exercise.kind !== 'sentence-build';
  const answer: CheckInput['answer'] | undefined = exercise.kind === 'typing-cloze'
    ? (typed.trim() ? typed : undefined)
    : exercise.kind === 'sentence-build'
      ? (picked.length === exercise.chunks.length ? picked : undefined)
      : (selected ?? undefined);
  const ready = answer !== undefined;
  const result = submitted?.result ?? null;

  // Number keys choose an option and Enter checks while focus is not on a control.
  useEffect(() => {
    if (submitted) return;
    function onKey(event: KeyboardEvent) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, button, a, [contenteditable]')) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        formRef.current?.requestSubmit();
        return;
      }
      const index = Number(event.key) - 1;
      if (isChoice && Number.isInteger(index) && index >= 0 && index < options.length) {
        event.preventDefault();
        setSelected(options[index].id);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [submitted, isChoice, options]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (checking.current || submitted) return;
    const value = ready ? answer : revealed ? null : undefined;
    if (value === undefined) return;
    checking.current = true;
    const { start, interrupted } = timing.current;
    const outcome = onCheck({
      answer: value,
      hintUsed,
      answerRevealed: revealed,
      responseTimeMs: value === null || interrupted ? null : Math.round(performance.now() - start),
    });
    if (outcome) setSubmitted({ answer: value, result: outcome });
    else checking.current = false;
  }

  function confirmOnEnter(event: ReactKeyboardEvent, id: string) {
    // A second Enter on the chosen option checks it; the first one selects it natively.
    if (event.key === 'Enter' && !event.repeat && selected === id) {
      event.preventDefault();
      submit();
    }
  }

  function removeChunk(id: string) {
    setPicked((current) => current.filter((item) => item !== id));
    document.getElementById(`chunk-${exercise.id}-${id}`)?.focus();
  }

  const footerText = revealed ? t('session.footer.revealed')
    : ready ? t('session.footer.ready')
      : exercise.kind === 'typing-cloze' ? t('session.footer.typeWord')
        : exercise.kind === 'sentence-build' ? t('session.footer.buildSentence', { count: exercise.chunks.length })
          : t('session.footer.chooseOne');
  const textById = new Map(options.map((option) => [option.id, option.text]));
  const correctChoice = isChoice ? exercise.correctChoiceId : null;

  return (
    <form ref={formRef} className="session-body" onSubmit={submit} noValidate>
      <main className="session-main" id="main">
        <div className="session-meta">
          <span className={`pill kind-pill kind-${exercise.kind}`}>{t(`session.kinds.${exercise.kind}`)}</span>
          {isRetry && (
            <span className="pill pill-retry"><Icon name="retry" size={14} />{retryNewContext ? t('session.retryBadge') : t('session.retrySameBadge')}</span>
          )}
        </div>

        <h1 className={result ? 'question-prompt is-answered' : 'question-prompt'} lang="en">
          {exercise.prompt.split(/_{2,}/).map((part, index) => (
            <Fragment key={index}>
              {index > 0 && <span className="blank"><span className="visually-hidden">{t('session.blank')}</span></span>}
              {exercise.kind === 'definition-match'
                ? splitOnWord(part, sense.headword).map((piece, pieceIndex) => piece.match
                  ? <mark key={pieceIndex}>{piece.text}</mark>
                  : <Fragment key={pieceIndex}>{piece.text}</Fragment>)
                : part}
            </Fragment>
          ))}
        </h1>

        {isChoice && (
          <div role="group" aria-label={t('session.answers')} className={exercise.kind === 'multiple-choice-cloze' ? 'choices choices-grid' : 'choices'}>
            {options.map((option, index) => {
              const chosen = (submitted?.answer ?? selected) === option.id;
              const isCorrect = result && option.id === correctChoice;
              const isWrong = result && chosen && option.id !== correctChoice;
              const label = !result ? null
                : chosen ? (isCorrect ? t('session.feedback.chosenCorrect') : t('session.feedback.chosenIncorrect'))
                  : isCorrect ? t('session.feedback.correctOption') : null;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={['option', chosen && !result && 'is-selected', isCorrect && 'is-correct', isWrong && 'is-incorrect'].filter(Boolean).join(' ')}
                  aria-pressed={chosen}
                  disabled={Boolean(result)}
                  onClick={() => setSelected(option.id)}
                  onKeyDown={(event) => confirmOnEnter(event, option.id)}
                >
                  <span className="option-key" aria-hidden="true">{isCorrect ? <Icon name="check" size={16} /> : index + 1}</span>
                  <span className="option-text" lang="en">{option.text}</span>
                  {label && <span className="option-label">{label}</span>}
                </button>
              );
            })}
          </div>
        )}

        {exercise.kind === 'typing-cloze' && (result ? (
          <div className={result.correct ? 'typed-answer is-correct' : 'typed-answer is-incorrect'}>
            <span className="typed-text" lang="en">{typeof submitted?.answer === 'string' ? submitted.answer.trim() : t('session.feedback.noAnswer')}</span>
            {submitted?.answer !== null && (
              <span className="option-label">{result.correct ? t('session.feedback.typedCorrect') : t('session.feedback.typedIncorrect')}</span>
            )}
          </div>
        ) : (
          <label className="field typing-field">
            {t('session.typingLabel')}
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={t('session.typingPlaceholder')}
              lang="en"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              autoFocus
            />
          </label>
        ))}

        {exercise.kind === 'sentence-build' && (
          <>
            <div className="sentence-zone" role="group" aria-label={t('session.sentenceAnswer')}>
              {picked.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="chunk chunk-picked"
                  disabled={Boolean(result)}
                  aria-label={t('session.removeChunk', { chunk: textById.get(id) })}
                  onClick={() => removeChunk(id)}
                >
                  <span lang="en">{textById.get(id)}</span>
                  {!result && <span aria-hidden="true" className="chunk-remove">×</span>}
                </button>
              ))}
            </div>
            {!result && (
              <div className="chunk-bank" role="group" aria-label={t('session.sentenceChunks')}>
                {options.map((option) => {
                  const used = picked.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      id={`chunk-${exercise.id}-${option.id}`}
                      type="button"
                      className={used ? 'chunk is-used' : 'chunk'}
                      aria-disabled={used}
                      lang="en"
                      onClick={() => { if (!used) setPicked((current) => [...current, option.id]); }}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {!result && (
          <div className="question-tools">
            {exercise.kind === 'sentence-build' && (
              <button type="button" className="text-button text-button-quiet" disabled={picked.length === 0} onClick={() => setPicked([])}>
                <Icon name="retry" size={18} />{t('session.reset')}
              </button>
            )}
            {!hintUsed && (
              <button type="button" className="text-button" onClick={() => setHintUsed(true)}>
                <Icon name="hint" size={18} />{t('session.hint.open')}
              </button>
            )}
          </div>
        )}

        {!result && hintUsed && (
          <HintPanel
            items={hintItems(exercise, sense)}
            revealed={revealed}
            answer={correctAnswerText(exercise)}
            onReveal={() => setRevealed(true)}
          />
        )}
      </main>

      {submitted ? (
        <FeedbackPanel
          exercise={exercise}
          context={context}
          answer={submitted.answer}
          result={submitted.result}
          onContinue={onContinue}
        />
      ) : (
        <footer className="session-footer">
          <div className="session-footer-inner">
            <span className="muted session-footer-text">{footerText}</span>
            <button type="submit" className="btn btn-primary btn-session" disabled={!ready && !revealed}>
              {ready || !revealed ? t('session.check') : t('session.continueRevealed')}
            </button>
          </div>
        </footer>
      )}
      <p className="visually-hidden" role="status">
        {result ? t(`session.feedback.${feedbackHeading(result.correct, result.evidence)}`) : ''}
      </p>
    </form>
  );
}

function HintPanel({ items, revealed, answer, onReveal }: {
  items: HintItem[];
  revealed: boolean;
  answer: string;
  onReveal: () => void;
}) {
  const { t } = useTranslation();
  function text(item: HintItem) {
    switch (item.kind) {
      case 'partOfSpeech': return t('session.hint.partOfSpeech', { value: item.value });
      case 'collocations': return t('session.hint.collocations', { value: item.value });
      case 'firstLetter': return t('session.hint.firstLetter', { letter: item.value });
      case 'firstChunk': return t('session.hint.firstChunk', { chunk: item.value });
      default: return item.value;
    }
  }
  return (
    <section className="hint-panel" aria-label={t('session.hint.title')}>
      {revealed ? (
        <p className="hint-answer" lang="en">{t('session.hint.revealedAnswer', { answer })}</p>
      ) : (
        <button type="button" className="text-button" onClick={onReveal}>
          <Icon name="hint" size={18} />{t('session.hint.reveal')}
        </button>
      )}
      <ol className="hint-list">
        {items.map((item, index) => (
          <li key={item.kind}>
            <span className="hint-number" aria-hidden="true">{index + 1}</span>
            <span lang={item.kind === 'gloss' ? 'vi' : item.kind === 'definition' ? 'en' : undefined}>{text(item)}</span>
          </li>
        ))}
      </ol>
      <p className="hint-note">{revealed ? t('session.hint.revealedNote') : t('session.hint.note')}</p>
    </section>
  );
}
