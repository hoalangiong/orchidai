import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRuView, RuViewReading, RuViewEvent } from '../../hooks/useRuView';
import { useAuth } from '../../contexts/AuthContext';
import PoseViewer3D from '../../components/PoseViewer3D';

function UidCard({ uid, t }: { uid: string; t: any }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(uid).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4">
      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">
        📋 {t('security.uid.title')}
      </p>
      <p className="text-xs text-indigo-600 mb-3">{t('security.uid.description')}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-sm font-bold text-indigo-900 bg-white rounded-xl px-3 py-2 border border-indigo-100 break-all select-all">
          {uid}
        </code>
        <button
          onClick={copy}
          className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white active:scale-95'}`}
        >
          {copied ? '✓' : t('security.uid.copy')}
        </button>
      </div>
      <p className="text-xs text-indigo-400 mt-2">{t('security.uid.hint')}</p>
    </div>
  );
}

function timeAgo(ts: number, t: any): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return t('security.time.secondsAgo', { count: diff });
  if (diff < 3600) return t('security.time.minutesAgo', { count: Math.floor(diff / 60) });
  if (diff < 86400) return t('security.time.hoursAgo', { count: Math.floor(diff / 3600) });
  return t('security.time.daysAgo', { count: Math.floor(diff / 86400) });
}

function PresenceCard({ latest, t }: { latest: RuViewReading; t: any }) {
  const present = latest.presence;
  const count = latest.personCount ?? (present ? 1 : 0);
  return (
    <div className={`rounded-2xl p-5 ${present ? 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${present ? 'bg-orange-100' : 'bg-green-100'}`}>
          {present ? '👤' : '🌿'}
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{t('security.presence.label')}</p>
          <p className={`text-2xl font-bold mt-0.5 ${present ? 'text-orange-700' : 'text-green-700'}`}>
            {present ? t('security.presence.detected') : t('security.presence.empty')}
          </p>
          {present && count > 1 && (
            <p className="text-xs text-orange-500 font-semibold mt-0.5">{t('security.presence.count', { count })}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{timeAgo(latest.ts, t)}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${present ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
      </div>
    </div>
  );
}

function VitalCard({ icon, label, value, unit, status, disclaimer, noDataText }: {
  icon: string;
  label: string;
  value: number | null;
  unit: string;
  status: 'good' | 'warning' | 'danger' | 'idle';
  disclaimer?: string;
  noDataText: string;
}) {
  const colors = {
    good:    { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-700' },
    warning: { bg: 'bg-yellow-50',  border: 'border-yellow-100',  text: 'text-yellow-700' },
    danger:  { bg: 'bg-red-50',     border: 'border-red-100',     text: 'text-red-700' },
    idle:    { bg: 'bg-gray-50',    border: 'border-gray-100',    text: 'text-gray-400' },
  };
  const c = colors[status];
  return (
    <div className={`rounded-2xl border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          {value !== null ? (
            <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>
              {value}
              <span className="text-sm font-medium ml-1 opacity-70">{unit}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1.5">{noDataText}</p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      {disclaimer && <p className="text-xs text-gray-400 mt-1.5">{disclaimer}</p>}
    </div>
  );
}

function FallAlert({ latest, t }: { latest: RuViewReading; t: any }) {
  if (!latest.fallDetected) return null;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white p-4 shadow-lg animate-pulse">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🚨</span>
        <div className="flex-1">
          <p className="font-bold text-base">{t('security.fall.title')}</p>
          <p className="text-xs opacity-90 mt-0.5">{t('security.fall.description', { time: timeAgo(latest.ts, t) })}</p>
        </div>
      </div>
    </div>
  );
}

function ZonesCard({ latest, t }: { latest: RuViewReading; t: any }) {
  const defaultZones = [
    { id: 'z1', name: t('security.zones.zone1'), occupied: latest.presence },
    { id: 'z2', name: t('security.zones.zone2'), occupied: false },
    { id: 'z3', name: t('security.zones.zone3'), occupied: false },
  ];
  const zones = latest.zones ?? defaultZones;
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t('security.zones.title')}</p>
      <div className="grid grid-cols-3 gap-2">
        {zones.map(z => (
          <div key={z.id} className={`rounded-xl p-3 text-center border ${z.occupied ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center text-base ${z.occupied ? 'bg-orange-100' : 'bg-gray-100'}`}>
              {z.occupied ? '👤' : '○'}
            </div>
            <p className="text-xs font-semibold text-gray-700 leading-tight">{z.name}</p>
            <p className={`text-xs mt-0.5 font-medium ${z.occupied ? 'text-orange-500' : 'text-gray-400'}`}>
              {z.occupied ? t('security.zones.occupied') : t('security.zones.empty')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DopplerCard({ latest, t }: { latest: RuViewReading; t: any }) {
  const bars = useMemo(() => latest.doppler ?? Array.from({ length: 16 }, () => {
    if (!latest.presence) return 0.05 + Math.random() * 0.05;
    const activity = latest.activity ?? 'standing';
    const base = activity === 'running' ? 0.6 : activity === 'walking' ? 0.35 : 0.15;
    return Math.max(0.05, base + (Math.random() - 0.5) * 0.2);
  }), [latest.doppler, latest.presence, latest.activity]);

  const maxVal = Math.max(...bars);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('security.doppler.title')}</p>
        {latest.activity && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
            {latest.activity.toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex items-end gap-1 h-16">
        {bars.map((v, i) => {
          const h = Math.max(4, Math.round((v / Math.max(maxVal, 0.01)) * 56));
          const color = v > 0.6 ? 'bg-red-400' : v > 0.35 ? 'bg-yellow-400' : 'bg-blue-400';
          return (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div className={`rounded-sm ${color} opacity-80`} style={{ height: h }} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{t('security.doppler.still')}</span>
        <span className="text-xs text-gray-400">{t('security.doppler.fast')}</span>
      </div>
    </div>
  );
}

function HeatmapCard({ latest, t }: { latest: RuViewReading; t: any }) {
  const COLS = 20;
  const ROWS = 15;
  const cells = useMemo(() => latest.heatmap ?? Array.from({ length: COLS * ROWS }, (_, i) => {
    if (!latest.presence) return 0;
    const cx = 10, cy = 7;
    const col = i % COLS, row = Math.floor(i / COLS);
    const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
    return Math.max(0, 1 - dist / 8) * (0.7 + Math.random() * 0.3);
  }), [latest.heatmap, latest.presence]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t('security.heatmap.title')}</p>
      <div className="relative rounded-xl overflow-hidden bg-gray-900" style={{ aspectRatio: `${COLS}/${ROWS}` }}>
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
        >
          {cells.map((v, i) => {
            const alpha = Math.min(1, v);
            const r = Math.round(255 * Math.min(1, v * 2));
            const g = Math.round(100 * (1 - v));
            const b = Math.round(200 * (1 - v));
            return (
              <div
                key={i}
                style={{ background: `rgba(${r},${g},${b},${alpha * 0.85})` }}
              />
            );
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-white/30 font-mono">{t('security.heatmap.label')}</span>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">{t('security.heatmap.low')}</span>
        <div className="flex gap-0.5 items-center">
          {[0.1,0.3,0.5,0.7,0.9].map(v => (
            <div key={v} className="w-4 h-2 rounded-sm" style={{ background: `rgba(${Math.round(255*Math.min(1,v*2))},${Math.round(100*(1-v))},${Math.round(200*(1-v))},0.85)` }} />
          ))}
        </div>
        <span className="text-xs text-gray-400">{t('security.heatmap.high')}</span>
      </div>
    </div>
  );
}

function SleepCard({ latest, t }: { latest: RuViewReading; t: any }) {
  const sleep = latest.sleep;
  if (!sleep) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('security.sleep.title')}</p>
        <p className="text-sm text-gray-400">{t('security.sleep.noData')}</p>
      </div>
    );
  }

  const qualityColor = sleep.sleepQuality === 'good' ? 'text-green-600' : sleep.sleepQuality === 'fair' ? 'text-yellow-600' : 'text-red-600';
  const qualityBg = sleep.sleepQuality === 'good' ? 'bg-green-50' : sleep.sleepQuality === 'fair' ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <div className={`rounded-2xl p-4 border ${sleep.sleeping ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('security.sleep.title')}</p>
        <span className="text-xl">{sleep.sleeping ? '😴' : '🌙'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className={`text-lg font-bold ${sleep.sleeping ? 'text-indigo-700' : 'text-gray-400'}`}>
            {sleep.sleeping ? t('security.sleep.sleeping') : t('security.sleep.awake')}
          </p>
          <p className="text-xs text-gray-400">{t('security.sleep.status')}</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${sleep.apneaDetected ? 'text-red-600' : 'text-green-600'}`}>
            {sleep.apneaDetected ? '⚠️' : '✓'}
          </p>
          <p className="text-xs text-gray-400">{t('security.sleep.apnea')}</p>
          {sleep.apneaCount > 0 && <p className="text-xs text-red-500 font-semibold">{sleep.apneaCount}x</p>}
        </div>
        <div className="text-center">
          {sleep.sleepQuality ? (
            <p className={`text-sm font-bold ${qualityColor} ${qualityBg} rounded-lg px-1 py-0.5`}>
              {t(`security.sleep.quality.${sleep.sleepQuality}`)}
            </p>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{t('security.sleep.quality.label')}</p>
        </div>
      </div>
    </div>
  );
}

function EventTimeline({ events, t }: { events: RuViewEvent[]; t: any }) {
  const last24h = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return events.filter(e => e.ts >= cutoff);
  }, [events]);

  if (last24h.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
        <span className="text-3xl block mb-2">📋</span>
        <p className="text-sm text-gray-400">{t('security.timeline.empty')}</p>
      </div>
    );
  }

  const eventStyle = {
    enter: { icon: '🚪', label: t('security.events.enter'), color: 'text-orange-600 bg-orange-50' },
    leave: { icon: '👋', label: t('security.events.leave'), color: 'text-blue-600 bg-blue-50' },
    fall:  { icon: '🚨', label: t('security.events.fall'),  color: 'text-red-600 bg-red-50' },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">{t('security.timeline.title', { count: last24h.length })}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{t('security.timeline.subtitle')}</p>
      </div>
      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
        {last24h.map((evt, i) => {
          const s = eventStyle[evt.type] ?? eventStyle.enter;
          return (
            <div key={`${evt.ts}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${s.color}`}>
                {s.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-400">{new Date(evt.ts).toLocaleTimeString('vi-VN')} · {timeAgo(evt.ts, t)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const { t } = useTranslation();
  const { latest, events, connected } = useRuView();
  const { user } = useAuth();

  const breathingStatus: 'good' | 'warning' | 'danger' | 'idle' = !latest?.presence
    ? 'idle'
    : latest.breathingRate === null
    ? 'idle'
    : latest.breathingRate < 8 || latest.breathingRate > 25
    ? 'danger'
    : latest.breathingRate < 12 || latest.breathingRate > 20
    ? 'warning'
    : 'good';

  const heartStatus: 'good' | 'warning' | 'danger' | 'idle' = !latest?.presence
    ? 'idle'
    : latest.heartRate === null
    ? 'idle'
    : latest.heartRate < 50 || latest.heartRate > 110
    ? 'danger'
    : latest.heartRate < 60 || latest.heartRate > 100
    ? 'warning'
    : 'good';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('security.title')}</h1>
          <p className="text-sm text-gray-400">{t('security.subtitle')}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {connected ? t('security.connected') : t('security.notConnected')}
        </span>
      </div>

      {!latest ? (
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="text-center py-4">
            <span className="text-5xl block mb-3">📡</span>
            <h3 className="font-bold text-gray-800 mb-1">{t('security.noDataTitle')}</h3>
            <p className="text-sm text-gray-400">{t('security.noDataDescription')}</p>
          </div>

          {user?.uid && <UidCard uid={user.uid} t={t} />}

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{t('security.firebasePath')}</p>
            <code className="block text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 break-all">
              sensors/{user?.uid}/ruview/latest
            </code>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{t('security.jsonStructure')}</p>
            <pre className="text-xs text-gray-600 overflow-x-auto">{`{
  "presence": true,
  "personCount": 1,
  "breathingRate": 16,
  "heartRate": 72,
  "fallDetected": false,
  "signalQuality": 85,
  "activity": "standing",
  "zones": [
    {"id":"z1","name":"Cổng vào","occupied":true},
    {"id":"z2","name":"Khu trồng","occupied":false},
    {"id":"z3","name":"Kho","occupied":false}
  ],
  "doppler": [0.1,0.1,0.2,0.3,0.5,0.4,0.3,0.2,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1],
  "sleep": {
    "sleeping": false,
    "apneaDetected": false,
    "apneaCount": 0,
    "sleepQuality": null
  },
  "ts": 1715000000000
}`}</pre>
          </div>

          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-700 mb-1">{t('security.hardwareTitle')}</p>
            <ul className="text-xs text-blue-600 space-y-0.5">
              <li>• {t('security.hardware.esp32s3')}</li>
              <li>• {t('security.hardware.ruview')}</li>
              <li>• {t('security.hardware.wifi')}</li>
              <li>• {t('security.hardware.power')}</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="text-xs font-bold text-yellow-800 mb-1">⚠️ {t('security.disclaimer.title')}</p>
            <p className="text-xs text-yellow-700 leading-relaxed">{t('security.disclaimer.body')}</p>
          </div>
        </div>
      ) : (
        <>
          <FallAlert latest={latest} t={t} />

          {/* 3D Pose Viewer */}
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ height: 280, background: '#050a14' }}>
            <PoseViewer3D presence={latest.presence} />
          </div>

          <PresenceCard latest={latest} t={t} />

          {/* Zones */}
          <ZonesCard latest={latest} t={t} />

          {/* Vitals */}
          <div className="grid grid-cols-2 gap-3">
            <VitalCard
              icon="🫁"
              label={t('security.vitals.breathing')}
              value={latest.presence ? latest.breathingRate : null}
              unit={t('security.vitals.breathingUnit')}
              status={breathingStatus}
              noDataText={latest.presence ? t('security.vitals.measuring') : t('security.vitals.idle')}
            />
            <VitalCard
              icon="❤️"
              label={t('security.vitals.heart')}
              value={latest.presence ? latest.heartRate : null}
              unit={t('security.vitals.heartUnit')}
              status={heartStatus}
              disclaimer={t('security.vitals.heartDisclaimer')}
              noDataText={latest.presence ? t('security.vitals.measuring') : t('security.vitals.idle')}
            />
          </div>

          {/* Doppler Spectrum */}
          <DopplerCard latest={latest} t={t} />

          {/* Confidence Heatmap */}
          <HeatmapCard latest={latest} t={t} />

          {/* Sleep Monitoring */}
          <SleepCard latest={latest} t={t} />

          {/* Signal Quality */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{t('security.signal.label')}</span>
              <span className="font-semibold text-gray-700">{latest.signalQuality}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all ${latest.signalQuality > 70 ? 'bg-green-500' : latest.signalQuality > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${latest.signalQuality}%` }}
              />
            </div>
          </div>

          <EventTimeline events={events} t={t} />

          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-3">
            <p className="text-xs font-bold text-yellow-800 mb-1">⚠️ {t('security.disclaimer.title')}</p>
            <p className="text-xs text-yellow-700 leading-relaxed">{t('security.disclaimer.body')}</p>
          </div>
        </>
      )}
    </div>
  );
}
