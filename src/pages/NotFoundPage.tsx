import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { StatePanel } from '../components/StatePanel';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="page page-narrow">
      <StatePanel title={t('notFound.title')} body={t('notFound.body')} action={{ label: t('notFound.action'), onClick: () => navigate('/') }} />
    </div>
  );
}
