import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Brand } from '../components/Brand';
import { Icon } from '../components/Icon';
import type { PrivateAuth } from '../lib/auth';

type SignInError = 'required' | 'unauthenticated' | 'unavailable';

/** Sign-in for provisioned accounts (Login / M-Login boards). There is no public signup path. */
export function SignInPage({ auth }: { auth: PrivateAuth }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<SignInError | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    if (!email || !password) {
      setError('required');
      return;
    }
    setPending(true);
    setError(null);
    const result = await auth.signIn(email, password);
    // On success the auth subscription replaces this screen.
    if (!result.ok) {
      setError(result.code);
      setPending(false);
    }
  }

  return (
    <div className="signin">
      <section className="signin-hero" aria-label={t('signIn.heroLabel')}>
        <div className="signin-shapes" aria-hidden="true">
          <span className="shape shape-lime-circle" />
          <span className="shape shape-pink-triangle" />
          <span className="shape shape-yellow-square" />
          <span className="shape shape-orange-arc" />
          <span className="shape shape-ring" />
        </div>
        <Brand />
        <div className="signin-sample" aria-hidden="true">
          <div className="signin-sample-meta">
            <span className="signin-sample-topic">{t('signIn.sampleTopic')}</span>
            <span>{t('signIn.sampleProgress')}</span>
          </div>
          <p lang="en" className="signin-sample-prompt">{t('signIn.samplePrompt')}</p>
          <div className="signin-sample-options" lang="en">
            <span>attend</span>
            <span className="is-correct">postpone</span>
            <span>confirm</span>
            <span>agenda</span>
          </div>
        </div>
        <div className="signin-hero-copy">
          <p className="signin-hero-title">{t('signIn.heroTitle')}</p>
          <p className="signin-hero-body">{t('signIn.heroBody')}</p>
        </div>
      </section>

      <div className="signin-mobile-band" aria-hidden="true">
        <svg width="390" height="200" viewBox="0 0 390 200">
          <circle cx="300" cy="64" r="62" fill="#3d57e6" />
          <rect x="196" y="104" width="78" height="78" rx="16" fill="#ff76d6" transform="rotate(-14 235 143)" />
          <path d="M330 120l46 80h-92z" fill="#ffcf3d" />
          <circle cx="60" cy="168" r="30" fill="#ff9238" />
          <rect x="110" y="40" width="40" height="40" rx="10" fill="#8a5cf0" transform="rotate(18 130 60)" />
        </svg>
      </div>

      <main className="signin-main">
        <form className="signin-form" onSubmit={submit} noValidate>
          <span className="signin-mobile-brand"><Brand /></span>
          <div>
            <h1>{t('signIn.title')}</h1>
            <p className="signin-subtitle muted">
              <span className="signin-desktop-only">{t('signIn.subtitle')}</span>
              <span className="signin-mobile-only">{t('signIn.tagline')}</span>
            </p>
          </div>
          <label className="field">
            {t('signIn.email')}
            <input name="email" type="email" autoComplete="username" required aria-invalid={error === 'required' || undefined} />
          </label>
          <label className="field">
            {t('signIn.password')}
            <input name="password" type="password" autoComplete="current-password" required aria-invalid={error === 'required' || undefined} />
          </label>
          {error && <p className="notice notice-error" role="alert"><Icon name="alert" size={18} />{t(`signIn.errors.${error}`)}</p>}
          <button type="submit" className="btn btn-primary btn-block signin-submit" disabled={pending}>
            {pending ? t('signIn.submitting') : t('signIn.submit')}
            {!pending && <Icon name="arrowRight" />}
          </button>
          <p className="notice signin-private"><Icon name="lock" size={18} />{t('signIn.privateNotice')}</p>
        </form>
      </main>
    </div>
  );
}
