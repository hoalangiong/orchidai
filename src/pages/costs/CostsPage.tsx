import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCosts, CostEntry } from '../../hooks/useCosts';

function getExpenseCategories(t: any): string[] {
  return [
    t('costs.categories.pesticide'),
    t('costs.categories.fertilizer'),
    t('costs.categories.medium'),
    t('costs.categories.pots'),
    t('costs.categories.plants'),
    t('costs.categories.utilities'),
    t('costs.categories.transport'),
    t('costs.categories.other')
  ];
}

function getRevenueCategories(t: any): string[] {
  return [
    t('costs.categories.flowerSales'),
    t('costs.categories.plantSales'),
    t('costs.categories.division'),
    t('costs.categories.careService'),
    t('costs.categories.other')
  ];
}

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

function parseAmount(s: string): number {
  return parseInt(s.replace(/\D/g, '')) || 0;
}

export default function CostsPage() {
  const { t } = useTranslation();
  const { entries, addEntry, deleteEntry, totalRevenue, totalExpense, profit } = useCosts();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'all' | 'expense' | 'revenue'>('all');
  const [form, setForm] = useState<{ type: CostEntry['type']; category: string; amount: string; note: string; date: string }>({
    type: 'expense',
    category: '',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const categories = form.type === 'expense' ? getExpenseCategories(t) : getRevenueCategories(t);

  const handleAdd = async () => {
    const amount = parseAmount(form.amount);
    if (!amount || !form.category) return;
    await addEntry({ type: form.type, category: form.category, amount, note: form.note, date: form.date, createdAt: Date.now() });
    setForm({ type: 'expense', category: '', amount: '', note: '', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  };

  const filtered = tab === 'all' ? entries : entries.filter(e => e.type === tab);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">💰 {t('costs.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('costs.subtitle')}</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
          + {t('costs.add')}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-50 rounded-2xl p-3 text-center">
          <p className="text-xs text-red-400 font-medium">{t('costs.expense')}</p>
          <p className="font-bold text-red-600 text-sm mt-1">{formatVND(totalExpense)}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-3 text-center">
          <p className="text-xs text-green-500 font-medium">{t('costs.revenue')}</p>
          <p className="font-bold text-green-600 text-sm mt-1">{formatVND(totalRevenue)}</p>
        </div>
        <div className={`rounded-2xl p-3 text-center ${profit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <p className={`text-xs font-medium ${profit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>{t('costs.profit')}</p>
          <p className={`font-bold text-sm mt-1 ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{profit >= 0 ? '+' : ''}{formatVND(profit)}</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3 border border-green-100">
          <div className="flex gap-2">
            <button onClick={() => setForm(f => ({ ...f, type: 'expense', category: '' }))}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
                ${form.type === 'expense' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500'}`}>
              📤 {t('costs.expense')}
            </button>
            <button onClick={() => setForm(f => ({ ...f, type: 'revenue', category: '' }))}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
                ${form.type === 'revenue' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-500'}`}>
              📥 {t('costs.revenue')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} type="button" onClick={() => setForm(f => ({ ...f, category: c }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${form.category === c ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                {c}
              </button>
            ))}
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={form.amount ? parseAmount(form.amount).toLocaleString('vi-VN') : ''}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value.replace(/\D/g, '') }))}
            placeholder={t('costs.amountPlaceholder')}
            className="input"
          />
          <input
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder={t('costs.notePlaceholder')}
            className="input"
          />
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm">
              {t('common.cancel')}
            </button>
            <button onClick={handleAdd} disabled={!form.category || !form.amount}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-semibold disabled:opacity-50">
              {t('common.save')}
            </button>
          </div>
        </div>
      )}

      {/* Tab filter */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {(['all', 'expense', 'revenue'] as const).map(tabType => (
          <button key={tabType} onClick={() => setTab(tabType)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${tab === tabType ? 'bg-white shadow-sm text-green-700' : 'text-gray-400'}`}>
            {tabType === 'all' ? t('costs.all') : tabType === 'expense' ? `📤 ${t('costs.expense')}` : `📥 ${t('costs.revenue')}`}
          </button>
        ))}
      </div>

      {/* Entry list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="text-5xl mb-3">💰</span>
          <p className="text-gray-400 text-sm">{t('costs.noData')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => (
            <div key={e.id} className="bg-white rounded-2xl shadow-sm p-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${e.type === 'expense' ? 'bg-red-50' : 'bg-green-50'}`}>
                <span className="text-lg">{e.type === 'expense' ? '📤' : '📥'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{e.category}</p>
                <p className="text-xs text-gray-400">{e.date}{e.note ? ` · ${e.note}` : ''}</p>
              </div>
              <p className={`font-bold text-sm shrink-0 ${e.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
                {e.type === 'expense' ? '-' : '+'}{formatVND(e.amount)}
              </p>
              <button onClick={() => deleteEntry(e.id)} className="text-gray-200 hover:text-red-400 text-sm shrink-0">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
