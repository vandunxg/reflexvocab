import { localDay } from './mastery.ts';
import { recentAttempts } from './progress.ts';
import type { Attempt } from './model';

function shiftDay(day: string, offset: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function studyActivity(attempts: Attempt[], limit: number, now: Date, timezone: string) {
  const recent = recentAttempts(attempts, limit);
  const today = localDay(now, timezone);
  const active = new Set(recent.map((attempt) => localDay(new Date(attempt.attemptedAt), timezone)));
  const oldest = recent.length === limit && limit > 0
    ? localDay(new Date(recent[recent.length - 1].attemptedAt), timezone) : null;
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = shiftDay(today, index - 6);
    return { day, status: active.has(day) ? 'active' as const : oldest && day < oldest ? 'unknown' as const : 'inactive' as const };
  });
  let day = active.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (active.has(day)) {
    streak += 1;
    day = shiftDay(day, -1);
  }
  return {
    today, days, streak, streakLowerBound: oldest !== null && day < oldest,
    todayAttempts: recent.filter((attempt) => localDay(new Date(attempt.attemptedAt), timezone) === today).length,
  };
}
