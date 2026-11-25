import { useTranslation } from 'react-i18next';
import type { studyActivity } from '../../domain/activity';
import { Icon } from '../../components/Icon';

export function ActivityCalendar({ activity, timezone }: {
  activity: ReturnType<typeof studyActivity>;
  timezone: string;
}) {
  const { t, i18n } = useTranslation();
  const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: 'short', timeZone: 'UTC' });
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'full', timeZone: 'UTC' });
  return (
    <div className="activity-calendar" role="group" aria-label={t('activity.calendarLabel', { timezone })}>
      {activity.days.map(({ day, status }) => {
        const value = new Date(`${day}T12:00:00Z`);
        return (
          <span key={day} className="activity-day" role="img" aria-label={t(`activity.day.${status}`, { date: date.format(value) })}>
            <span>{weekday.format(value)}</span>
            <span className={`activity-dot activity-${status}${day === activity.today ? ' is-today' : ''}`} aria-hidden="true">
              {status === 'active' ? <Icon name="check" size={16} /> : status === 'unknown' ? '?' : null}
            </span>
          </span>
        );
      })}
    </div>
  );
}
