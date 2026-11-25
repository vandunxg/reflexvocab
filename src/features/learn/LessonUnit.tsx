import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { PathLesson } from '../../domain/curriculum';
import type { MasteryStage } from '../../domain/model';
import { Icon } from '../../components/Icon';
import { LessonAction } from './LessonAction';
import { lessonHref, padNumber } from './path';

/** One lesson on the path: coverage, per-sense memory level and open actions. Nothing is locked. */
export function LessonUnit({ item, suggested, stages, newLimit }: {
  item: PathLesson;
  suggested: boolean;
  stages: Map<string, MasteryStage>;
  newLimit: number;
}) {
  const { t } = useTranslation();
  const { lesson, topic, topicNumber, lessonNumber, senses, covered, mastered, status } = item;
  const total = senses.length;
  const titleId = `lesson-${lesson.id}`;
  const title = `${t('learn.lessonNumber', { number: lessonNumber })} · ${lesson.title}`;
  const view = <Link to={lessonHref(item)} className="btn btn-secondary">{t('learn.view')}</Link>;
  return (
    <li className={`learn-unit topic-tone-${(topicNumber - 1) % 3}`}>
      <div className="learn-node-wrap">
        {suggested && status === 'partial' && (
          <Link to={lessonHref(item)} className="learn-callout" aria-label={t('learn.continueAtLabel', { title: lesson.title, covered, total })}>
            {t('learn.continueAt', { covered, total })}
          </Link>
        )}
        <div className={status === 'complete' ? 'learn-node is-complete' : suggested ? 'learn-node is-suggested' : 'learn-node'} aria-hidden="true">
          {status === 'complete' ? <Icon name="check" size={34} /> : padNumber(topicNumber)}
        </div>
      </div>
      <article className={suggested ? 'learn-card is-suggested' : 'learn-card'} aria-labelledby={titleId}>
        <div className="learn-card-head">
          <div>
            <p className="eyebrow">{t('learn.topicNumber', { number: padNumber(topicNumber) })} · <span className="learn-topic" lang="en">{topic.title}</span></p>
            <h3 id={titleId}>{title}</h3>
          </div>
          {suggested
            ? <span className="tag learn-suggested">{t('learn.suggested')}</span>
            : <span className={`tag learn-status-${status}`}>{status === 'complete' && <Icon name="check" size={14} />}{t(`learn.status.${status}`)}</span>}
        </div>
        {suggested && covered < total && (
          <p className="learn-note">{t('learn.newLeft', { count: total - covered, limit: newLimit })}</p>
        )}
        {item.unavailable > 0 && <p className="notice">{t('lesson.unavailable', { count: item.unavailable })}</p>}
        <div className="learn-progress">
          <div className="learn-bar" role="progressbar" aria-label={t('learn.metLabel', { title: lesson.title, covered, total })}
            aria-valuemin={0} aria-valuemax={total} aria-valuenow={covered}>
            <span style={{ width: `${(covered / total) * 100}%` }} />
          </div>
          <span className="learn-met">{t('learn.met', { covered, total })}</span>
          <span className={mastered > 0 ? 'tag stage-mastered' : 'tag stage-new'}>{t('learn.masteredCount', { count: mastered })}</span>
        </div>
        <ul className="learn-chips">
          {senses.map((sense) => {
            const stage = stages.get(sense.id) ?? 'new';
            return (
              <li key={sense.id} className={stage === 'new' ? 'learn-chip is-new' : 'learn-chip'}>
                <span className={`stage-dot stage-dot-${stage}`} aria-hidden="true" />
                <span lang="en">{sense.headword}</span>
                <span className="visually-hidden">: {t(`mastery.${stage}`)}</span>
              </li>
            );
          })}
        </ul>
        <div className="learn-actions">
          {suggested ? <><LessonAction item={item} variant="primary" />{view}</> : <>{view}<LessonAction item={item} variant="secondary" /></>}
        </div>
      </article>
    </li>
  );
}
