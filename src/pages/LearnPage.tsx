import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import { nextLesson, type PathLesson } from '../domain/curriculum';
import type { MasteryStage } from '../domain/model';
import { categorize } from '../domain/session';
import { Icon } from '../components/Icon';
import { LoadMore, useIncremental } from '../components/LoadMore';
import { Select } from '../components/Select';
import { StatePanel } from '../components/StatePanel';
import { LessonUnit } from '../features/learn/LessonUnit';
import { useLearningPath } from '../features/learn/path';
import { levelName } from '../i18n';
import { foldText } from '../lib/text';

const STAGES: MasteryStage[] = ['new', 'learning', 'familiar', 'mastered'];
const STATUSES: PathLesson['status'][] = ['untouched', 'partial', 'complete'];
const LESSON_STEP = 6;

/** Learning path (`/learn`): course order with every lesson open and one suggested position. */
export function LearnPage() {
  const { t } = useTranslation();
  const { snapshot, settings } = useLearning();
  const path = useLearningPath();
  const [now] = useState(() => new Date());
  const [query, setQuery] = useState('');
  const [levelId, setLevelId] = useState('');
  const [status, setStatus] = useState<PathLesson['status'] | ''>('');
  const suggested = nextLesson(path);
  const stages = new Map(snapshot.cards.map((card) => [card.senseId, card.masteryStage]));
  const lessons = path.flatMap((level) => level.lessons);
  const total = lessons.reduce((sum, item) => sum + item.senses.length, 0);
  const started = lessons.reduce((sum, item) => sum + item.covered, 0);
  const mastered = lessons.reduce((sum, item) => sum + item.mastered, 0);
  const due = snapshot.cards.filter((card) => categorize(card, now) === 'due').length;

  // Filters narrow the path without renumbering it: levels and topics keep their course position.
  const needle = foldText(query.trim());
  const filtered = Boolean(needle || levelId || status);
  const groups = path.map((level, index) => ({
    level, number: index + 1,
    lessons: level.lessons.filter((item) => (!levelId || level.levelId === levelId)
      && (!status || item.status === status)
      && (!needle || foldText(`${item.topic.title} ${item.lesson.title}`).includes(needle))),
  })).filter((group) => group.lessons.length > 0);
  const matches = groups.flatMap((group) => group.lessons);
  // The first step always reaches the suggested lesson, so its callout is never hidden.
  const { count, showMore } = useIncremental(LESSON_STEP, `${needle}|${levelId}|${status}`,
    Math.max(LESSON_STEP, suggested ? matches.indexOf(suggested) + 1 : 0));
  const shown = new Set(matches.slice(0, count));

  function clearFilters() {
    setQuery('');
    setLevelId('');
    setStatus('');
  }

  return (
    <div className="page page-wide">
      <section className="learn-hero" aria-labelledby="learn-title">
        <div className="learn-hero-shapes" aria-hidden="true"><span /><span /><span /></div>
        <span className="learn-hero-icon" aria-hidden="true"><Icon name="learn" size={34} /></span>
        <div className="learn-hero-copy">
          <p className="eyebrow">{t('learn.allOpen')}</p>
          <h1 id="learn-title">{t('learn.title')}</h1>
          <p>{t('learn.intro')}</p>
        </div>
        <dl className="learn-hero-stats">
          <div><dt>{t('learn.started')}</dt><dd>{started}/{total}</dd></div>
          <div><dt>{t('learn.mastered')}</dt><dd>{mastered}/{total}</dd></div>
        </dl>
      </section>

      <div className="learn-layout">
        <div className="learn-levels">
          <div className="filter-toolbar" role="search" aria-label={t('learn.filtersLabel')}>
            <label className="filter-search">
              <span className="visually-hidden">{t('learn.searchLabel')}</span>
              <Icon name="search" size={20} />
              <input type="search" value={query} placeholder={t('learn.searchPlaceholder')} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <Select className="filter-select" aria-label={t('learn.levelLabel')} value={levelId} onValueChange={setLevelId}>
              <option value="">{t('learn.allLevels')}</option>
              {[...new Set(path.map((level) => level.levelId))].map((id) => <option key={id} value={id}>{levelName(t, id)}</option>)}
            </Select>
            <Select className="filter-select" aria-label={t('learn.statusLabel')} value={status}
              onValueChange={(value) => setStatus(value as PathLesson['status'] | '')}>
              <option value="">{t('learn.allStatuses')}</option>
              {STATUSES.map((value) => <option key={value} value={value}>{t(`learn.status.${value}`)}</option>)}
            </Select>
          </div>
          {filtered && <p className="learn-results" aria-live="polite">{t('learn.results', { count: matches.length })}</p>}
          {matches.length === 0 && (
            <StatePanel title={t('learn.emptyTitle')} body={t('learn.emptyBody')} action={{ label: t('learn.clearFilters'), onClick: clearFilters }} />
          )}
          {groups.map(({ level, number, lessons }) => {
            if (!shown.has(lessons[0])) return null;
            const topics = new Set(level.lessons.map((item) => item.topic.id)).size;
            const senses = level.lessons.reduce((sum, item) => sum + item.senses.length, 0);
            return (
              <section key={`${level.courseId}:${level.levelId}`} className="learn-level" aria-labelledby={`level-${number}`}>
                <div className="learn-level-head">
                  <div>
                    <p className="eyebrow">{t('learn.levelNumber', { number })}</p>
                    <h2 id={`level-${number}`}>{levelName(t, level.levelId)}</h2>
                  </div>
                  <span className="tag learn-level-pill">
                    {[t('learn.topicCount', { count: topics }), t('learn.lessonCount', { count: level.lessons.length }), t('learn.senseCount', { count: senses })].join(' · ')}
                  </span>
                </div>
                <ol className="learn-units">
                  {lessons.filter((item) => shown.has(item)).map((item) => (
                    <LessonUnit key={item.lesson.id} item={item} suggested={item === suggested} stages={stages} newLimit={settings.newPerDay} />
                  ))}
                </ol>
              </section>
            );
          })}
          <LoadMore shown={Math.min(count, matches.length)} total={matches.length} onMore={showMore} />
          {!filtered && count >= matches.length && (
            <div className="learn-more">
              <span className="learn-more-node" aria-hidden="true"><Icon name="learn" size={26} /></span>
              <p>{t('learn.more')}</p>
            </div>
          )}
        </div>

        <aside className="learn-aside">
          <section className="learn-side-card" aria-labelledby="rhythm-title">
            <h2 id="rhythm-title">{t('learn.rhythm.title')}</h2>
            <dl className="learn-rhythm">
              <div><dt>{t('learn.rhythm.limit')}</dt><dd>{t('learn.rhythm.limitValue', { count: settings.newPerDay })}</dd></div>
              <div><dt>{t('learn.rhythm.unstarted')}</dt><dd>{total - started}</dd></div>
              <div><dt>{t('learn.rhythm.due')}</dt><dd>{due}</dd></div>
            </dl>
            <p className="learn-side-note">{t('learn.rhythm.note')}</p>
            <Link to="/" className="btn btn-secondary btn-block">{t('learn.rhythm.action')}</Link>
          </section>
          <section className="learn-side-card" aria-labelledby="legend-title">
            <h2 id="legend-title">{t('learn.legend.title')}</h2>
            <p className="muted">{t('learn.legend.body')}</p>
            <ul className="learn-legend">
              {STAGES.map((stage) => (
                <li key={stage}><span className={`stage-dot stage-dot-${stage}`} aria-hidden="true" />{t(`mastery.${stage}`)}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
