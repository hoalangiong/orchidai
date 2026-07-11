import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePropagation, PropagationBatch } from '../../hooks/usePropagation';
import { useOrchids } from '../../hooks/useOrchids';
import { useCosts } from '../../hooks/useCosts';
import { fetchWeather } from '../../services/weatherService';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

// Lấy tọa độ: native dùng plugin Capacitor (navigator.geolocation không chạy
// trong WebView); web fallback navigator.
async function getPropCoords(): Promise<{ lat: number; lng: number }> {
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
      const req = await Geolocation.requestPermissions();
      if (req.location !== 'granted' && req.coarseLocation !== 'granted') throw new Error('permission denied');
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

type Method = 'split' | 'keiki' | 'stem';
type Tab = 'calc' | 'journal' | 'advisor';

function getMethods(t: any): { id: Method; icon: string; label: string; desc: string }[] {
  return [
    { id: 'split', icon: '✂️', label: t('propagation.methods.split.label'), desc: t('propagation.methods.split.desc') },
    { id: 'keiki', icon: '🌿', label: t('propagation.methods.keiki.label'), desc: t('propagation.methods.keiki.desc') },
    { id: 'stem',  icon: '🪴', label: t('propagation.methods.stem.label'),  desc: t('propagation.methods.stem.desc') },
  ];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SplitCalc() {
  const { t } = useTranslation();
  const [pseudobulbs, setPseudobulbs] = useState('');
  const [minPerPlant, setMinPerPlant] = useState('3');
  const total = parseInt(pseudobulbs) || 0;
  const min = parseInt(minPerPlant) || 3;
  const plants = total >= min * 2 ? Math.floor(total / min) : 0;
  const remainder = plants > 0 ? total - plants * min : 0;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <Field label={t('propagation.split.totalPseudobulbs')}>
          <input type="number" min="1" value={pseudobulbs} onChange={e => setPseudobulbs(e.target.value)}
            placeholder={t('propagation.split.totalPlaceholder')} className="input" />
        </Field>
        <Field label={t('propagation.split.minPerPlant')}>
          <div className="flex gap-2">
            {['2','3','4','5'].map(n => (
              <button key={n} type="button" onClick={() => setMinPerPlant(n)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${minPerPlant === n ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                {n}
              </button>
            ))}
          </div>
        </Field>
      </div>
      {total > 0 && (
        <div className={`rounded-2xl p-5 text-center space-y-2 ${plants > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          {plants > 0 ? (
            <>
              <p className="text-4xl font-bold text-green-600">{plants}</p>
              <p className="text-green-700 font-medium">{t('propagation.split.canSplit')}</p>
              {remainder > 0 && <p className="text-sm text-green-500">{t('propagation.split.remainder', { count: remainder })}</p>}
              <div className="mt-3 pt-3 border-t border-green-200 text-sm text-green-600">
                <p>{t('propagation.split.bestTime')}</p>
                <p className="mt-1">{t('propagation.split.useSterileTool')}</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-yellow-600">{t('propagation.split.notEnough')}</p>
              <p className="text-sm text-yellow-600">{t('propagation.split.needMore', { count: min * 2 - total })}</p>
            </>
          )}
        </div>
      )}
      <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
        <p className="font-semibold text-blue-700 text-sm">{t('propagation.split.notesTitle')}</p>
        <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
          <li>{t('propagation.split.note1')}</li><li>{t('propagation.split.note2')}</li>
          <li>{t('propagation.split.note3')}</li><li>{t('propagation.split.note4')}</li>
        </ul>
      </div>
    </div>
  );
}

function KeikiCalc() {
  const { t } = useTranslation();
  const [keikis, setKeikis] = useState('');
  const [hasRoots, setHasRoots] = useState(true);
  const count = parseInt(keikis) || 0;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <Field label={t('propagation.keiki.count')}>
          <input type="number" min="0" value={keikis} onChange={e => setKeikis(e.target.value)}
            placeholder={t('propagation.keiki.countPlaceholder')} className="input" />
        </Field>
        <Field label={t('propagation.keiki.hasRoots')}>
          <div className="flex gap-3">
            <button type="button" onClick={() => setHasRoots(true)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${hasRoots ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
              {t('propagation.keiki.hasRootsYes')}
            </button>
            <button type="button" onClick={() => setHasRoots(false)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${!hasRoots ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-500'}`}>
              {t('propagation.keiki.hasRootsNo')}
            </button>
          </div>
        </Field>
      </div>
      {count > 0 && (
        <div className={`rounded-2xl p-5 text-center space-y-2 ${hasRoots ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          {hasRoots ? (
            <>
              <p className="text-4xl font-bold text-green-600">{count}</p>
              <p className="text-green-700 font-medium">{t('propagation.keiki.ready')}</p>
              <p className="text-sm text-green-500 mt-1">{t('propagation.keiki.readyInstruction')}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-yellow-600">{t('propagation.keiki.waitMore')}</p>
              <p className="text-sm text-yellow-600">{t('propagation.keiki.waitInstruction', { count })}</p>
            </>
          )}
        </div>
      )}
      <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
        <p className="font-semibold text-blue-700 text-sm">{t('propagation.keiki.notesTitle')}</p>
        <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
          <li>{t('propagation.keiki.note1')}</li><li>{t('propagation.keiki.note2')}</li>
          <li>{t('propagation.keiki.note3')}</li><li>{t('propagation.keiki.note4')}</li>
        </ul>
      </div>
    </div>
  );
}

function StemCalc() {
  const { t } = useTranslation();
  const [stemLength, setStemLength] = useState('');
  const [nodeSpacing, setNodeSpacing] = useState('10');
  const length = parseFloat(stemLength) || 0;
  const spacing = parseFloat(nodeSpacing) || 10;
  const nodes = length > 0 ? Math.floor(length / spacing) : 0;
  const cuttings = nodes >= 2 ? Math.floor(nodes / 2) : 0;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <Field label={t('propagation.stem.length')}>
          <input type="number" min="1" value={stemLength} onChange={e => setStemLength(e.target.value)}
            placeholder={t('propagation.stem.lengthPlaceholder')} className="input" />
        </Field>
        <Field label={t('propagation.stem.nodeSpacing')}>
          <div className="flex gap-2">
            {['8','10','12','15'].map(n => (
              <button key={n} type="button" onClick={() => setNodeSpacing(n)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${nodeSpacing === n ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                {n}
              </button>
            ))}
          </div>
        </Field>
      </div>
      {length > 0 && (
        <div className={`rounded-2xl p-5 text-center space-y-2 ${cuttings > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          {cuttings > 0 ? (
            <>
              <p className="text-4xl font-bold text-green-600">{cuttings}</p>
              <p className="text-green-700 font-medium">{t('propagation.stem.cuttings')}</p>
              <p className="text-sm text-green-500">{t('propagation.stem.details', { nodes, avgLength: (length / cuttings).toFixed(0) })}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-yellow-600">{t('propagation.stem.tooShort')}</p>
              <p className="text-sm text-yellow-600">{t('propagation.stem.needLength', { length: spacing * 2 })}</p>
            </>
          )}
        </div>
      )}
      <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
        <p className="font-semibold text-blue-700 text-sm">{t('propagation.stem.notesTitle')}</p>
        <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
          <li>{t('propagation.stem.note1')}</li><li>{t('propagation.stem.note2')}</li>
          <li>{t('propagation.stem.note3')}</li><li>{t('propagation.stem.note4')}</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Journal Tab ─────────────────────────────────────────────────────────────

const METHOD_ICON: Record<Method, string> = { split: '✂️', keiki: '🌿', stem: '🪴' };
const OUTCOME_COLOR = {
  ongoing: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
  failed:  'bg-red-100 text-red-700',
};
const OUTCOME_LABEL: Record<string, string> = {
  ongoing: 'Đang theo dõi',
  success: 'Thành công',
  failed:  'Thất bại',
};

function BatchCard({ batch, onAddStage, onFinish, onDelete, onLinkOrchid }: {
  batch: PropagationBatch;
  onAddStage: (id: string, note: string, stages: any[]) => void;
  onFinish: (id: string, outcome: 'success' | 'failed', successCount: number) => void;
  onDelete: (id: string) => void;
  onLinkOrchid: (batch: PropagationBatch) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [stageNote, setStageNote] = useState('');
  const [showFinish, setShowFinish] = useState(false);
  const [successCount, setSuccessCount] = useState(String(batch.quantity));

  const weeksSince = Math.floor((Date.now() - batch.createdAt) / (7 * 24 * 3600 * 1000));

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button className="w-full p-4 text-left" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{METHOD_ICON[batch.method]}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{batch.species || 'Chưa đặt tên'}</p>
              <p className="text-xs text-gray-400">{batch.startDate} · {batch.quantity} cây · {weeksSince} tuần</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${OUTCOME_COLOR[batch.outcome]}`}>
            {OUTCOME_LABEL[batch.outcome]}
          </span>
        </div>
        {batch.materialCost > 0 && (
          <p className="text-xs text-gray-400 mt-1 ml-8">💰 Chi phí: {batch.materialCost.toLocaleString('vi-VN')}đ</p>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
          {/* Stages timeline */}
          {batch.stages.length > 0 && (
            <div className="space-y-2 pt-3">
              {batch.stages.map((s, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-0.5 shrink-0" />
                    {i < batch.stages.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 mt-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-gray-400">{s.date}</p>
                    <p className="text-gray-700">{s.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add stage */}
          {batch.outcome === 'ongoing' && (
            <div className="flex gap-2">
              <input value={stageNote} onChange={e => setStageNote(e.target.value)}
                placeholder="Ghi chú tiến độ hôm nay..."
                className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-green-400" />
              <button onClick={() => { if (stageNote.trim()) { onAddStage(batch.id, stageNote.trim(), batch.stages); setStageNote(''); } }}
                className="px-3 py-2 bg-green-500 text-white text-xs rounded-xl font-medium">
                Thêm
              </button>
            </div>
          )}

          {/* Finish */}
          {batch.outcome === 'ongoing' && !showFinish && (
            <div className="flex gap-2">
              <button onClick={() => setShowFinish(true)}
                className="flex-1 py-2 text-xs font-medium rounded-xl bg-green-50 text-green-700 border border-green-200">
                ✅ Kết thúc lô
              </button>
              <button onClick={() => onDelete(batch.id)}
                className="px-3 py-2 text-xs font-medium rounded-xl bg-red-50 text-red-500 border border-red-100">
                🗑️
              </button>
            </div>
          )}

          {showFinish && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-medium text-gray-600">Kết quả lô nhân giống</p>
              <div className="flex gap-2">
                <button onClick={() => { onFinish(batch.id, 'success', parseInt(successCount) || 0); setShowFinish(false); }}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-green-500 text-white">
                  ✅ Thành công
                </button>
                <button onClick={() => { onFinish(batch.id, 'failed', 0); setShowFinish(false); }}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-red-100 text-red-600">
                  ❌ Thất bại
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Số cây sống:</span>
                <input type="number" value={successCount} onChange={e => setSuccessCount(e.target.value)}
                  className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 text-center" />
                <span className="text-xs text-gray-400">/ {batch.quantity}</span>
              </div>
            </div>
          )}

          {/* Link to orchid collection */}
          {batch.outcome === 'success' && !batch.orchidLinked && (
            <button onClick={() => onLinkOrchid(batch)}
              className="w-full py-2 text-xs font-medium rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              🌺 Thêm vào bộ sưu tập vườn lan
            </button>
          )}
          {batch.orchidLinked && (
            <p className="text-xs text-center text-gray-400">✓ Đã thêm vào vườn lan</p>
          )}
        </div>
      )}
    </div>
  );
}

function JournalTab() {
  const { batches, addBatch, updateBatch, deleteBatch, addStage } = usePropagation();
  const { addOrchid } = useOrchids();
  const { addEntry } = useCosts();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ method: 'split' as Method, species: '', quantity: '', materialCost: '', startDate: new Date().toISOString().slice(0, 10) });

  const stats = {
    total: batches.length,
    success: batches.filter(b => b.outcome === 'success').length,
    ongoing: batches.filter(b => b.outcome === 'ongoing').length,
    totalPlants: batches.filter(b => b.outcome === 'success').reduce((s, b) => s + b.successCount, 0),
  };

  const handleAdd = async () => {
    if (!form.species.trim() || !form.quantity) return;
    const cost = parseFloat(form.materialCost) || 0;
    await addBatch({
      method: form.method, species: form.species.trim(),
      startDate: form.startDate, quantity: parseInt(form.quantity) || 1,
      stages: [], outcome: 'ongoing', successCount: 0,
      materialCost: cost, orchidLinked: false, createdAt: Date.now(),
    });
    if (cost > 0) {
      await addEntry({ type: 'expense', category: 'Nhân giống', amount: cost, note: `Nhân giống ${form.species}`, date: form.startDate, createdAt: Date.now() });
    }
    setForm({ method: 'split', species: '', quantity: '', materialCost: '', startDate: new Date().toISOString().slice(0, 10) });
    setShowForm(false);
  };

  const handleFinish = async (id: string, outcome: 'success' | 'failed', successCount: number) => {
    await updateBatch(id, { outcome, successCount });
  };

  const handleLinkOrchid = async (batch: PropagationBatch) => {
    await addOrchid({
      name: batch.species, species: batch.species, purchaseDate: batch.startDate,
      location: 'Nhân giống', quantity: batch.successCount,
      healthStatus: 'healthy', notes: `Nhân giống từ lô ${batch.startDate}`,
    });
    await updateBatch(batch.id, { orchidLinked: true });
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      {batches.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Tổng lô', value: stats.total, color: 'text-gray-700' },
            { label: 'Đang theo dõi', value: stats.ongoing, color: 'text-blue-600' },
            { label: 'Thành công', value: stats.success, color: 'text-green-600' },
            { label: 'Cây sống', value: stats.totalPlants, color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-2.5 text-center shadow-sm">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add batch button */}
      <button onClick={() => setShowForm(s => !s)}
        className="w-full py-3 rounded-2xl bg-green-500 text-white font-semibold text-sm shadow-sm active:scale-95 transition-all">
        {showForm ? '✕ Hủy' : '+ Tạo lô nhân giống mới'}
      </button>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <Field label="Phương pháp">
            <div className="flex gap-2">
              {(['split','keiki','stem'] as Method[]).map(m => (
                <button key={m} type="button" onClick={() => setForm(f => ({ ...f, method: m }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.method === m ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                  {METHOD_ICON[m]} {m === 'split' ? 'Tách bụi' : m === 'keiki' ? 'Keiki' : 'Giâm cành'}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Tên / giống lan">
            <input value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
              placeholder="VD: Dendrobium Thái Bình" className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Số lượng cây">
              <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="VD: 5" className="input" />
            </Field>
            <Field label="Chi phí vật tư (đ)">
              <input type="number" value={form.materialCost} onChange={e => setForm(f => ({ ...f, materialCost: e.target.value }))}
                placeholder="VD: 50000" className="input" />
            </Field>
          </div>
          <Field label="Ngày bắt đầu">
            <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input" />
          </Field>
          <button onClick={handleAdd}
            className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-sm">
            Lưu lô nhân giống
          </button>
        </div>
      )}

      {/* Batch list */}
      {batches.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">Chưa có lô nhân giống nào</p>
          <p className="text-xs mt-1">Tạo lô đầu tiên để theo dõi tiến độ</p>
        </div>
      )}

      {batches.map(batch => (
        <BatchCard key={batch.id} batch={batch}
          onAddStage={(id, note, stages) => addStage(id, { date: new Date().toISOString().slice(0, 10), note }, stages)}
          onFinish={handleFinish}
          onDelete={deleteBatch}
          onLinkOrchid={handleLinkOrchid}
        />
      ))}
    </div>
  );
}

// ─── AI Advisor Tab ───────────────────────────────────────────────────────────

function AdvisorTab() {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherSummary, setWeatherSummary] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const summarize = (forecast: any, withNext3: boolean) => {
      const today = forecast.days[0];
      if (withNext3) {
        const rainDays = forecast.days.slice(0, 3).filter((d: any) => d.rain > 5).length;
        setWeatherSummary(
          `Hôm nay: ${today.tempMin}–${today.tempMax}°C, độ ẩm ${today.humidity}%, mưa ${today.rain}mm. ` +
          `3 ngày tới: ${rainDays} ngày mưa > 5mm.`
        );
      } else {
        setWeatherSummary(`Hôm nay: ${today.tempMin}–${today.tempMax}°C, độ ẩm ${today.humidity}%, mưa ${today.rain}mm.`);
      }
    };
    getPropCoords()
      .then(c => fetchWeather(c.lat, c.lng).then(f => summarize(f, true)))
      .catch(() => fetchWeather(10.7769, 106.7009).then(f => summarize(f, false)).catch(() => {}));
  }, []);

  const month = new Date().getMonth() + 1;
  const season = month >= 5 && month <= 10 ? 'mùa mưa (tháng 5–10)' : 'mùa khô (tháng 11–4)';

  const prompt = `Bạn là chuyên gia nhân giống lan lâu năm tại Việt Nam. Hôm nay là tháng ${month}, ${season}.

Thời tiết hiện tại: ${weatherSummary || 'Không có dữ liệu thời tiết'}

Hãy tư vấn lịch nhân giống lan tối ưu cho thời điểm này, bao gồm:
1. Phương pháp nào phù hợp nhất với thời tiết hiện tại (tách bụi / keiki / giâm cành)?
2. Thời điểm tốt nhất trong tuần/tháng để thực hiện
3. Những rủi ro cần tránh dựa trên điều kiện thời tiết
4. Chuẩn bị giá thể và dụng cụ phù hợp mùa này
5. Dự báo tỷ lệ thành công và thời gian chờ

Trả lời ngắn gọn, dùng emoji, xưng "tôi", thân thiện như đang tư vấn trực tiếp.`;

  async function analyze() {
    if (loading) { abortRef.current?.abort(); setLoading(false); return; }
    setLoading(true); setAdvice(''); setError('');
    abortRef.current = new AbortController();
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 1200, stream: true,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`API lỗi ${res.status}`);
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
          } catch { /* ignore */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">🤖 Tư vấn thời điểm nhân giống</h3>
            <p className="text-xs text-gray-500 mt-0.5">Dựa trên thời tiết thực tế + mùa vụ</p>
          </div>
          <button onClick={analyze}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${loading ? 'bg-red-100 text-red-600' : 'bg-green-500 text-white shadow-sm'}`}>
            {loading ? '⏹ Dừng' : advice ? '🔄 Phân tích lại' : '✨ Phân tích'}
          </button>
        </div>
        <div className="px-4 pb-4">
          {weatherSummary && (
            <div className="mt-3 p-2.5 bg-blue-50 rounded-xl text-xs text-blue-700">
              🌤️ {weatherSummary}
            </div>
          )}
          {error && <div className="mt-3 p-3 bg-red-50 rounded-xl text-xs text-red-600">{error}</div>}
          {!advice && !loading && !error && (
            <p className="mt-3 text-xs text-gray-400 text-center py-3">Nhấn Phân tích để nhận tư vấn theo thời tiết hôm nay</p>
          )}
          {loading && !advice && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 py-3">
              <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              AI đang phân tích thời tiết và mùa vụ...
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

      {/* Seasonal quick tips */}
      <div className="bg-amber-50 rounded-2xl p-4 space-y-2 border border-amber-100">
        <p className="font-semibold text-amber-800 text-sm">📅 Lịch nhân giống theo mùa</p>
        <div className="space-y-1.5 text-xs text-amber-700">
          <p>🌧️ <strong>Mùa mưa (T5–T10):</strong> Ưu tiên keiki, tránh tách bụi khi mưa nhiều</p>
          <p>☀️ <strong>Mùa khô (T11–T4):</strong> Tốt nhất cho tách bụi và giâm cành</p>
          <p>🌸 <strong>Sau ra hoa:</strong> Thời điểm vàng để tách bụi Dendrobium</p>
          <p>🌡️ <strong>Nhiệt độ lý tưởng:</strong> 22–28°C, tránh tách khi {'>'} 35°C</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PropagationPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('calc');
  const [method, setMethod] = useState<Method>('split');
  const METHODS = getMethods(t);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'calc',    label: 'Tính toán', icon: '🧮' },
    { id: 'journal', label: 'Nhật ký',   icon: '📋' },
    { id: 'advisor', label: 'Tư vấn AI', icon: '🤖' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('propagation.title')}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t('propagation.subtitle')}</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 bg-gray-100 p-1 rounded-2xl">
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${tab === tb.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {/* Calc tab */}
      {tab === 'calc' && (
        <>
          <div className="space-y-2">
            {METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${method === m.id ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white'}`}>
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${method === m.id ? 'text-green-700' : 'text-gray-700'}`}>{m.label}</p>
                  <p className="text-xs text-gray-400">{m.desc}</p>
                </div>
                {method === m.id && <span className="ml-auto text-green-500 text-lg">✓</span>}
              </button>
            ))}
          </div>
          {method === 'split' && <SplitCalc />}
          {method === 'keiki' && <KeikiCalc />}
          {method === 'stem' && <StemCalc />}
        </>
      )}

      {tab === 'journal' && <JournalTab />}
      {tab === 'advisor' && <AdvisorTab />}
    </div>
  );
}
