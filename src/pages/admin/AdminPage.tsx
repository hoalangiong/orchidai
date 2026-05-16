import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts, Product } from '../../hooks/useProducts';
import { useAllOrders, Order } from '../../hooks/useOrders';

const STATUS_COLORS: Record<Order['status'], string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping:  'bg-purple-100 text-purple-700',
  done:      'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const ADMIN_EMAIL = 'trananhthy@gmail.com';

const DISEASE_OPTIONS = [
  { id: 'black-rot', label: 'Thối đen' },
  { id: 'crown-rot', label: 'Thối cổ rễ' },
  { id: 'leaf-spot', label: 'Đốm lá' },
  { id: 'blight', label: 'Cháy lá' },
  { id: 'rust', label: 'Gỉ sắt lá' },
  { id: 'yellowing', label: 'Vàng lá sinh lý' },
  { id: 'virus', label: 'Khảm virus' },
  { id: 'fusarium', label: 'Thối hồng Fusarium' },
  { id: 'anthracnose', label: 'Than thư' },
  { id: 'bacterial-rot', label: 'Thối nhũn vi khuẩn' },
  { id: 'spider-mites', label: 'Nhện đỏ' },
  { id: 'ruoi-chit', label: 'Ruồi chít hoa' },
  { id: 'bo-tri', label: 'Bọ trĩ' },
  { id: 'mealybugs', label: 'Rệp sáp' },
  { id: 'scale', label: 'Rệp vảy' },
  { id: 'snails', label: 'Ốc sên' },
];

const EMPTY_FORM = {
  name: '', imageUrl: '', price: '', shopUrl: '',
  description: '', type: '', diseaseIds: [] as string[],
};

export default function AdminPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, updateStatus } = useAllOrders();
  const [adminTab, setAdminTab] = useState<'products' | 'orders'>('orders');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4">🔒</span>
        <h2 className="text-lg font-bold text-gray-700">{t('admin.noAccess')}</h2>
        <p className="text-sm text-gray-400 mt-1">{t('admin.adminOnly')}</p>
      </div>
    );
  }

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, imageUrl: p.imageUrl, price: p.price,
      shopUrl: p.shopUrl, description: p.description,
      type: p.type, diseaseIds: p.diseaseIds,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.shopUrl) return;
    setSaving(true);
    if (editing) {
      await updateProduct(editing.id, form);
    } else {
      await addProduct(form);
    }
    setSaving(false);
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditing(null);
  };

  const toggleDisease = (id: string) => {
    setForm(f => ({
      ...f,
      diseaseIds: f.diseaseIds.includes(id)
        ? f.diseaseIds.filter(d => d !== id)
        : [...f.diseaseIds, id],
    }));
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
          <h2 className="text-lg font-bold text-gray-900">{editing ? t('admin.editProduct') : t('admin.addProduct')}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <Field label={t('admin.fieldName')}>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('admin.placeholderName')} className="input" />
          </Field>
          <Field label={t('admin.fieldImage')}>
            <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..." className="input" />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-xl border" />
            )}
          </Field>
          <Field label={t('admin.fieldPrice')}>
            <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder={t('admin.placeholderPrice')} className="input" />
          </Field>
          <Field label={t('admin.fieldShopUrl')}>
            <input value={form.shopUrl} onChange={e => setForm(f => ({ ...f, shopUrl: e.target.value }))}
              placeholder="https://www.tiktok.com/..." className="input" />
          </Field>
          <Field label={t('admin.fieldType')}>
            <input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              placeholder={t('admin.placeholderType')} className="input" />
          </Field>
          <Field label={t('admin.fieldDesc')}>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder={t('admin.placeholderDesc')} className="input resize-none" />
          </Field>
          <Field label={t('admin.fieldDiseases')}>
            <div className="flex flex-wrap gap-2 mt-1">
              {DISEASE_OPTIONS.map(d => (
                <button key={d.id} type="button" onClick={() => toggleDisease(d.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                    ${form.diseaseIds.includes(d.id)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-500 border-gray-200'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <button onClick={handleSave} disabled={saving || !form.name || !form.shopUrl}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold shadow-md disabled:opacity-50">
          {saving ? t('admin.saving') : editing ? t('admin.update') : t('admin.addProduct').replace('+ ', '')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Admin</h1>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button onClick={() => setAdminTab('orders')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${adminTab === 'orders' ? 'bg-white shadow-sm text-green-700' : 'text-gray-400'}`}>
          📦 {t('admin.orders')} ({orders.length})
        </button>
        <button onClick={() => setAdminTab('products')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${adminTab === 'products' ? 'bg-white shadow-sm text-green-700' : 'text-gray-400'}`}>
          🧴 {t('admin.products')} ({products.length})
        </button>
      </div>

      {/* Orders tab */}
      {adminTab === 'orders' && (
        orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl mb-3">📦</span>
            <p className="text-gray-500 font-medium">{t('admin.noOrders')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900 text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {t(`orderStatus.${order.status}`)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium">{order.userName} — {order.phone}</p>
                <p className="text-xs text-gray-400">{order.address}</p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <p className="font-bold text-green-600">{order.total.toLocaleString('vi-VN')}₫</p>
                  <p className="text-xs text-gray-400">{order.paymentMethod === 'cod' ? '🚚 COD' : '🏦 Chuyển khoản'}</p>
                </div>
                <div className="flex gap-2 flex-wrap pt-1">
                  {(['pending', 'confirmed', 'shipping', 'done', 'cancelled'] as Order['status'][]).map(s => (
                    <button key={s} onClick={() => updateStatus(order.id, s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                        ${order.status === s ? STATUS_COLORS[s] + ' border-transparent' : 'border-gray-200 text-gray-400'}`}>
                      {t(`orderStatus.${s}`)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Products tab */}
      {adminTab === 'products' && (
        <>
          <div className="flex justify-end">
            <button onClick={openAdd}
              className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
              {t('admin.addProduct')}
            </button>
          </div>
          {products.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="text-5xl mb-3">🧴</span>
              <p className="text-gray-500 font-medium">{t('admin.noProducts')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex items-stretch">
                  <div className="w-20 h-20 shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      : <span className="text-3xl">🧴</span>}
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                    {p.type && <p className="text-xs text-green-600 font-medium">{p.type}</p>}
                    {p.price && <p className="text-xs text-gray-500">{p.price}</p>}
                    {p.diseaseIds.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {p.diseaseIds.map(id => DISEASE_OPTIONS.find(d => d.id === id)?.label).filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-2 justify-center">
                    <button onClick={() => openEdit(p)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold">
                      Sửa
                    </button>
                    <button onClick={() => deleteProduct(p.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-semibold">
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
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
