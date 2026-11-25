import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MasteryStage, VocabularyContext, VocabularySense } from '../../domain/model';
import { Icon } from '../../components/Icon';
import { SpeakButton } from '../audio/SpeakButton';

export interface LibraryEntry {
  sense: VocabularySense;
  contexts: VocabularyContext[];
  topicTitle: string;
  topicIndex: number;
  stage: MasteryStage;
}

/** One sense in the library: compact row that expands to examples, collocations and the gloss. */
export function LibraryRow({ entry, selected, saved, saving, failed, onSelect, onToggleSaved }: {
  entry: LibraryEntry;
  selected: boolean;
  saved: boolean;
  saving: boolean;
  failed: boolean;
  onSelect: (selected: boolean) => void;
  onToggleSaved: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showGloss, setShowGloss] = useState(false);
  const { sense, contexts, topicTitle, topicIndex, stage } = entry;
  const detailsId = `library-${sense.id}`;
  const word = sense.headword;
  return (
    <li className={['library-row', selected && 'is-selected', open && 'is-open'].filter(Boolean).join(' ')}>
      <div className="library-row-main">
        <input
          type="checkbox"
          className="library-check"
          checked={selected}
          onChange={(event) => onSelect(event.target.checked)}
          aria-label={t('library.select', { word })}
        />
        <div className="library-word">
          <span className="library-headword" lang="en" title={word}>{word}</span>
          <span className="muted library-meta" lang="en">{[sense.ipa, sense.partOfSpeech].filter(Boolean).join(' · ')}</span>
        </div>
        <p className="library-definition" lang="en" title={sense.definition}>{sense.definition}</p>
        <span className={`library-topic topic-tone-${topicIndex % 3}`} lang="en" title={topicTitle}>{topicTitle}</span>
        <span className={`stage-pill stage-${stage}`}>{t(`mastery.${stage}`)}</span>
        <div className="library-actions">
          <SpeakButton text={word} label={t('library.listen', { word })} small />
          <button
            type="button"
            className={saved ? 'icon-toggle is-on' : 'icon-toggle'}
            aria-pressed={saved}
            aria-label={saved ? t('library.unbookmark', { word }) : t('library.bookmark', { word })}
            aria-busy={saving}
            disabled={saving}
            onClick={onToggleSaved}
          >
            <Icon name="bookmark" size={20} />
          </button>
          <button
            type="button"
            className="icon-toggle library-expand"
            aria-expanded={open}
            aria-controls={detailsId}
            aria-label={open ? t('library.collapse', { word }) : t('library.expand', { word })}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name="chevronDown" size={20} />
          </button>
        </div>
      </div>
      {failed && <p className="library-error" role="alert"><Icon name="alert" size={16} />{t('library.bookmarkFailed')}</p>}
      {open && (
        <div className="library-details" id={detailsId}>
          {contexts.map((context) => (
            <div key={context.id} className="library-example">
              <p lang="en">“{context.example}”</p>
              <SpeakButton text={context.example} label={t('audio.listenExample')} small />
            </div>
          ))}
          {sense.collocations.length > 0 && (
            <ul className="library-collocations" lang="en">
              {sense.collocations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          {sense.viGloss && (
            <div className="library-gloss">
              <button type="button" className="text-button" aria-expanded={showGloss} onClick={() => setShowGloss((value) => !value)}>
                {showGloss ? t('library.hideGloss') : t('library.showGloss')}
              </button>
              {showGloss && <span lang="vi">{sense.viGloss}</span>}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
