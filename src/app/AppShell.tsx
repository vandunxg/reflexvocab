import { Link, NavLink, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Brand } from '../components/Brand';
import { Icon, type IconName } from '../components/Icon';

// Only implemented product surfaces appear here; feature tasks add their routes as they land.
const NAV_ITEMS: { to: string; icon: IconName; label: 'nav.today' | 'nav.learn' | 'nav.practice' | 'nav.library' | 'nav.progress' }[] = [
  { to: '/', icon: 'today', label: 'nav.today' },
  { to: '/learn', icon: 'learn', label: 'nav.learn' },
  { to: '/practice', icon: 'practice', label: 'nav.practice' },
  { to: '/library', icon: 'library', label: 'nav.library' },
  { to: '/progress', icon: 'progress', label: 'nav.progress' },
];

/** Main-screen layout: desktop top navigation, mobile bottom navigation, Settings in the header. */
export function AppShell() {
  const { t } = useTranslation();
  return (
    <>
      <a className="skip-link" href="#main">{t('common.skipToContent')}</a>
      <header className="app-header">
        <Link to="/" aria-label={t('nav.home')}><Brand /></Link>
        <nav className="top-nav" aria-label={t('nav.label')}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className="tab">{t(item.label)}</NavLink>
          ))}
        </nav>
        <div className="app-header-tools">
          <NavLink to="/settings" className="icon-button" aria-label={t('nav.settings')}>
            <Icon name="settings" />
          </NavLink>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label={t('nav.label')}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="bottom-tab">
            <span className="bottom-tab-pill"><Icon name={item.icon} /></span>
            {t(item.label)}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
