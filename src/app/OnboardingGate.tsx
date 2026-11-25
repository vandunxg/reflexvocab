import { Navigate, Outlet } from 'react-router';
import { useLearning } from './LearningProvider';

/** Sends an account that has not finished onboarding to `/onboarding` before any other screen. */
export function OnboardingGate() {
  const { settings } = useLearning();
  return settings.onboardingCompleted ? <Outlet /> : <Navigate to="/onboarding" replace />;
}
