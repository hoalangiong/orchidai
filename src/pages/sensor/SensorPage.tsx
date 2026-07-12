import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSensor, SensorReading } from '../../hooks/useSensor';
import { useOrchids } from '../../hooks/useOrchids';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveCrop } from '../../crops';
import type { CropConfig } from '../../crops';
import { useUserProfile } from '../../hooks/useUserProfile';

type MetricKey = keyof Omit<SensorReading, 'ts'>;
type Thresholds = Record<MetricKey, [number, number, number, number]>;

type Status = 'good' | 'warning' | 'danger';

function getStatus(value: number, key: MetricKey, thresholds: Thresholds): Status {
  const [min, max, warnMin, warnMax] = thresholds[key];
  if (value < warnMin || value > warnMax) return 'danger';
  if (value < min || value > max) return 'warning';
  return 'good';
}

const STATUS_COLOR: Record<Status, { bar: string; text: string; bg: string; border: string }> = {
  good:    { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-100' },
  warning: { bar: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  danger:  { bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-100' },
};

interface MetricConfig {
  key: keyof Omit<SensorReading, 'ts'>;
  label: string;
  icon: string;
  unit: string;
  max: number;
}

function getMetrics(t: any): MetricConfig[] {
  return [
    { key: 'temp',     label: t('sensor.metrics.temp'),     icon: '🌡️', unit: '°C',    max: 50 },
    { key: 'humidity', label: t('sensor.metrics.humidity'), icon: '💧', unit: '%',     max: 100 },
    { key: 'moisture', label: t('sensor.metrics.moisture'), icon: '🪱', unit: '%',     max: 100 },
    { key: 'ph',       label: t('sensor.metrics.ph'),       icon: '🧪', unit: '',      max: 14 },
    { key: 'ec',       label: t('sensor.metrics.ec'),       icon: '⚡', unit: 'mS/cm', max: 5 },
    { key: 'n',        label: t('sensor.metrics.n'),        icon: '🌿', unit: 'mg/kg', max: 100 },
    { key: 'p',        label: t('sensor.metrics.p'),        icon: '🌿', unit: 'mg/kg', max: 100 },
    { key: 'k',        label: t('sensor.metrics.k'),        icon: '🌿', unit: 'mg/kg', max: 100 },
  ];
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  return `${Math.floor(diff / 3600)} giờ trước`;
}

function Sparkline({ data, width = 200, height = 48, noDataText }: { data: number[]; width?: number; height?: number; noDataText: string }) {
  if (data.length < 2) return <div className="h-12 flex items-center justify-center text-xs text-gray-300">{noDataText}</div>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${height} ${pts} ${width},${height}`} fill="rgba(34,197,94,0.1)" stroke="none" />
    </svg>
  );
}

function MetricCard({ metric, value, t, thresholds }: { metric: MetricConfig; value: number; t: any; thresholds: Thresholds }) {
  const status = getStatus(value, metric.key, thresholds);
  const sc = STATUS_COLOR[status];
  const pct = Math.min(100, Math.max(0, (value / metric.max) * 100));
  const displayVal = metric.key === 'ph' || metric.key === 'ec' ? value.toFixed(1) : Math.round(value);

  return (
    <div className={`rounded-2xl border p-4 ${sc.bg} ${sc.border}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-gray-500 font-medium">{metric.label}</p>
          <p className={`text-2xl font-bold mt-0.5 ${sc.text}`}>
            {displayVal}
            <span className="text-sm font-medium ml-1 opacity-70">{metric.unit}</span>
          </p>
        </div>
        <span className="text-2xl">{metric.icon}</span>
      </div>
      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${sc.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs mt-1.5 opacity-60">
        {status === 'good' ? t('sensor.status.good') : status === 'warning' ? t('sensor.status.warning') : t('sensor.status.danger')}
        {' · '}{t('sensor.threshold')} {thresholds[metric.key][0]}–{thresholds[metric.key][1]} {metric.unit}
      </p>
    </div>
  );
}

// ─── AI Advisor ─────────────────────────────────────────────────────────────

interface AiAdvisorProps {
  latest: SensorReading;
  orchidCount: number;
  healthBreakdown: { good: number; warning: number; danger: number };
  t: any;
  metrics: MetricConfig[];
  crop: CropConfig;
  thresholds: Thresholds;
  stageName?: string;
  stageNote?: string;
}

function AiAdvisor({ latest, orchidCount, healthBreakdown, t, metrics, crop, thresholds, stageName, stageNote }: AiAdvisorProps) {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const sensorSummary = metrics.map(m => {
    const val = latest[m.key] as number;
    const status = getStatus(val, m.key, thresholds);
    const displayVal = m.key === 'ph' || m.key === 'ec' ? val.toFixed(1) : Math.round(val);
    const statusVi = status === 'good' ? 'bình thường' : status === 'warning' ? 'cần chú ý' : 'cảnh báo';
    return `- ${m.label}: ${displayVal}${m.unit} (${statusVi}, ngưỡng tốt: ${thresholds[m.key][0]}–${thresholds[m.key][1]}${m.unit})`;
  }).join('\n');

  const prompt = crop.buildAdvisorPrompt({
    sensorSummary,
    measuredAt: new Date(latest.ts).toLocaleString('vi-VN'),
    plantCount: orchidCount,
    healthBreakdown,
    stageName,
    stageNote,
  });

  async function analyze() {
    if (loading) {
      abortRef.current?.abort();
      setLoading(false);
      return;
    }
    setLoading(true);
    setAdvice('');
    setError('');
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          stream: true,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API lỗi ${res.status}: ${text}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const json = JSON.parse(data);
            const delta = json.delta?.text ?? json.choices?.[0]?.delta?.content ?? '';
            if (delta) setAdvice(prev => prev + delta);
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || t('sensor.aiError'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            🤖 {t('sensor.aiTitle')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{t('sensor.aiSubtitle')}</p>
        </div>
        <button
          onClick={analyze}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            loading
              ? 'bg-red-100 text-red-600'
              : 'bg-green-500 text-white shadow-sm'
          }`}
        >
          {loading ? `⏹ ${t('sensor.aiStop')}` : advice ? `🔄 ${t('sensor.aiReanalyze')}` : `✨ ${t('sensor.aiAnalyze')}`}
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {error && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl text-xs text-red-600">{error}</div>
        )}

        {!advice && !loading && !error && (
          <p className="mt-3 text-xs text-gray-400 text-center py-3">
            {t('sensor.aiPrompt')}
          </p>
        )}

        {loading && !advice && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 py-3">
            <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            {t('sensor.aiAnalyzing')}
          </div>
        )}

        {advice && (
          <div className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {advice}
            {loading && <span className="inline-block w-1.5 h-4 bg-green-400 animate-pulse ml-0.5 rounded-sm" />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SensorPage() {
  const { t } = useTranslation();
  const { latest, history, connected } = useSensor();
  const { orchids } = useOrchids();
  const { user } = useAuth();
  const crop = useActiveCrop();
  const { profile, updateActiveStage } = useUserProfile();
  // Giai đoạn đang chọn (chỉ cây có stages). Nếu chưa chọn, lấy giai đoạn đầu.
  const stages = crop.stages;
  const activeStage = stages
    ? (stages.find(s => s.id === profile?.activeStage) ?? stages[0])
    : undefined;
  const thresholds = (activeStage?.thresholds ?? crop.thresholds) as Thresholds;
  const [chartKey, setChartKey] = useState<keyof Omit<SensorReading, 'ts'>>('temp');

  const METRICS = getMetrics(t);

  const chartData = useMemo(() => history.map(h => h[chartKey] as number), [history, chartKey]);
  const chartMetric = METRICS.find(m => m.key === chartKey)!;

  const alertCount = latest
    ? METRICS.filter(m => getStatus(latest[m.key] as number, m.key, thresholds) === 'danger').length
    : 0;
  const warnCount = latest
    ? METRICS.filter(m => getStatus(latest[m.key] as number, m.key, thresholds) === 'warning').length
    : 0;

  const healthBreakdown = useMemo(() => ({
    good: orchids.filter(o => o.healthStatus === 'healthy').length,
    warning: orchids.filter(o => o.healthStatus === 'warning').length,
    danger: orchids.filter(o => o.healthStatus === 'sick').length,
  }), [orchids]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('sensor.title')}</h1>
          <p className="text-sm text-gray-400">{t('sensor.subtitle')}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {connected ? t('sensor.connected') : t('sensor.notConnected')}
        </span>
      </div>

      {/* Chọn giai đoạn sinh trưởng (chỉ cây có stages, VD sầu riêng) */}
      {stages && stages.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1.5">🌱 Giai đoạn sinh trưởng</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {stages.map(s => (
              <button
                key={s.id}
                onClick={() => { if (s.id !== activeStage?.id) updateActiveStage(s.id); }}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  s.id === activeStage?.id ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!latest ? (
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="text-center py-4">
            <span className="text-5xl block mb-3">📡</span>
            <h3 className="font-bold text-gray-800 mb-1">{t('sensor.noDataTitle')}</h3>
            <p className="text-sm text-gray-400">{t('sensor.noDataDescription')}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{t('sensor.firebasePath')}</p>
            <code className="block text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 break-all">
              sensors/{user?.uid}/latest
            </code>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{t('sensor.jsonStructure')}</p>
            <pre className="text-xs text-gray-600 overflow-x-auto">{`{
  "n": 45,        // Nitơ (mg/kg)
  "p": 32,        // Lân (mg/kg)
  "k": 28,        // Kali (mg/kg)
  "ph": 6.2,      // pH
  "ec": 1.8,      // EC (mS/cm)
  "moisture": 65, // Độ ẩm đất (%)
  "temp": 28.5,   // Nhiệt độ (°C)
  "humidity": 72, // Độ ẩm KK (%)
  "ts": 1715000000000  // miliseconds
}`}</pre>
          </div>

          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-700 mb-1">{t('sensor.hardwareTitle')}</p>
            <ul className="text-xs text-blue-600 space-y-0.5">
              <li>• {t('sensor.hardware.esp32')}</li>
              <li>• {t('sensor.hardware.npk')}</li>
              <li>• {t('sensor.hardware.phec')}</li>
              <li>• {t('sensor.hardware.dht22')}</li>
              <li>• {t('sensor.hardware.moisture')}</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Thời gian cập nhật + cảnh báo */}
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400 flex-1">
              {t('sensor.lastUpdate', { time: timeAgo(latest.ts) })}
            </p>
            {alertCount > 0 && (
              <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                {t('sensor.alertCount', { count: alertCount })}
              </span>
            )}
            {warnCount > 0 && (
              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-600 text-xs font-semibold rounded-full">
                {t('sensor.warnCount', { count: warnCount })}
              </span>
            )}
          </div>

          {/* Grid 8 metric cards */}
          <div className="grid grid-cols-2 gap-3">
            {METRICS.map(metric => (
              <MetricCard key={metric.key} metric={metric} value={latest[metric.key] as number} t={t} thresholds={thresholds} />
            ))}
          </div>

          {/* AI Advisor */}
          <AiAdvisor
            latest={latest}
            orchidCount={orchids.length}
            healthBreakdown={healthBreakdown}
            t={t}
            metrics={METRICS}
            crop={crop}
            thresholds={thresholds}
            stageName={activeStage?.name}
            stageNote={activeStage?.promptNote}
          />

          {/* Biểu đồ lịch sử */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">{t('sensor.historyTitle', { count: history.length })}</h3>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {METRICS.map(m => (
                  <button key={m.key} onClick={() => setChartKey(m.key)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${chartKey === m.key ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>{chartMetric.label}</span>
                  <span>
                    {t('sensor.chartMinMax', { min: Math.min(...chartData).toFixed(1), max: Math.max(...chartData).toFixed(1), unit: chartMetric.unit })}
                  </span>
                </div>
                <Sparkline data={chartData} noDataText={t('sensor.noChartData')} />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>{t('sensor.chartOldest')}</span>
                  <span>{t('sensor.chartNewest')}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
