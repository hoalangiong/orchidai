import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../LanguageSwitcher';

const ADMIN_EMAIL = 'trananhthy@gmail.com';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen" style={{ background: '#f4faf2' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #5db53c 0%, #3d9e20 50%, #2d7d18 100%)' }}
        className="shadow-lg sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            {/* Leaf logo */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
              <span className="text-lg leading-none">🌿</span>
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wide leading-none block">{t('app.name')}</span>
              <span className="text-green-200 text-xs leading-none">{t('app.tagline')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user && (
              <button onClick={logout} className="flex items-center gap-2 active:scale-95 transition-transform">
                <div className="text-right hidden sm:block">
                  <p className="text-white text-xs font-medium leading-none">{user.displayName?.split(' ').pop()}</p>
                  <p className="text-green-200 text-xs leading-none mt-0.5">{t('auth.logout')}</p>
                </div>
                {user.photoURL
                  ? <img src={user.photoURL} className="w-9 h-9 rounded-full border-2 border-white/50 shadow" alt="" />
                  : <div className="w-9 h-9 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      {user.displayName?.[0] ?? '?'}
                    </div>
                }
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid #d4f0c8' }}>
        <div className="flex overflow-x-auto h-[62px] scrollbar-hide max-w-lg mx-auto">
          <NavItem to="/"           icon="🏠"  label={t('nav.home')} />
          <NavItem to="/dashboard"  icon="📊"  label={t('nav.dashboard')} />
          <NavItem to="/orchids"    icon="🌺"  label={t('nav.orchids')} />
          <NavItem to="/garden"     icon="🗺️"  label={t('nav.garden')} />
          <NavItem to="/weather"    icon="🌤️"  label={t('nav.weather')} />
          <NavItem to="/calendar"   icon="📅"  label={t('nav.calendar')} />
          <NavItem to="/diseases"   icon="🔬"  label={t('nav.diseases')} />
          {t('nav.order') && i18n.language === 'vi' && <NavItem to="/order" icon="🛒" label={t('nav.order')} />}
          <NavItem to="/community"  icon="🏆"  label={t('nav.community')} />
          <NavItem to="/propagation" icon="🌱" label={t('nav.propagation')} />
          <NavItem to="/costs"      icon="💰"  label={t('nav.costs')} />
          <NavItem to="/sensors"    icon="📡"  label={t('nav.sensors')} />
          <NavItem to="/security"   icon="🛡️"  label={t('nav.security')} />
          {user?.email === ADMIN_EMAIL && <NavItem to="/admin" icon="⚙️" label={t('nav.admin')} />}
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to}
      className="flex flex-col items-center justify-center flex-shrink-0 w-16 gap-0.5 transition-all relative">
      {active && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #5db53c, #3d9e20)' }} />
      )}
      <div className={`w-10 h-7 flex items-center justify-center rounded-xl transition-all
        ${active ? 'bg-lime-100' : ''}`}>
        <span className={`text-xl transition-all ${active ? 'scale-110' : 'opacity-50'}`}>{icon}</span>
      </div>
      <span className={`text-xs font-semibold transition-colors leading-none
        ${active ? 'text-lime-600' : 'text-gray-400'}`}>
        {label}
      </span>
    </Link>
  );
}
