import { useTranslation } from 'react-i18next';
import { useProducts } from '../../hooks/useProducts';

export default function ShopPage() {
  const { products, loading } = useProducts();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('shopPage.title')}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t('shopPage.subtitle')}</p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-3">🧴</span>
          <p className="text-gray-500 font-medium">{t('shopPage.noProducts')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('shopPage.comingSoon')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map(p => (
            <a key={p.id} href={p.shopUrl} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl shadow-sm overflow-hidden active:scale-95 transition-transform flex flex-col">
              <div className="h-36 bg-gray-50 flex items-center justify-center overflow-hidden">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  : <span className="text-5xl">🧴</span>}
              </div>
              <div className="p-3 flex flex-col gap-1 flex-1">
                <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{p.name}</p>
                {p.type && (
                  <span className="self-start px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    {p.type}
                  </span>
                )}
                {p.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{p.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-2">
                  {p.price && <p className="text-sm font-bold text-green-600">{p.price}</p>}
                  <span className="text-xs bg-gradient-to-r from-[#fe2c55] to-[#ff6550] text-white px-2 py-1 rounded-lg font-semibold ml-auto">
                    TikTok Shop
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
