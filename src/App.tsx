import { BrowserRouter, Route, Routes } from 'react-router';
import { AppShell } from './app/AppShell';
import { AuthGate } from './app/AuthGate';
import { OnboardingGate } from './app/OnboardingGate';
import { createPrivateAuth } from './lib/auth';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { PracticePage } from './pages/PracticePage';
import { ProgressPage } from './pages/ProgressPage';
import { LessonCompletePage } from './pages/LessonCompletePage';
import { LessonPage } from './pages/LessonPage';
import { LibraryPage } from './pages/LibraryPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SessionPage } from './pages/SessionPage';
import { SettingsPage } from './pages/SettingsPage';

const auth = createPrivateAuth({
  url: import.meta.env.VITE_SUPABASE_URL,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
});

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate auth={auth}>
        <Routes>
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route element={<OnboardingGate />}>
            <Route path="session" element={<SessionPage />} />
            <Route path="learn/lessons/:lessonId/complete" element={<LessonCompletePage />} />
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="learn" element={<LearnPage />} />
              <Route path="practice" element={<PracticePage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="learn/lessons/:lessonId" element={<LessonPage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}
