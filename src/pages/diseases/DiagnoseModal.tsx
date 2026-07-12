import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useActiveCrop } from '../../crops';

interface DiagnoseResult {
  disease: string;
  confidence: string;
  symptoms: string;
  treatment: string;
  prevention: string;
  urgency: 'cao' | 'trung bình' | 'thấp';
}

async function callDiagnose(base64Image: string, expertPrompt: string, plantName: string, attempt = 0): Promise<DiagnoseResult> {
  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `${expertPrompt}

Hãy quan sát kỹ hình ảnh lá/cây ${plantName} này và chẩn đoán theo định dạng JSON sau (chỉ trả về JSON, không thêm text khác):

{
  "disease": "Tên bệnh/sâu hại bằng tiếng Việt",
  "confidence": "Mức độ chắc chắn: Cao / Trung bình / Thấp",
  "symptoms": "Mô tả triệu chứng bạn nhìn thấy trong ảnh (2-3 câu)",
  "treatment": "Hướng dẫn điều trị cụ thể, ưu tiên thuốc có bán ở VN (3-4 bước)",
  "prevention": "Cách phòng ngừa tái phát (2-3 điểm)",
  "urgency": "cao | trung bình | thấp"
}

Nếu ảnh không phải ${plantName} hoặc không đủ rõ để chẩn đoán, trả về:
{"disease": "Không xác định", "confidence": "Thấp", "symptoms": "Ảnh không đủ rõ hoặc không phải lá ${plantName}.", "treatment": "Vui lòng chụp ảnh rõ hơn, gần hơn vào vùng bị bệnh.", "prevention": "", "urgency": "thấp"}`,
          },
        ],
      },
    ],
  };

  const res = await fetch('https://orchid-diagnose.trananhthy.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 529 || res.status === 503) {
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
      return callDiagnose(base64Image, expertPrompt, plantName, attempt + 1);
    }
    throw new Error('overloaded');
  }

  if (!res.ok) {
    const err = await res.text();
    let parsed: { error?: { type?: string } } = {};
    try { parsed = JSON.parse(err); } catch { /* ignore */ }
    if (parsed?.error?.type === 'overloaded_error') {
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
        return callDiagnose(base64Image, expertPrompt, plantName, attempt + 1);
      }
      throw new Error('overloaded');
    }
    throw new Error(err);
  }

  const data = await res.json();
  const text = data.content[0].text.trim();
  const jsonStr = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(jsonStr) as DiagnoseResult;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const URGENCY_STYLE = {
  'cao':        { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700',    icon: '🚨', label: 'Xử lý ngay' },
  'trung bình': { bar: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700', icon: '⚡', label: 'Theo dõi kỹ' },
  'thấp':       { bar: 'bg-green-400',  badge: 'bg-green-100 text-green-700', icon: '✅', label: 'Không nguy cấp' },
};

export default function DiagnoseModal({ onClose }: { onClose: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const crop = useActiveCrop();

  const handleFile = async (file: File) => {
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    const b64 = await fileToBase64(file);
    setBase64(b64);
  };

  const handleDiagnose = async () => {
    if (!base64) return;
    setLoading(true);
    setError(null);
    try {
      const res = await callDiagnose(base64, crop.diagnosePrompt, crop.name);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const urgency = result ? (URGENCY_STYLE[result.urgency] ?? URGENCY_STYLE['thấp']) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-600 to-emerald-500">
        <button onClick={onClose} className="text-white/80 text-xl leading-none">←</button>
        <div>
          <h2 className="font-bold text-white text-base leading-tight">{t('diseases.aiDiagnosisTitle')}</h2>
          <p className="text-green-100 text-xs">{t('diseases.aiExpert')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-8">

        {/* Upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`relative rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer
            ${preview ? 'border-green-400 bg-black' : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-green-50'}`}
          style={{ minHeight: 200 }}
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full max-h-64 object-contain mx-auto" />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-5xl">📷</span>
              <p className="text-sm font-medium text-gray-600">{t('diseases.uploadPrompt')}</p>
              <p className="text-xs text-gray-400">{t('diseases.uploadInstruction')}</p>
            </div>
          )}
          {preview && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {t('diseases.changeImage')}
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />

        {/* Nút chẩn đoán */}
        {preview && !result && (
          <button
            onClick={handleDiagnose}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all
              bg-gradient-to-r from-green-600 to-emerald-500 active:scale-95 disabled:opacity-60 disabled:scale-100
              flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {t('diseases.analyzing')}
              </>
            ) : (
              <>🔬 {t('diseases.diagnoseNow')}</>
            )}
          </button>
        )}

        {/* Lỗi */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 leading-relaxed">
            ⚠️ {error === 'overloaded'
              ? t('diseases.overloaded')
              : t('diseases.errorGeneric')}
          </div>
        )}

        {/* Kết quả */}
        {result && urgency && (
          <div className="space-y-3">
            {/* Card chính */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`h-1.5 w-full ${urgency.bar}`} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{result.disease}</h3>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${urgency.badge}`}>
                    {urgency.icon} {urgency.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{t('diagnose.confidence')}: <span className="font-medium text-gray-600">{result.confidence}</span></p>
              </div>
            </div>

            {/* Triệu chứng */}
            <InfoCard icon="🔍" title={t('diseases.symptoms')} color="text-red-600" bg="bg-red-50">
              <p className="text-sm text-gray-700 leading-relaxed">{result.symptoms}</p>
            </InfoCard>

            {/* Điều trị */}
            <InfoCard icon="💊" title={t('diseases.treatment')} color="text-blue-600" bg="bg-blue-50">
              {result.treatment.split('\n').filter(Boolean).map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                  <p className="leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</p>
                </div>
              ))}
            </InfoCard>

            {/* Phòng ngừa */}
            {result.prevention && (
              <InfoCard icon="🛡️" title={t('diseases.prevention')} color="text-green-600" bg="bg-green-50">
                {result.prevention.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400 mt-2" />
                    <p className="leading-relaxed">{line.replace(/^[-•]\s*/, '')}</p>
                  </div>
                ))}
              </InfoCard>
            )}

            {/* Chẩn đoán lại */}
            <button
              onClick={() => { setResult(null); setPreview(null); setBase64(null); }}
              className="w-full py-3 rounded-2xl border-2 border-green-200 text-green-700 font-semibold text-sm"
            >
              📷 {t('diseases.diagnoseAnother')}
            </button>

            <p className="text-center text-xs text-gray-400 pb-2">
              {t('diseases.disclaimer')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, color, bg, children }: {
  icon: string; title: string; color: string; bg: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className={`px-4 py-2.5 ${bg} flex items-center gap-2`}>
        <span>{icon}</span>
        <h4 className={`font-bold text-sm ${color}`}>{title}</h4>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}
