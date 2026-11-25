import { AccountBoundary } from './lib/AccountBoundary';
import { createPrivateAuth } from './lib/auth';

const auth = createPrivateAuth({
  url: import.meta.env.VITE_SUPABASE_URL,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
});

export default function App() {
  // P03-T01 supplies the signed-in and signed-out screens.
  return auth.ok ? <AccountBoundary auth={auth}>{() => null}</AccountBoundary> : null;
}
