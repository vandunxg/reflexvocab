import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLearning } from '../app/LearningProvider';

/** Settings (`/settings`). Learning preferences are added by P04-T04; the account section signs out. */
export function SettingsPage() {
  const { t } = useTranslation();
  const { auth } = useLearning();
  const [signOut, setSignOut] = useState<'idle' | 'pending' | 'failed'>('idle');

  async function handleSignOut() {
    setSignOut('pending');
    const result = await auth.signOut();
    // Success swaps the whole signed-in tree for the sign-in screen.
    if (!result.ok) setSignOut('failed');
  }

  return (
    <div className="page page-narrow">
      <div className="page-heading">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>
      <section className="section-card" aria-labelledby="account-title">
        <div>
          <h2 id="account-title">{t('settings.account.title')}</h2>
          <p>{t('settings.account.body')}</p>
          {signOut === 'failed' && <p className="status-pill status-pill-error" role="alert">{t('settings.account.signOutFailed')}</p>}
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleSignOut} disabled={signOut === 'pending'}>
          {signOut === 'pending' ? t('settings.account.signingOut') : t('settings.account.signOut')}
        </button>
      </section>
    </div>
  );
}
