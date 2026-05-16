import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useProducts } from '../../hooks/useProducts';
import { useOrders, OrderItem } from '../../hooks/useOrders';
import { useAuth } from '../../contexts/AuthContext';
import { useAddress } from '../../hooks/useAddress';

const ZALO_PHONE = '0365444455';
const BANK_ACCOUNT = '0909491000';
const BANK_NAME = 'MB Bank';
const BANK_OWNER = 'Trần Anh Thy';
const MB_BIN = '970422'; // Mã BIN MB Bank

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ((crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0'));
}

function field(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`;
}

function buildVietQR(amount?: number, note?: string): string {
  const acqId = field('00', MB_BIN);
  const accNo = field('01', BANK_ACCOUNT);
  const merchantInfo = field('38', field('00', 'A000000727') + field('01', acqId + accNo) + field('02', 'QRIBFTTA'));
  const addData = note ? field('62', field('08', note)) : '';
  const amountField = amount && amount > 0 ? field('54', amount.toString()) : '';

  const raw = field('00', '01')
    + field('01', '12')
    + merchantInfo
    + field('53', '704')
    + amountField
    + field('58', 'VN')
    + addData
    + '6304';

  return raw + crc16(raw);
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping:  'bg-purple-100 text-purple-700',
  done:      'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function parsePrice(price: string): number {
  return parseInt(price.replace(/\D/g, '')) || 0;
}

function formatPrice(num: number): string {
  return num.toLocaleString('vi-VN') + '₫';
}

export default function OrderPage() {
  const { products } = useProducts();
  const { orders, placeOrder } = useOrders();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [view, setView] = useState<'shop' | 'checkout' | 'success' | 'orders'>('shop');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer'>('cod');
  const [form, setForm] = useState({ name: '', phone: '', note: '' });
  const address = useAddress();
  const [placing, setPlacing] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = ['all', ...Array.from(new Set(products.map(p => p.type).filter(Boolean)))];
    return cats;
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'all' || p.type === activeCategory;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  const cartItems: OrderItem[] = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .flatMap(([id, qty]) => {
      const p = products.find(x => x.id === id);
      if (!p) return [];
      return [{ productId: id, name: p.name, imageUrl: p.imageUrl, price: p.price, priceNum: parsePrice(p.price), quantity: qty }];
    });

  const total = cartItems.reduce((sum, i) => sum + i.priceNum * i.quantity, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id: string) => setCart(c => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) }));

  const handlePlaceOrder = async () => {
    if (!user || !form.name || !form.phone || !address.fullAddress || cartItems.length === 0) return;
    setPlacing(true);
    const orderId = await placeOrder({
      userId: user.uid,
      userName: user.displayName || '',
      userEmail: user.email || '',
      phone: form.phone,
      address: address.fullAddress,
      items: cartItems,
      total,
      paymentMethod,
      status: 'pending',
      note: form.note,
      createdAt: Date.now(),
    });

    const msg = `🌸 ĐƠN HÀNG MỚI\nNgười nhận: ${form.name} (${form.phone})\nĐịa chỉ: ${address.fullAddress}\nSản phẩm: ${cartItems.map(i => `${i.name} x${i.quantity}`).join(', ')}\nTổng: ${formatPrice(total)}\nThanh toán: ${paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}\nGhi chú: ${form.note || 'Không có'}`;
    window.open(`https://zalo.me/${ZALO_PHONE}?message=${encodeURIComponent(msg)}`, '_blank');

    setLastOrderId(orderId || '');
    setCart({});
    setForm({ name: '', phone: '', note: '' });
    address.reset();
    setPlacing(false);
    setView('success');
  };

  // ── Success ──────────────────────────────────────────────────────────────────
  if (view === 'success') {
    return (
      <div className="flex flex-col items-center py-12 text-center space-y-4 px-4">
        <div className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
          <span className="text-5xl">🎉</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t('orderPage.successTitle')}</h2>
        <p className="text-sm text-gray-500">{t('orderPage.successMsg')}</p>

        {paymentMethod === 'transfer' && (
          <div className="w-full bg-orange-50 rounded-2xl p-4 text-left space-y-2 border border-orange-100">
            <p className="font-bold text-orange-600 text-sm">{t('orderPage.transferInfo')}</p>
            <p className="text-sm">{BANK_NAME} · <span className="font-bold">{BANK_ACCOUNT}</span> · {BANK_OWNER}</p>
            <p className="text-sm">{t('orderPage.amount')}: <span className="font-bold text-red-600">{formatPrice(total)}</span></p>
            <p className="text-sm">{t('orderPage.content')}: <span className="font-bold">ORCHID {lastOrderId.slice(-6).toUpperCase()}</span></p>
            <div className="flex justify-center mt-2">
              <div className="bg-white p-3 rounded-xl inline-block">
                <QRCodeSVG value={buildVietQR(total, `ORCHID ${lastOrderId.slice(-6).toUpperCase()}`)} size={176} level="M" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button onClick={() => setView('orders')}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm">
            {t('orderPage.viewOrders')}
          </button>
          <button onClick={() => setView('shop')}
            className="flex-1 py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
            {t('orderPage.continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  // ── Checkout ─────────────────────────────────────────────────────────────────
  if (view === 'checkout') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('shop')} className="text-gray-400 text-xl">←</button>
          <h2 className="text-lg font-bold text-gray-900">{t('orderPage.confirmOrder')}</h2>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <span className="text-base">🛒</span>
            <p className="font-bold text-sm text-gray-800">{t('orderPage.products')} ({cartItems.length})</p>
          </div>
          <div className="divide-y divide-gray-50">
            {cartItems.map(item => (
              <div key={item.productId} className="flex items-center gap-3 p-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-2xl">🌸</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">x{item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-red-500 shrink-0">
                  {formatPrice(item.priceNum * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-red-50 flex justify-between items-center">
            <p className="font-bold text-gray-700 text-sm">{t('orderPage.totalPayment')}</p>
            <p className="font-bold text-red-500 text-lg">{formatPrice(total)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="font-bold text-sm text-gray-800">{t('orderPage.deliveryInfo')}</p>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder={t('orderPage.namePlaceholder')} className="input" />
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder={t('orderPage.phonePlaceholder')} className="input" type="tel" />

          <select value={address.province?.code ?? ''} onChange={e => {
            const p = address.provinces.find(x => x.code === +e.target.value);
            address.setProvince(p ?? null);
          }} className="input">
            <option value="">{t('orderPage.selectProvince')}</option>
            {address.provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>

          {!address.useCustomWard ? (
            <div className="space-y-2">
              <select value={address.ward?.code ?? ''} onChange={e => {
                const w = address.wards.find(x => x.code === +e.target.value);
                address.setWard(w ?? null);
              }} className="input" disabled={!address.province || address.loadingWards}>
                <option value="">
                  {address.loadingWards ? t('orderPage.loadingWards') : address.province ? t('orderPage.selectWard') : t('orderPage.selectProvFirst')}
                </option>
                {address.wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
              {address.province && (
                <button type="button" onClick={() => address.setUseCustomWard(true)}
                  className="text-xs text-blue-600 hover:underline">
                  {t('orderPage.wardNotFound')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input value={address.customWard} onChange={e => address.setCustomWard(e.target.value)}
                placeholder={t('orderPage.wardManual')} className="input" />
              <button type="button" onClick={() => { address.setUseCustomWard(false); address.setCustomWard(''); }}
                className="text-xs text-blue-600 hover:underline">
                {t('orderPage.wardBackToList')}
              </button>
            </div>
          )}

          <input value={address.street} onChange={e => address.setStreet(e.target.value)}
            placeholder={t('orderPage.streetPlaceholder')} className="input" />
          <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder={t('orderPage.notePlaceholder')} rows={2} className="input resize-none" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="font-bold text-sm text-gray-800">{t('orderPage.paymentMethod')}</p>
          <div className="flex gap-3">
            {(['cod', 'transfer'] as const).map(method => (
              <button key={method} onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                  ${paymentMethod === method ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500'}`}>
                {method === 'cod' ? t('orderPage.cod') : t('orderPage.transfer')}
              </button>
            ))}
          </div>
          {paymentMethod === 'transfer' && (
            <div className="bg-orange-50 rounded-xl p-4 space-y-3">
              <div className="text-xs text-orange-700 space-y-1">
                <div className="flex justify-between">
                  <span>{t('orderPage.bank')}</span>
                  <span className="font-bold">{BANK_NAME}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('orderPage.accountNumber')}</span>
                  <span className="font-bold">{BANK_ACCOUNT}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('orderPage.accountOwner')}</span>
                  <span className="font-bold">{BANK_OWNER}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">{t('orderPage.qrInstruction')}</p>
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl inline-block">
                  <QRCodeSVG value={buildVietQR(total, 'HoaLanGiong')} size={160} level="M" />
                </div>
              </div>
            </div>
          )}
        </div>

        <button onClick={handlePlaceOrder}
          disabled={placing || !form.name || !form.phone || !address.fullAddress}
          className="w-full py-4 rounded-2xl text-white font-bold shadow-md disabled:opacity-50 text-base"
          style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
          {placing ? t('orderPage.placing') : `${t('orderPage.placeOrder')} · ${formatPrice(total)}`}
        </button>
      </div>
    );
  }

  // ── Orders history ────────────────────────────────────────────────────────────
  if (view === 'orders') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('shop')} className="text-gray-400 text-xl">←</button>
          <h2 className="text-lg font-bold text-gray-900">{t('orderPage.myOrders')}</h2>
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl mb-3">📦</span>
            <p className="text-gray-400 font-medium">{t('orderPage.noOrders')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-mono">#{order.id.slice(-6).toUpperCase()}</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {t(`orderStatus.${order.status}`)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                  <p className="font-bold text-red-500">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Shop ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
          <span className="text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('orderPage.searchPlaceholder')}
            className="bg-transparent text-sm flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-xs">✕</button>
          )}
        </div>
        <button onClick={() => setView('orders')}
          className="px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold shrink-0">
          📦
        </button>
        {cartCount > 0 && (
          <button onClick={() => setView('checkout')}
            className="relative px-3 py-2 rounded-full text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
            🛒 {cartCount}
          </button>
        )}
      </div>

      {/* Zalo CTA */}
      <a href={`https://zalo.me/${ZALO_PHONE}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-2xl border active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderColor: '#bfdbfe' }}>
        <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
          <span className="text-lg">💬</span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-blue-700 text-sm">{t('orderPage.askExpert')}</p>
          <p className="text-xs text-blue-400">{t('orderPage.zaloSupport')}</p>
        </div>
        <span className="text-blue-300 text-lg">›</span>
      </a>

      {/* Category tabs */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
              style={activeCategory === cat ? { background: 'linear-gradient(135deg, #f97316, #ef4444)' } : {}}>
              {cat === 'all' ? t('orderStatus.all') : cat}
            </button>
          ))}
        </div>
      )}

      {/* Product grid — TikTok style 2 columns */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="text-5xl mb-3">🌸</span>
          <p className="text-gray-400">{t('orderPage.noProducts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map(p => {
            const qty = cart[p.id] || 0;
            const priceNum = parsePrice(p.price);
            return (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {/* Ảnh */}
                <div className="relative aspect-square bg-gray-50">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl">🌸</span>
                      </div>
                  }
                  {/* Badge free ship */}
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {t('orderPage.freeShip')}
                  </span>
                </div>

                {/* Info */}
                <div className="p-2.5 space-y-1.5">
                  <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-tight">{p.name}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-red-500">
                        {priceNum > 0 ? formatPrice(priceNum) : p.price}
                      </p>
                      {(p as any).sales > 0 && (
                        <p className="text-[10px] text-gray-400">{t('orderPage.soldCount', { count: (p as any).sales })}</p>
                      )}
                    </div>

                    {qty === 0 ? (
                      <button onClick={() => addToCart(p.id)}
                        className="w-7 h-7 rounded-full text-white font-bold text-lg flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                        +
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button onClick={() => removeFromCart(p.id)}
                          className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-bold text-sm flex items-center justify-center">
                          −
                        </button>
                        <span className="font-bold text-gray-900 text-xs w-3 text-center">{qty}</span>
                        <button onClick={() => addToCart(p.id)}
                          className="w-6 h-6 rounded-full text-white font-bold text-sm flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
          <button onClick={() => setView('checkout')}
            className="w-full max-w-lg mx-auto flex items-center justify-between py-3.5 px-5 rounded-2xl text-white shadow-xl"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
            <span className="font-bold">🛒 {cartCount} sản phẩm</span>
            <span className="font-bold">{formatPrice(total)} →</span>
          </button>
        </div>
      )}
    </div>
  );
}
