import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import { nextLesson } from '../domain/curriculum';
import type { MasteryStage } from '../domain/model';
import { categorize } from '../domain/session';
import { Icon } from '../components/Icon';
import { LessonUnit } from '../features/learn/LessonUnit';
import { useLearningPath } from '../features/learn/path';
import { levelName } from '../i18n';

const STAGES: MasteryStage[] = ['new', 'learning', 'familiar', 'mastered'];

/** Learning path (`/learn`): course order with every lesson open and one suggested position. */
export function LearnPage() {
  const { t } = useTranslation();
  const { snapshot, settings } = useLearning();
  const path = useLearningPath();
  const [now] = useState(() => new Date());
  const suggested = nextLesson(path);
  const stages = new Map(snapshot.cards.map((card) => [card.senseId, card.masteryStage]));
  const lessons = path.flatMap((level) => level.lessons);
  const total = lessons.reduce((sum, item) => sum + item.senses.length, 0);
  const started = lessons.reduce((sum, item) => sum + item.covered, 0);
  const mastered = lessons.reduce((sum, item) => sum + item.mastered, 0);
  const due = snapshot.cards.filter((card) => categorize(card, now) === 'due').length;

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
          {path.map((level, index) => {
            const topics = new Set(level.lessons.map((item) => item.topic.id)).size;
            const senses = level.lessons.reduce((sum, item) => sum + item.senses.length, 0);
            return (
              <section key={`${level.courseId}:${level.levelId}`} className="learn-level" aria-labelledby={`level-${index}`}>
                <div className="learn-level-head">
                  <div>
                    <p className="eyebrow">{t('learn.levelNumber', { number: index + 1 })}</p>
                    <h2 id={`level-${index}`}>{levelName(t, level.levelId)}</h2>
                  </div>
                  <span className="tag learn-level-pill">
                    {[t('learn.topicCount', { count: topics }), t('learn.lessonCount', { count: level.lessons.length }), t('learn.senseCount', { count: senses })].join(' · ')}
                  </span>
                </div>
                <ol className="learn-units">
                  {level.lessons.map((item) => (
                    <LessonUnit key={item.lesson.id} item={item} suggested={item === suggested} stages={stages} newLimit={settings.newPerDay} />
                  ))}
                </ol>
              </section>
            );
          })}
          <div className="learn-more">
            <span className="learn-more-node" aria-hidden="true"><Icon name="learn" size={26} /></span>
            <p>{t('learn.more')}</p>
          </div>
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
