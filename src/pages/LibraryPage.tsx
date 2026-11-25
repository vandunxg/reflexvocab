import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import type { MasteryStage } from '../domain/model';
import { MAX_QUESTION_BUDGET } from '../domain/session';
import { Icon } from '../components/Icon';
import { StartPractice } from '../components/StartPractice';
import { LibraryRow, type LibraryEntry } from '../features/library/LibraryRow';
import { levelName } from '../i18n';

const STAGES: MasteryStage[] = ['new', 'learning', 'familiar', 'mastered'];
const toggled = (set: Set<string>, id: string, present: boolean) => {
  const next = new Set(set);
  if (present) next.add(id);
  else next.delete(id);
  return next;
};
// Case- and diacritic-insensitive matching, so "hoan" finds "hoãn".
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Library (`/library`): search, inspect, listen, save and pick senses to practise. Browsing records no evidence. */
export function LibraryPage() {
  const { t } = useTranslation();
  const { catalog, snapshot, repository, applyBookmark } = useLearning();
  const [query, setQuery] = useState('');
  const [topicId, setTopicId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [stage, setStage] = useState<MasteryStage | ''>('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState<Set<string>>(() => new Set());
  const [failed, setFailed] = useState<Set<string>>(() => new Set());

  const entries = useMemo<(LibraryEntry & { topicId: string; levelId: string; search: string })[]>(() => {
    const lessons = new Map(catalog.lessons.map((lesson) => [lesson.id, lesson]));
    const topics = new Map(catalog.topics.map((topic, index) => [topic.id, { topic, index }]));
    const stages = new Map(snapshot.cards.map((card) => [card.senseId, card.masteryStage]));
    return catalog.senses.flatMap((sense) => {
      const topic = topics.get(lessons.get(sense.lessonId)?.topicId ?? '');
      if (!topic) return [];
      const contexts = catalog.contexts.filter((context) => context.senseId === sense.id);
      return [{
        sense, contexts, topicTitle: topic.topic.title, topicIndex: topic.index,
        stage: stages.get(sense.id) ?? 'new', topicId: topic.topic.id, levelId: topic.topic.levelId,
        search: fold([sense.headword, sense.definition, sense.viGloss ?? '', ...sense.collocations].join(' ')),
      }];
    }).sort((a, b) => a.sense.headword.localeCompare(b.sense.headword, 'en'));
  }, [catalog, snapshot.cards]);
  const savedIds = useMemo(() => new Set(snapshot.bookmarks.map((bookmark) => bookmark.senseId)), [snapshot.bookmarks]);
  const levels = [...new Set(catalog.topics.map((topic) => topic.levelId))];

  const needle = fold(query.trim());
  const shown = entries.filter((entry) => (!needle || entry.search.includes(needle))
    && (!topicId || entry.topicId === topicId)
    && (!levelId || entry.levelId === levelId)
    && (!stage || entry.stage === stage)
    && (!savedOnly || savedIds.has(entry.sense.id)));
  const shownLevels = [...new Set(shown.map((entry) => entry.levelId))];
  const filtered = Boolean(needle || topicId || levelId || stage || savedOnly);

  async function toggleSaved(senseId: string) {
    const desired = !savedIds.has(senseId);
    // One request per sense at a time keeps the saved state in request order.
    setSaving((current) => toggled(current, senseId, true));
    setFailed((current) => toggled(current, senseId, false));
    try {
      await repository.setBookmark(senseId, desired);
      applyBookmark(senseId, desired);
    } catch {
      setFailed((current) => toggled(current, senseId, true));
    } finally {
      setSaving((current) => toggled(current, senseId, false));
    }
  }

  function clearFilters() {
    setQuery('');
    setTopicId('');
    setLevelId('');
    setStage('');
    setSavedOnly(false);
  }

  const selectedIds = [...selected];
  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('library.title')}</h1>
        <p>{t('library.subtitle')}</p>
      </div>

      <div className="library-toolbar" role="search" aria-label={t('library.filtersLabel')}>
        <label className="library-search">
          <span className="visually-hidden">{t('library.searchLabel')}</span>
          <Icon name="search" size={20} />
          <input type="search" value={query} placeholder={t('library.searchPlaceholder')} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select className="library-select" aria-label={t('library.topicLabel')} value={topicId} onChange={(event) => setTopicId(event.target.value)}>
          <option value="">{t('library.allTopics')}</option>
          {catalog.topics.map((topic) => <option key={topic.id} value={topic.id} lang="en">{topic.title}</option>)}
        </select>
        <select className="library-select" aria-label={t('library.levelLabel')} value={levelId} onChange={(event) => setLevelId(event.target.value)}>
          <option value="">{t('library.allLevels')}</option>
          {levels.map((id) => <option key={id} value={id}>{levelName(t, id)}</option>)}
        </select>
        <select className="library-select" aria-label={t('library.stageLabel')} value={stage} onChange={(event) => setStage(event.target.value as MasteryStage | '')}>
          <option value="">{t('library.allStages')}</option>
          {STAGES.map((value) => <option key={value} value={value}>{t(`mastery.${value}`)}</option>)}
        </select>
        <label className="library-saved">
          <input type="checkbox" checked={savedOnly} onChange={(event) => setSavedOnly(event.target.checked)} />
          {t('library.saved')}
        </label>
      </div>

      <section className="library-card" aria-labelledby="library-count">
        <div className="library-card-head">
          <h2 id="library-count" aria-live="polite">{t('library.count', { count: shown.length })}</h2>
          {shownLevels.map((id) => <span key={id} className="level-badge">{levelName(t, id)}</span>)}
          {selected.size > 0 && (
            <div className="library-selection" role="region" aria-label={t('library.selectionLabel')}>
              <span className="library-selection-count" role="status">{t('library.selected', { count: selected.size })}</span>
              <button type="button" className="text-button" onClick={() => setSelected(new Set())}>{t('library.clearSelection')}</button>
              <StartPractice
                config={{ mode: 'custom', senseIds: selectedIds, questionBudget: Math.min(MAX_QUESTION_BUDGET, selectedIds.length) }}
                label={t('library.practise', { count: selected.size })}
              />
            </div>
          )}
        </div>
        {shown.length === 0 ? (
          <div className="library-empty">
            <h3>{t('library.emptyTitle')}</h3>
            <p className="muted">{t('library.emptyBody')}</p>
            {filtered && <button type="button" className="btn btn-secondary" onClick={clearFilters}>{t('library.clearFilters')}</button>}
          </div>
        ) : (
          <ul className="library-list">
            {shown.map((entry) => (
              <LibraryRow
                key={entry.sense.id}
                entry={entry}
                selected={selected.has(entry.sense.id)}
                saved={savedIds.has(entry.sense.id)}
                saving={saving.has(entry.sense.id)}
                failed={failed.has(entry.sense.id)}
                onSelect={(value) => setSelected((current) => toggled(current, entry.sense.id, value))}
                onToggleSaved={() => void toggleSaved(entry.sense.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
