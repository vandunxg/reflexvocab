import { useTranslation } from 'react-i18next';

/** Today (`/`). The start/resume experience is composed in P04-T03. */
export function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="page">
      <div className="page-heading">
        <h1>{t('today.title')}</h1>
        <p>{t('today.subtitle')}</p>
      </div>
    </div>
  );
}
