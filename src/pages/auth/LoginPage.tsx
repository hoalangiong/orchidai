import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

function isZaloBrowser() {
  return /ZaloApp|zalo/i.test(navigator.userAgent);
}

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const { t, i18n } = useTranslation();
  const isZalo = isZaloBrowser();

  const openInBrowser = () => { window.open(window.location.href, '_blank'); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e8f8e0 0%, #c8edb8 40%, #a8dc98 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #5db53c, transparent)' }} />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #3d9e20, transparent)' }} />
      <div className="absolute top-1/3 left-4 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #8dcc6c, transparent)' }} />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      {/* Logo */}
      <div className="relative mb-6 text-center">
        <div className="w-24 h-24 rounded-3xl shadow-xl mx-auto flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #5db53c, #2d7d18)' }}>
          <span className="text-5xl">🌿</span>
        </div>
        <h1 className="text-3xl font-extrabold text-green-900 tracking-tight">{t('app.name')}</h1>
        <p className="text-green-600 text-sm mt-1 font-medium">{t('app.description')}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-xs rounded-3xl p-6 space-y-5"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(45,125,24,0.18)' }}>

        <div className="text-center">
          <h2 className="font-bold text-gray-800 text-lg">{t('auth.welcome')}</h2>
          <p className="text-gray-400 text-sm mt-1">{t('auth.loginDescription')}</p>
        </div>

        {isZalo ? (
          <div className="space-y-3">
            <div className="rounded-2xl p-3 text-center border"
              style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <p className="text-sm font-medium" style={{ color: '#92400e' }}>{t('auth.zaloWarning')}</p>
              <p className="text-xs mt-1" style={{ color: '#b45309' }}>{t('auth.zaloInstruction')}</p>
            </div>
            <button onClick={openInBrowser}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-semibold text-white active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #5db53c, #2d7d18)' }}>
              🌐 {t('auth.openInBrowser')}
            </button>
          </div>
        ) : (
          <button onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-semibold text-gray-700 border-2 transition-all active:scale-95 hover:shadow-md"
            style={{ borderColor: '#d4f0c8', background: '#f9fef7' }}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            {t('auth.signInWithGoogle')}
          </button>
        )}

        <p className="text-center text-xs text-gray-400">
          🔒 {t('auth.dataSecure')}
        </p>
      </div>

      <a href="https://www.tiktok.com/@hoalangiong7" target="_blank" rel="noopener noreferrer"
        className="mt-8 text-xs text-green-600 hover:text-green-800 transition-colors font-medium">
        Developed by hoalangiong.com
      </a>
      <a href="https://hoalangiong.tino.page/pp.html" target="_blank" rel="noopener noreferrer"
        className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        {i18n.language === 'vi' ? 'Chính sách Bảo mật' : 'Privacy Policy'}
      </a>
    </div>
  );
}
