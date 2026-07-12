import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrchids } from '../../hooks/useOrchids';
import { useCare } from '../../hooks/useCare';
import { useNotifications } from '../../hooks/useNotifications';
import { useSmartReminders } from '../../hooks/useSmartReminders';
import NotificationBanner from '../../components/NotificationBanner';
import { CROP_LIST, useActiveCrop } from '../../crops';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function HomePage() {
  const { orchids } = useOrchids();
  const { todayTasks } = useCare();
  useNotifications(todayTasks, orchids);
  const reminders = useSmartReminders(orchids);
  const needsAttention = orchids.filter(o => o.healthStatus !== 'healthy').length;
  const { t, i18n } = useTranslation();
  const crop = useActiveCrop();
  const { updateActiveCrop } = useUserProfile();

  const today = new Date().toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'id' ? 'id-ID' : i18n.language === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  const overdueReminders = reminders.filter(r => r.daysOverdue >= 0);

  return (
    <div className="space-y-4">
      <NotificationBanner />

      {/* Chọn loại cây trồng */}
      {CROP_LIST.length > 1 && (
        <div className="flex gap-2">
          {CROP_LIST.map(c => (
            <button
              key={c.id}
              onClick={() => { if (c.id !== crop.id) updateActiveCrop(c.id); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                c.id === crop.id
                  ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              <span>{c.emoji}</span> {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #5db53c 0%, #3d9e20 55%, #2d7d18 100%)', minHeight: 140 }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute right-6 bottom-0 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="relative p-5">
          <p className="text-lime-200 text-xs font-semibold uppercase tracking-widest">{today}</p>
          <h2 className="text-2xl font-extrabold text-white mt-1 leading-tight">Vườn {crop.name} của bạn</h2>
          <p className="text-lime-100 text-sm mt-1">
            {orchids.length === 0 ? t('home.getStarted') : `${orchids.length} cây đang được chăm sóc ${crop.emoji}`}
          </p>
          {overdueReminders.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,165,0,0.3)', color: '#fff' }}>
              ⏰ {t('home.needsCareToday', { count: overdueReminders.length })}
            </div>
          )}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-70 select-none">{crop.emoji}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🌺" value={orchids.length}   label={t('home.totalOrchids')}  accent="#5db53c" light="#f0fae8" />
        <StatCard icon="⚠️" value={needsAttention}   label={t('home.needsAttention')}   accent="#f59e0b" light="#fffbeb" />
        <StatCard icon="⏰" value={overdueReminders.filter(r => r.daysOverdue > 0).length} label={t('home.overdueCare')} accent="#ef4444" light="#fef2f2" />
        <StatCard icon="📅" value={overdueReminders.filter(r => r.daysOverdue === 0).length} label={t('home.dueToday')} accent="#3b82f6" light="#eff6ff" />
      </div>

      {/* Reminders list */}
      {overdueReminders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t('home.careSchedule')}</h3>
          {overdueReminders.slice(0, 5).map((r, i) => (
            <Link to="/orchids" key={i}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors
                ${r.daysOverdue > 0 ? 'bg-red-50' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{r.type === 'watering' ? '💧' : '🌱'}</span>
                <div>
                  <p className="font-semibold text-gray-800">{r.orchidName}</p>
                  <p className="text-gray-400">{r.type === 'watering' ? t('home.watering') : t('home.fertilizing')}</p>
                </div>
              </div>
              <span className={`font-bold ${r.daysOverdue > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {r.daysOverdue === 0 ? t('home.today') : t('home.overdueDays', { days: r.daysOverdue })}
              </span>
            </Link>
          ))}
          {overdueReminders.length > 5 && (
            <Link to="/orchids" className="block text-center text-xs text-green-600 font-semibold pt-1">
              {t('home.viewMore', { count: overdueReminders.length - 5 })} →
            </Link>
          )}
        </div>
      )}

      {/* AI Features Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{t('home.aiFeatures.title')}</h3>
              <p className="text-purple-100 text-xs">{t('home.aiFeatures.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <AIFeature icon="🔬" text={t('home.aiFeatures.diagnosis')} />
            <AIFeature icon="🌤️" text={t('home.aiFeatures.weather')} />
            <AIFeature icon="💊" text={t('home.aiFeatures.treatment')} />
            <AIFeature icon="📊" text={t('home.aiFeatures.insights')} />
          </div>

          <Link to="/diseases"
            className="block w-full bg-white text-purple-600 font-bold text-center py-3 rounded-xl shadow-lg active:scale-95 transition-transform">
            {t('home.aiFeatures.tryNow')} →
          </Link>
        </div>
      </div>

      {/* Security & Health Banner */}
      <Link to="/security" className="block relative rounded-3xl overflow-hidden shadow-xl active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🛡️</span>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">{t('home.securityFeatures.title')}</h3>
              <p className="text-blue-200 text-xs">{t('home.securityFeatures.subtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SecurityFeature icon="👤" text={t('home.securityFeatures.presence')} />
            <SecurityFeature icon="🫁" text={t('home.securityFeatures.breathing')} />
            <SecurityFeature icon="❤️" text={t('home.securityFeatures.heart')} />
            <SecurityFeature icon="🚨" text={t('home.securityFeatures.fall')} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-blue-200 text-xs">{t('home.securityFeatures.powered')}</p>
            <span className="text-white text-xs font-bold">{t('home.securityFeatures.explore')} →</span>
          </div>
        </div>
      </Link>

      {/* Quick actions */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('home.quickActions')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/orchids"   icon="➕" label={t('home.addNew')}  gradient="linear-gradient(135deg,#5db53c,#3d9e20)" />
          <QuickAction to="/dashboard" icon="📊" label={t('nav.dashboard')}     gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" />
          <QuickAction to="/calendar"  icon="📅" label={t('home.careCalendar')} gradient="linear-gradient(135deg,#3b82f6,#2563eb)" />
          <QuickAction to="/diseases"  icon="🔬" label={t('home.diseaseReference')}  gradient="linear-gradient(135deg,#ef4444,#dc2626)" />
        </div>
      </div>

      {/* Recent orchids */}
      {orchids.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('home.recentOrchids')}</h3>
            <Link to="/orchids" className="text-sm text-lime-600 font-semibold">{t('common.viewAll')} →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {orchids.slice(0, 6).map(o => (
              <Link to="/orchids" key={o.id} className="shrink-0 bg-white rounded-2xl shadow-sm w-28 overflow-hidden border border-lime-50">
                <div className="h-20 bg-gradient-to-br from-lime-50 to-green-100 flex items-center justify-center">
                  {o.imageUrl
                    ? <img src={o.imageUrl} className="w-full h-full object-cover" alt={o.name} />
                    : <span className="text-4xl">🌺</span>
                  }
                </div>
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-800 truncate">{o.name}</p>
                  <p className="text-xs text-gray-400 truncate">{o.species.split(' ')[0]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityFeature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
      <span className="text-base">{icon}</span>
      <span className="text-white text-xs font-medium">{text}</span>
    </div>
  );
}

function AIFeature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
      <span className="text-lg">{icon}</span>
      <span className="text-white text-sm font-medium">{text}</span>
    </div>
  );
}

function StatCard({ icon, value, label, accent, light }: {
  icon: string; value: number; label: string; accent: string; light: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-lime-50 flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: light }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold" style={{ color: accent }}>{value}</div>
        <div className="text-xs text-gray-400 leading-tight">{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, label, gradient }: { to: string; icon: string; label: string; gradient: string }) {
  return (
    <Link to={to}
      className="bg-white rounded-2xl shadow-sm p-3.5 flex items-center gap-3 border border-lime-50 active:scale-95 transition-transform">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: gradient }}>
        <span>{icon}</span>
      </div>
      <span className="text-sm font-semibold text-gray-700 leading-tight">{label}</span>
    </Link>
  );
}
