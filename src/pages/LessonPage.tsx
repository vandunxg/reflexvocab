import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';
import type { MasteryStage } from '../domain/model';
import { buildQueue, questionBudgetFor } from '../domain/session';
import { StartPractice } from '../components/StartPractice';
import { StatePanel } from '../components/StatePanel';
import { SpeakButton } from '../features/audio/SpeakButton';
import { LessonAction } from '../features/learn/LessonAction';
import { padNumber, useLearningPath } from '../features/learn/path';
import { levelName } from '../i18n';

const STATUS_TONE = { untouched: 'stage-new', partial: 'stage-learning', complete: 'stage-mastered' };
const HOW_STEPS = [1, 2, 3] as const;

/** Lesson detail (`/learn/lessons/:lessonId`). Opening it records nothing; actions use the shared session entry. */
export function LessonPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { catalog, snapshot, settings } = useLearning();
  const path = useLearningPath();
  const level = path.find((candidate) => candidate.lessons.some((item) => item.lesson.id === lessonId));
  const item = level?.lessons.find((candidate) => candidate.lesson.id === lessonId);
  if (!level || !item) {
    return (
      <div className="page">
        <StatePanel title={t('lesson.missing')} body={t('lesson.missingBody')} action={{ label: t('lessonComplete.backToPath'), onClick: () => navigate('/learn') }} />
      </div>
    );
  }

  const { lesson, topic, topicNumber, lessonNumber, senses, covered, mastered, status, unavailable } = item;
  const stages = new Map<string, MasteryStage>(snapshot.cards.map((card) => [card.senseId, card.masteryStage]));
  const senseIds = new Set(senses.map((sense) => sense.id));
  const kinds = new Set(catalog.exercises.filter((exercise) => exercise.active && senseIds.has(exercise.senseId))
    .map((exercise) => exercise.kind)).size;
  const metIds = senses.filter((sense) => stages.has(sense.id)).map((sense) => sense.id);
  const firstNew = senses.find((sense) => !stages.has(sense.id)
    && catalog.exercises.some((exercise) => exercise.active && exercise.senseId === sense.id));
  const budget = questionBudgetFor(settings.dailyMinutes);
  // The size of the session a lesson start would build now, not the daily budget.
  const planned = buildQueue({
    config: { mode: 'lesson', lessonId: lesson.id, questionBudget: budget },
    topics: catalog.topics, lessons: catalog.lessons, senses: catalog.senses, exercises: catalog.exercises,
    progress: snapshot.cards, now: new Date(), timezone: settings.timezone, newPerDay: settings.newPerDay,
  }).length;

  return (
    <div className="page page-wide lesson-page">
      <nav className="breadcrumb" aria-label={t('lesson.breadcrumb')}>
        <ol>
          <li><Link to="/learn">{t('learn.title')}</Link></li>
          <li aria-hidden="true">/</li>
          <li>{levelName(t, level.levelId)}</li>
          <li aria-hidden="true">/</li>
          <li lang="en">{topic.title}</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{t('learn.lessonNumber', { number: lessonNumber })}</li>
        </ol>
      </nav>

      <section className="lesson-hero" aria-labelledby="lesson-title">
        <div className={`lesson-hero-main topic-tone-${(topicNumber - 1) % 3}`}>
          <div className="lesson-hero-shapes" aria-hidden="true"><span /><span /><span /></div>
          <p className="eyebrow">{t('lesson.eyebrow', { topicNumber: padNumber(topicNumber), topic: topic.title, lessonNumber })}</p>
          <h1 id="lesson-title" lang="en">{lesson.title}</h1>
          <div className="lesson-hero-pills">
            <span className="tag">{t('learn.senseCount', { count: senses.length })}</span>
            {planned > 0 && <span className="tag">{t('lesson.questions', { count: planned })}</span>}
            <span className="tag">{t('lesson.kinds', { count: kinds })}</span>
          </div>
        </div>
        <section className="lesson-status" aria-label={t('lesson.statusLabel')}>
          <div className="lesson-status-head">
            <span className={`tag ${STATUS_TONE[status]}`}>{t(`learn.status.${status}`)}</span>
            <span className={mastered > 0 ? 'tag stage-mastered' : 'tag stage-new'}>{t('learn.masteredCount', { count: mastered })}</span>
          </div>
          <p className="lesson-status-met">{t('lesson.met', { covered, total: senses.length })}</p>
          <div className="learn-bar" role="progressbar" aria-label={t('learn.metLabel', { title: lesson.title, covered, total: senses.length })}
            aria-valuemin={0} aria-valuemax={senses.length} aria-valuenow={covered}>
            <span style={{ width: `${(covered / senses.length) * 100}%` }} />
          </div>
          {covered < senses.length && <p className="muted">{t('lesson.newWaiting', { count: senses.length - covered })}</p>}
          {unavailable > 0 && <p className="notice" role="status">{t('lesson.unavailable', { count: unavailable })}</p>}
          <div className="lesson-status-actions">
            <LessonAction item={item} variant="primary" />
            {metIds.length > 0 && status !== 'complete' && (
              <StartPractice config={{ mode: 'custom', senseIds: metIds, questionBudget: Math.min(budget, Math.max(1, metIds.length * 2)) }}
                label={t('lesson.practiseOnly')} variant="secondary" />
            )}
          </div>
          <p className="lesson-status-note">{t('lesson.newNote', { limit: settings.newPerDay })}</p>
        </section>
      </section>

      <div className="lesson-layout">
        <section className="lesson-senses" aria-labelledby="lesson-learn-title">
          <div className="lesson-senses-head">
            <h2 id="lesson-learn-title">{t('lesson.learnTitle')}</h2>
            <span className="muted">{t('lesson.learnNote')}</span>
          </div>
          <ul>
            {senses.map((sense) => {
              const stage = stages.get(sense.id) ?? 'new';
              return (
                <li key={sense.id} className={stage === 'new' ? 'lesson-sense is-new' : 'lesson-sense'}>
                  <div className="lesson-sense-text">
                    <div className="lesson-sense-word">
                      <strong lang="en">{sense.headword}</strong>
                      <span className="muted" lang="en">{[sense.ipa, sense.partOfSpeech].filter(Boolean).join(' · ')}</span>
                      {stage === 'new' && <span className="tag lesson-new-badge">{sense === firstNew ? t('lesson.newNext') : t('lesson.newBadge')}</span>}
                    </div>
                    <p lang="en">{sense.definition}</p>
                  </div>
                  <div className="lesson-sense-side">
                    <span className={`stage-pill stage-${stage}`}>{t(`mastery.${stage}`)}</span>
                    <SpeakButton text={sense.headword} label={t('library.listen', { word: sense.headword })} small />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        <aside className="lesson-aside">
          <section className="learn-side-card" aria-labelledby="lesson-how-title">
            <h2 id="lesson-how-title">{t('lesson.howTitle')}</h2>
            <ol className="lesson-how">
              {HOW_STEPS.map((step) => (
                <li key={step}>
                  <span className="lesson-how-number" aria-hidden="true">{step}</span>
                  <span><strong>{t(`lesson.how${step}Title`)}</strong><span className="muted">{t(`lesson.how${step}Body`)}</span></span>
                </li>
              ))}
            </ol>
          </section>
          <p className="lesson-complete-rule">{t('lesson.completionNote', { count: senses.length })}</p>
        </aside>
      </div>
    </div>
  );
}
