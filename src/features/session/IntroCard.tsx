import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { VocabularyContext, VocabularySense } from '../../domain/model';
import { Icon } from '../../components/Icon';
import { splitOnWord } from './content';

/** Introduces an unfamiliar sense in context before its first question (Session-Intro board). */
export function IntroCard({ sense, contexts, topicLabel, onContinue }: {
  sense: VocabularySense;
  contexts: VocabularyContext[];
  topicLabel: string | null;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const [showGloss, setShowGloss] = useState(false);
  return (
    <>
      <main className="session-main" id="main">
        <div className="session-meta">
          <span className="pill pill-lime">{t('session.intro.badge')}</span>
          {topicLabel && <span className="muted session-topic">{topicLabel}</span>}
        </div>
        <section className="intro-card" aria-labelledby="intro-word">
          <svg className="intro-shapes" width="140" height="130" viewBox="0 0 140 130" aria-hidden="true">
            <circle cx="96" cy="40" r="40" fill="#ffcf3d" />
            <rect x="22" y="52" width="56" height="56" rx="12" fill="#ff76d6" transform="rotate(14 50 80)" />
            <path d="M126 76l24 44h-48z" fill="#d2f55d" />
          </svg>
          <h1 id="intro-word" lang="en" className="intro-word">{sense.headword}</h1>
          <p className="muted intro-meta" lang="en">{[sense.ipa, sense.partOfSpeech].filter(Boolean).join(' · ')}</p>
          <p className="intro-definition" lang="en">{sense.definition}</p>
          {contexts.length > 0 && (
            <div className="intro-group">
              <h2 className="eyebrow">{t('session.intro.examples')}</h2>
              <ul className="intro-examples">
                {contexts.map((context) => (
                  <li key={context.id} lang="en">
                    {splitOnWord(context.example, sense.headword).map((part, index) => part.match
                      ? <strong key={index}>{part.text}</strong>
                      : <span key={index}>{part.text}</span>)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {sense.collocations.length > 0 && (
            <div className="intro-group">
              <h2 className="eyebrow">{t('session.intro.collocations')}</h2>
              <ul className="collocation-chips" lang="en">
                {sense.collocations.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
          {sense.viGloss && (
            <div className="intro-gloss">
              <button type="button" className="text-button" aria-expanded={showGloss} onClick={() => setShowGloss((value) => !value)}>
                {showGloss ? t('session.intro.hideGloss') : t('session.intro.showGloss')}
              </button>
              {showGloss && <p lang="vi"><span className="visually-hidden">{t('session.intro.glossLabel')}: </span>{sense.viGloss}</p>}
            </div>
          )}
        </section>
      </main>
      <footer className="session-footer">
        <div className="session-footer-inner">
          <span className="muted session-footer-text">{t('session.intro.note')}</span>
          <button type="button" className="btn btn-primary btn-session" onClick={onContinue} autoFocus>
            {t('session.intro.continue')}<Icon name="arrowRight" />
          </button>
        </div>
      </footer>
    </>
  );
}
