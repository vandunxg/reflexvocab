import { Link, Navigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import { nextLesson } from '../domain/curriculum';
import { Icon } from '../components/Icon';
import { lessonHref, useLearningPath } from '../features/learn/path';
import { levelName } from '../i18n';

/** Lesson-complete surface: shown only once every lesson sense has committed coverage. Not a mastery claim. */
export function LessonCompletePage() {
  const { t } = useTranslation();
  const { lessonId } = useParams();
  const { snapshot } = useLearning();
  const path = useLearningPath();
  const level = path.find((candidate) => candidate.lessons.some((item) => item.lesson.id === lessonId));
  const item = level?.lessons.find((candidate) => candidate.lesson.id === lessonId);
  if (!level || !item) return <Navigate to="/learn" replace />;
  if (item.status !== 'complete') return <Navigate to={lessonHref(item)} replace />;

  const stages = new Map(snapshot.cards.map((card) => [card.senseId, card.masteryStage]));
  const next = nextLesson(path);
  const done = level.lessons.filter((lesson) => lesson.status === 'complete').length;
  const levelSenses = level.lessons.reduce((sum, lesson) => sum + lesson.senses.length, 0);
  const levelMastered = level.lessons.reduce((sum, lesson) => sum + lesson.mastered, 0);
  const place = [levelName(t, level.levelId), item.topic.title, t('learn.lessonNumber', { number: item.lessonNumber })].join(' · ');

  return (
    <div className="lesson-complete">
      <header className="lesson-complete-header">
        <Link to="/learn" className="icon-button" aria-label={t('lessonComplete.close')}><Icon name="close" /></Link>
        <span>{place}</span>
        <span className="lesson-complete-spacer" aria-hidden="true" />
      </header>
      <main id="main" className="lesson-complete-main">
        <div className="lesson-complete-art" aria-hidden="true">
          <span /><span /><span /><span /><span />
          <span className="lesson-complete-medal"><Icon name="check" size={64} /></span>
        </div>
        <span className="lesson-complete-badge">{t('lessonComplete.badge')}</span>
        <h1 lang="en">{item.lesson.title}</h1>
        <p className="lesson-complete-body">{t('lessonComplete.body', { total: item.senses.length })}</p>

        <section className="lesson-complete-memory" aria-labelledby="memory-title">
          <h2 id="memory-title">{t('lessonComplete.memoryTitle')}</h2>
          <ul>
            {item.senses.map((sense) => {
              const stage = stages.get(sense.id) ?? 'new';
              return <li key={sense.id}><span lang="en">{sense.headword}</span><span className={`stage-pill stage-${stage}`}>{t(`mastery.${stage}`)}</span></li>;
            })}
          </ul>
          <p className="lesson-complete-note">{t('lessonComplete.note')}</p>
        </section>

        <div className="lesson-complete-level">
          <div className="lesson-complete-nodes" aria-hidden="true">
            {level.lessons.map((lesson) => (
              <span key={lesson.lesson.id} className={`lesson-complete-node topic-tone-${(lesson.topicNumber - 1) % 3}${lesson.status === 'complete' ? ' is-complete' : ''}`}>
                {lesson.status === 'complete' && <Icon name="check" size={16} />}
              </span>
            ))}
          </div>
          <p>
            <strong>{t('lessonComplete.level', { level: levelName(t, level.levelId), done, total: level.lessons.length })}</strong>{' '}
            <span className="muted">{t('lessonComplete.levelMastered', { mastered: levelMastered, senses: levelSenses })}</span>
          </p>
        </div>

        <div className="lesson-complete-actions">
          {next ? (
            <>
              <Link to="/learn" className="btn btn-secondary">{t('lessonComplete.backToPath')}</Link>
              <Link to={lessonHref(next)} className="btn btn-primary">
                {t('lessonComplete.next')} · <span lang="en">{next.lesson.title}</span><Icon name="arrowRight" />
              </Link>
            </>
          ) : (
            <Link to="/learn" className="btn btn-primary">{t('lessonComplete.backToPath')}<Icon name="arrowRight" /></Link>
          )}
        </div>
      </main>
    </div>
  );
}
