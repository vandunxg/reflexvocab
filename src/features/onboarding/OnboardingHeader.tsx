import { useTranslation } from 'react-i18next';
import { Icon } from '../../components/Icon';

/** Focused onboarding header: back, step progress and skip-with-default for the current step. */
export function OnboardingHeader({ step, disabled, onBack, onSkip }: {
  step: number;
  disabled: boolean;
  onBack: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  return (
    <header className="onboarding-header">
      <button
        type="button"
        className="session-exit onboarding-back"
        aria-label={t('onboarding.back')}
        onClick={onBack}
        disabled={disabled}
        hidden={step === 1}
      >
        <Icon name="arrowLeft" size={22} />
      </button>
      <div className="session-progress" role="progressbar" aria-label={t('onboarding.progressLabel')} aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}>
        <div className="session-progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
      </div>
      <span className="session-position onboarding-position">{t('onboarding.position', { step })}</span>
      <button type="button" className="text-button onboarding-skip" onClick={onSkip} disabled={disabled}>
        <span className="onboarding-skip-long">{t('onboarding.skip')}</span>
        <span className="onboarding-skip-short">{t('onboarding.skipShort')}</span>
      </button>
    </header>
  );
}
