import { BrowserRouter, Route, Routes } from 'react-router';
import { AppShell } from './app/AppShell';
import { AuthGate } from './app/AuthGate';
import { createPrivateAuth } from './lib/auth';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
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
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}
