import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Method = 'split' | 'keiki' | 'stem';

function getMethods(t: any): { id: Method; icon: string; label: string; desc: string }[] {
  return [
    { id: 'split',  icon: '✂️', label: t('propagation.methods.split.label'),  desc: t('propagation.methods.split.desc') },
    { id: 'keiki',  icon: '🌿', label: t('propagation.methods.keiki.label'),  desc: t('propagation.methods.keiki.desc') },
    { id: 'stem',   icon: '🪴', label: t('propagation.methods.stem.label'),   desc: t('propagation.methods.stem.desc') },
  ];
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
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
                  ${minPerPlant === n ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
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
          <li>{t('propagation.split.note1')}</li>
          <li>{t('propagation.split.note2')}</li>
          <li>{t('propagation.split.note3')}</li>
          <li>{t('propagation.split.note4')}</li>
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
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
                ${hasRoots ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
              {t('propagation.keiki.hasRootsYes')}
            </button>
            <button type="button" onClick={() => setHasRoots(false)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
                ${!hasRoots ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-500'}`}>
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
          <li>{t('propagation.keiki.note1')}</li>
          <li>{t('propagation.keiki.note2')}</li>
          <li>{t('propagation.keiki.note3')}</li>
          <li>{t('propagation.keiki.note4')}</li>
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
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
                  ${nodeSpacing === n ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
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
          <li>{t('propagation.stem.note1')}</li>
          <li>{t('propagation.stem.note2')}</li>
          <li>{t('propagation.stem.note3')}</li>
          <li>{t('propagation.stem.note4')}</li>
        </ul>
      </div>
    </div>
  );
}

export default function PropagationPage() {
  const { t } = useTranslation();
  const [method, setMethod] = useState<Method>('split');
  const METHODS = getMethods(t);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('propagation.title')}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t('propagation.subtitle')}</p>
      </div>

      {/* Method selector */}
      <div className="space-y-2">
        {METHODS.map(m => (
          <button key={m.id} onClick={() => setMethod(m.id)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all
              ${method === m.id ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white'}`}>
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
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
