import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../../app/LearningProvider';
import type { PathLesson } from '../../domain/curriculum';
import { questionBudgetFor } from '../../domain/session';
import { Icon } from '../../components/Icon';
import { BUTTON_VARIANTS, StartPractice } from '../../components/StartPractice';

/** Resumes this lesson's unfinished session, or starts a lesson session through the shared entry. */
export function LessonAction({ item, variant }: { item: PathLesson; variant: 'primary' | 'secondary' }) {
  const { t } = useTranslation();
  const { snapshot, settings } = useLearning();
  const current = snapshot.currentSession;
  if (current?.status === 'current' && current.config.mode === 'lesson' && current.config.lessonId === item.lesson.id) {
    return <Link to="/session" className={BUTTON_VARIANTS[variant]}>{t('learn.resume')}<Icon name="arrowRight" /></Link>;
  }
  const label = { untouched: t('learn.start'), partial: t('learn.continue'), complete: t('learn.review') }[item.status];
  return (
    <StartPractice
      config={{ mode: 'lesson', lessonId: item.lesson.id, questionBudget: questionBudgetFor(settings.dailyMinutes) }}
      label={label}
      variant={variant}
    />
  );
}
