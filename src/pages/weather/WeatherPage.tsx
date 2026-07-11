import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchWeather, getWeatherIcon, getWeatherLabel } from '../../services/weatherService';
import { generateAdvice, DayAdvice, Severity } from '../../services/orchidAdvice';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

// Lấy tọa độ: native dùng plugin Capacitor (navigator.geolocation không chạy
// trong WebView); web fallback navigator. Ném lỗi nếu không lấy được.
async function getCoords(): Promise<{ lat: number; lng: number }> {
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
      const req = await Geolocation.requestPermissions();
      if (req.location !== 'granted' && req.coarseLocation !== 'granted') {
        throw new Error('permission denied');
      }
    }
    try {
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
      return { lat: p.coords.latitude, lng: p.coords.longitude };
    } catch {
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 });
      return { lat: p.coords.latitude, lng: p.coords.longitude };
    }
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('no geolocation')); return; }
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

type DayWeatherFull = {
  date: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rain: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
};

const DAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return { dow: DAY_VI[d.getDay()], day: d.getDate(), month: d.getMonth() + 1, dayIndex: d.getDay() };
}

function severityColor(s: Severity) {
  if (s === 'danger') return 'bg-red-50 border-red-200 text-red-700';
  if (s === 'warning') return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-green-50 border-green-200 text-green-700';
}

function severityBadge(s: Severity) {
  if (s === 'danger') return 'bg-red-100 text-red-600';
  if (s === 'warning') return 'bg-amber-100 text-amber-600';
  return 'bg-green-100 text-green-600';
}

function overallLabel(s: Severity, t: any) {
  if (s === 'danger') return `⚠️ ${t('weather.severity.danger')}`;
  if (s === 'warning') return `⚡ ${t('weather.severity.warning')}`;
  return `✅ ${t('weather.severity.good')}`;
}

function overallBg(s: Severity) {
  if (s === 'danger') return 'from-red-500 to-orange-400';
  if (s === 'warning') return 'from-amber-500 to-yellow-400';
  return 'from-green-500 to-emerald-400';
}

export default function WeatherPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<DayWeatherFull[]>([]);
  const [advices, setAdvices] = useState<DayAdvice[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const load = async (lat: number, lng: number) => {
      try {
        const forecast = await fetchWeather(lat, lng);
        setDays(forecast.days);
        setAdvices(generateAdvice(forecast.days));
      } catch {
        setError(t('weather.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    getCoords()
      .then(c => load(c.lat, c.lng))
      .catch(() => load(10.7769, 106.7009)); // fallback: TP.HCM nếu không lấy được vị trí
  }, [t]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{t('weather.loading')}</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 px-4">
      <span className="text-4xl">🌐</span>
      <p className="text-gray-600 text-center text-sm">{error}</p>
    </div>
  );

  const today = days[selectedIdx];
  const advice = advices[selectedIdx];
  if (!today || !advice) return null;
  const { day, month, dayIndex } = formatDate(today.date);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-2xl">🌤️</span>
        <div>
          <h1 className="font-bold text-gray-800 text-lg leading-tight">{t('weather.title')}</h1>
          <p className="text-gray-500 text-xs">{t('weather.subtitle')}</p>
        </div>
      </div>

      {/* Day selector strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {days.map((d, i) => {
          const { dow: dw, day: dy } = formatDate(d.date);
          const ov = advices[i]?.overall;
          const isActive = i === selectedIdx;
          return (
            <button
              key={d.date}
              onClick={() => setSelectedIdx(i)}
              className={`flex-shrink-0 flex flex-col items-center rounded-2xl px-3 py-2 border-2 transition-all ${
                isActive
                  ? 'bg-green-600 border-green-600 text-white shadow-md'
                  : 'bg-white border-gray-100 text-gray-600'
              }`}
            >
              <span className={`text-xs font-medium ${isActive ? 'text-green-100' : 'text-gray-400'}`}>{i === 0 ? t('weather.today') : dw}</span>
              <span className="text-lg">{getWeatherIcon(d.weatherCode)}</span>
              <span className="text-sm font-bold">{dy}</span>
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                ov === 'danger' ? 'bg-red-400' : ov === 'warning' ? 'bg-amber-400' : isActive ? 'bg-green-300' : 'bg-green-400'
              }`} />
            </button>
          );
        })}
      </div>

      {/* Main weather card */}
      <div className={`bg-gradient-to-br ${overallBg(advice.overall)} rounded-3xl p-4 text-white shadow-lg`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/80 text-sm font-medium">{dayIndex === 0 ? t('weather.days.sunday') : `${t('weather.dayPrefix')} ${dayIndex + 1}`} — {day}/{month}</p>
            <p className="text-5xl font-bold mt-1">{today.tempMax}°</p>
            <p className="text-white/80 text-sm">{t('weather.tempMin', { temp: today.tempMin })}</p>
          </div>
          <div className="text-right">
            <span className="text-5xl">{getWeatherIcon(today.weatherCode)}</span>
            <p className="text-white/90 text-sm mt-1 font-medium">{getWeatherLabel(today.weatherCode)}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4 bg-white/20 rounded-2xl p-3">
          <Stat icon="💧" label={t('weather.stats.rain')} value={`${today.rain}mm`} />
          <Stat icon="🌊" label={t('weather.stats.humidity')} value={`${today.humidity}%`} />
          <Stat icon="💨" label={t('weather.stats.wind')} value={`${today.windSpeed}km/h`} />
          <Stat icon="☀️" label={t('weather.stats.uv')} value={`${today.uvIndex}`} />
        </div>

        <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 text-sm font-medium">
          {overallLabel(advice.overall, t)}
        </div>
      </div>

      {/* Care advice cards */}
      <div>
        <h2 className="font-semibold text-gray-700 text-sm mb-2">{t('weather.careAdvice')}</h2>
        <div className="space-y-2">
          {advice.advices.map((a, i) => (
            <div key={i} className={`border rounded-2xl p-3 ${severityColor(a.severity)}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{a.icon}</span>
                <span className="font-semibold text-sm flex-1">{a.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge(a.severity)}`}>
                  {a.category}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{a.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fertilizer plan */}
      {advice.fertilizer && (
        <div>
          <h2 className="font-semibold text-gray-700 text-sm mb-2">🌿 {t('weather.fertilizerPlan')}</h2>
          {advice.fertilizer.shouldFertilize ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span className="font-semibold text-emerald-700 text-sm">{t('weather.fertilizer.shouldApply')}</span>
              </div>
              <Row label={t('weather.fertilizer.type')} value={advice.fertilizer.type} />
              <Row label={t('weather.fertilizer.ratio')} value={advice.fertilizer.ratio} highlight />
              <Row label={t('weather.fertilizer.dose')} value={advice.fertilizer.dose} />
              <Row label={t('weather.fertilizer.timing')} value={advice.fertilizer.timing} />
              <div className="bg-emerald-100 rounded-xl px-3 py-2 mt-1">
                <p className="text-xs text-emerald-700 leading-relaxed">💡 {advice.fertilizer.reason}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⏭️</span>
                <span className="font-semibold text-gray-600 text-sm">{t('weather.fertilizer.skip')}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{advice.fertilizer.reason}</p>
            </div>
          )}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base">{icon}</span>
      <span className="text-white font-bold text-xs">{value}</span>
      <span className="text-white/70 text-xs">{label}</span>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-emerald-700 text-sm' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}
