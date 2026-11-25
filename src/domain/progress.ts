import type { Attempt } from './model';

export function recentAttempts(attempts: Attempt[], limit: number) {
  return [...new Map(attempts.map((attempt) => [attempt.id, attempt])).values()]
    .sort((a, b) => b.attemptedAt.localeCompare(a.attemptedAt) || b.id.localeCompare(a.id)).slice(0, limit);
}

export function attemptMetrics(attempts: Attempt[]) {
  const unique = [...new Map(attempts.map((attempt) => [attempt.id, attempt])).values()];
  const first = unique.filter((attempt) => !attempt.isRetry && !attempt.hintUsed && !attempt.answerRevealed);
  const reviews = first.filter((attempt) => attempt.qualifiedReview);
  return {
    attempts: unique.length,
    firstUnassisted: first.length,
    firstCorrect: first.filter((attempt) => attempt.outcome === 'correct').length,
    assisted: unique.filter((attempt) => !attempt.isRetry && (attempt.hintUsed || attempt.answerRevealed)).length,
    retries: unique.filter((attempt) => attempt.isRetry).length,
    reviews: reviews.length,
    reviewCorrect: reviews.filter((attempt) => attempt.outcome === 'correct').length,
  };
}
