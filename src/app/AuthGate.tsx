import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { createPrivateAuth, PrivateAuth } from '../lib/auth';
import { SignInPage } from '../pages/SignInPage';
import { StatePanel } from '../components/StatePanel';
import { LearningProvider } from './LearningProvider';

/**
 * Chooses between configuration error, sign-in and the signed-in application. Account-bound state is
 * keyed by account ID, so signing in as someone else remounts it from scratch.
 */
export function AuthGate({ auth, children }: { auth: ReturnType<typeof createPrivateAuth>; children: ReactNode }) {
  const { t } = useTranslation();
  if (!auth.ok) {
    return (
      <main className="center-screen">
        <StatePanel role="alert" title={t('config.title')} body={t(auth.code === 'missing-config' ? 'config.missing' : 'config.invalid')} />
      </main>
    );
  }
  return <AccountGate auth={auth}>{children}</AccountGate>;
}

function AccountGate({ auth, children }: { auth: PrivateAuth; children: ReactNode }) {
  const { t } = useTranslation();
  // undefined until Supabase reports the initial session.
  const [accountId, setAccountId] = useState<string | null>();

  useEffect(() => auth.subscribeAccount(setAccountId), [auth]);

  if (accountId === undefined) {
    return (
      <main className="center-screen">
        <p role="status" className="muted">{t('common.loading')}</p>
      </main>
    );
  }
  if (accountId === null) return <SignInPage auth={auth} />;
  return (
    <Fragment key={accountId}>
      <LearningProvider auth={auth}>{children}</LearningProvider>
    </Fragment>
  );
}
