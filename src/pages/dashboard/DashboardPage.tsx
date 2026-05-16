import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrchids } from '../../hooks/useOrchids';
import { useCosts } from '../../hooks/useCosts';
import { useSmartReminders } from '../../hooks/useSmartReminders';
import { useGarden } from '../../hooks/useGarden';

function formatVND(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M₫`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K₫`;
  return `${n}₫`;
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium opacity-70">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
          {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { orchids } = useOrchids();
  const { entries, profit } = useCosts();
  const reminders = useSmartReminders(orchids);
  const { zones } = useGarden();

  const healthCounts = useMemo(() => ({
    healthy: orchids.filter(o => o.healthStatus === 'healthy').length,
    warning: orchids.filter(o => o.healthStatus === 'warning').length,
    sick: orchids.filter(o => o.healthStatus === 'sick').length,
  }), [orchids]);

  const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthExpense = useMemo(() =>
    entries.filter(e => e.type === 'expense' && e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0),
    [entries, thisMonth]);
  const monthRevenue = useMemo(() =>
    entries.filter(e => e.type === 'revenue' && e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0),
    [entries, thisMonth]);

  const overdueCount = reminders.filter(r => r.daysOverdue > 0).length;
  const dueTodayCount = reminders.filter(r => r.daysOverdue === 0).length;

  const totalArea = useMemo(() => zones.reduce((s, z) => s + (z.area ?? 0), 0), [zones]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">📊 {t('dashboard.title')}</h1>
        <p className="text-sm text-gray-400">{t('dashboard.subtitle')}</p>
      </div>

      {/* Orchid stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🌺" label={t('dashboard.totalOrchids')} value={orchids.length} sub={zones.length > 0 ? t('dashboard.zones', { count: zones.length }) : undefined} color="bg-green-50 text-green-900" />
        <StatCard icon="⏰" label={t('dashboard.needsCare')} value={overdueCount + dueTodayCount}
          sub={overdueCount > 0 ? t('dashboard.overdueCount', { count: overdueCount }) : dueTodayCount > 0 ? t('dashboard.today') : t('dashboard.onSchedule')}
          color={overdueCount > 0 ? 'bg-orange-50 text-orange-900' : 'bg-blue-50 text-blue-900'} />
      </div>

      {/* Health breakdown */}
      {orchids.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 text-sm mb-3">🌿 {t('dashboard.healthStatus')}</h2>
          <div className="flex gap-2 mb-3">
            {([
              { key: 'healthy', label: t('dashboard.healthy'), color: 'bg-green-500', bg: 'bg-green-50 text-green-700' },
              { key: 'warning', label: t('dashboard.warning'),  color: 'bg-yellow-500', bg: 'bg-yellow-50 text-yellow-700' },
              { key: 'sick',    label: t('dashboard.sick'),  color: 'bg-red-500',   bg: 'bg-red-50 text-red-700' },
            ] as const).map(({ key, label, bg }) => {
              const count = healthCounts[key];
              if (count === 0) return null;
              return (
                <div key={key} className={`flex-1 rounded-xl px-3 py-2.5 text-center ${bg}`}>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs font-medium mt-0.5">{label}</p>
                </div>
              );
            })}
          </div>
          {/* Health bar */}
          <div className="flex rounded-full overflow-hidden h-2 gap-0.5">
            {healthCounts.healthy > 0 && (
              <div className="bg-green-500 transition-all" style={{ flex: healthCounts.healthy }} />
            )}
            {healthCounts.warning > 0 && (
              <div className="bg-yellow-500 transition-all" style={{ flex: healthCounts.warning }} />
            )}
            {healthCounts.sick > 0 && (
              <div className="bg-red-500 transition-all" style={{ flex: healthCounts.sick }} />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            {Math.round((healthCounts.healthy / orchids.length) * 100)}% {t('dashboard.healthyPercent')}
          </p>
        </div>
      )}

      {/* This month finance */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="font-bold text-gray-900 text-sm">💰 {t('dashboard.financeThisMonth')}</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-xs text-red-500 font-medium">{t('dashboard.expense')}</p>
            <p className="text-base font-bold text-red-700 mt-0.5">{formatVND(monthExpense)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xs text-green-500 font-medium">{t('dashboard.revenue')}</p>
            <p className="text-base font-bold text-green-700 mt-0.5">{formatVND(monthRevenue)}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${monthRevenue - monthExpense >= 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
            <p className={`text-xs font-medium ${monthRevenue - monthExpense >= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>{t('dashboard.profit')}</p>
            <p className={`text-base font-bold mt-0.5 ${monthRevenue - monthExpense >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
              {monthRevenue - monthExpense >= 0 ? '+' : ''}{formatVND(monthRevenue - monthExpense)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-50">
          <span>{t('dashboard.totalAccumulated')}</span>
          <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {profit >= 0 ? '+' : ''}{formatVND(profit)}
          </span>
        </div>
      </div>

      {/* Reminders list */}
      {reminders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          <h2 className="font-bold text-gray-900 text-sm">⏰ {t('dashboard.upcomingCare')}</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {reminders.map((r, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs
                ${r.daysOverdue > 0 ? 'bg-orange-50' : r.daysOverdue === 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span>{r.type === 'watering' ? '💧' : '🌱'}</span>
                  <span className="font-medium text-gray-800">{r.orchidName}</span>
                </div>
                <span className={`font-semibold ${r.daysOverdue > 0 ? 'text-orange-600' : r.daysOverdue === 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                  {r.daysOverdue > 0 ? t('dashboard.overdueDays', { days: r.daysOverdue }) : r.daysOverdue === 0 ? t('dashboard.today') : t('dashboard.daysLeft', { days: -r.daysOverdue })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Garden area summary */}
      {zones.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 text-sm mb-2">🗺️ {t('dashboard.gardenMap')}</h2>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">{t('dashboard.zonesDrawn', { count: zones.length })}</p>
              {totalArea > 0 && (
                <p className="text-sm font-semibold text-gray-800">
                  {t('dashboard.totalArea')}: {totalArea >= 10000 ? `${(totalArea / 10000).toFixed(2)} ha` : `${totalArea.toFixed(1)} m²`}
                </p>
              )}
            </div>
            <div className="flex gap-1.5">
              {zones.slice(0, 5).map(z => (
                <div key={z.id} className="w-4 h-4 rounded-sm" style={{ backgroundColor: z.color }} title={z.name} />
              ))}
            </div>
          </div>
        </div>
      )}

      {orchids.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <span className="text-5xl block mb-3">🌺</span>
          <p className="text-sm">{t('dashboard.addOrchidPrompt')}</p>
        </div>
      )}
    </div>
  );
}
