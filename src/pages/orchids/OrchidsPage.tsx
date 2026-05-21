import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useOrchids } from '../../hooks/useOrchids';
import { useCareLog } from '../../hooks/useCareLog';
import { useOrchidImages } from '../../hooks/useOrchidImages';
import { Orchid, CareLog } from '../../types/index';
import { useSmartReminders } from '../../hooks/useSmartReminders';
import { useGarden } from '../../hooks/useGarden';
import { useUserProfile } from '../../hooks/useUserProfile';
import GridOverlay, { CellDetailPanel } from '../../components/garden/GardenGrid';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function getStatusConfig(t: any): Record<Orchid['healthStatus'], { label: string; color: string; dot: string }> {
  return {
    healthy:  { label: t('orchids.status.healthy'), color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
    warning:  { label: t('orchids.status.warning'), color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
    sick:     { label: t('orchids.status.sick'), color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  };
}

function getLogTypes(t: any): { type: CareLog['type']; icon: string; label: string }[] {
  return [
    { type: 'watering',    icon: '💧', label: t('orchids.logTypes.watering') },
    { type: 'fertilizing', icon: '🌿', label: t('orchids.logTypes.fertilizing') },
    { type: 'repotting',   icon: '🪴', label: t('orchids.logTypes.repotting') },
    { type: 'pruning',     icon: '✂️', label: t('orchids.logTypes.pruning') },
    { type: 'blooming',    icon: '🌸', label: t('orchids.logTypes.blooming') },
    { type: 'other',       icon: '📝', label: t('orchids.logTypes.other') },
  ];
}

function getOrchidSpecies(t: any): string[] {
  return [
    t('orchids.species.phalaenopsis'),
    t('orchids.species.dendrobium'),
    t('orchids.species.cattleya'),
    t('orchids.species.oncidium'),
    t('orchids.species.vanda'),
    t('orchids.species.mokara'),
    t('orchids.species.cymbidium'),
    t('orchids.species.rhynchostylis'),
    t('orchids.species.other'),
  ];
}

function getLogConfig(type: CareLog['type'], t: any) {
  const logTypes = getLogTypes(t);
  return logTypes.find(lt => lt.type === type) ?? logTypes[logTypes.length - 1];
}

function nextDueLabel(last: string | undefined, interval: number | undefined, t: any): string | null {
  if (!last || !interval) return null;
  const due = new Date(last);
  due.setDate(due.getDate() + interval);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return t('orchids.overdueDays', { days: -diff });
  if (diff === 0) return t('orchids.today');
  return t('orchids.daysLeft', { days: diff });
}

type EditForm = {
  name: string; species: string; location: string; quantity: number; variety: string;
  purchaseDate: string; notes: string; healthStatus: Orchid['healthStatus'];
  imageUrl: string; wateringInterval: number; fertilizingInterval: number;
  price: number;
};

function OrchidDetail({ orchid, onBack, onDelete }: { orchid: Orchid; onBack: () => void; onDelete: () => void }) {
  const { t } = useTranslation();
  const { logs, addLog, deleteLog } = useCareLog(orchid.id);
  const { images, addImage, deleteImage } = useOrchidImages(orchid.id);
  const { updateOrchid } = useOrchids();
  const [showLogForm, setShowLogForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [logForm, setLogForm] = useState<{ type: CareLog['type']; date: string; note: string }>({
    type: 'watering',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [editForm, setEditForm] = useState<EditForm>({
    name: orchid.name,
    species: orchid.species,
    location: orchid.location,
    quantity: orchid.quantity ?? 0,
    variety: orchid.variety ?? '',
    purchaseDate: orchid.purchaseDate,
    notes: orchid.notes ?? '',
    healthStatus: orchid.healthStatus,
    imageUrl: orchid.imageUrl ?? '',
    wateringInterval: orchid.wateringInterval ?? 2,
    fertilizingInterval: orchid.fertilizingInterval ?? 14,
    price: orchid.price ?? 0,
  });
  const editFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const STATUS_CONFIG = getStatusConfig(t);
  const LOG_TYPES = getLogTypes(t);
  const ORCHID_SPECIES = getOrchidSpecies(t);
  const cfg = STATUS_CONFIG[orchid.healthStatus];
  const today = new Date().toISOString().split('T')[0];

  const coverImage = editForm.imageUrl || (images.length > 0 ? images[0].url : null);

  const handleAddLog = async () => {
    await addLog({ type: logForm.type, date: logForm.date, note: logForm.note, createdAt: Date.now() });
    setLogForm({ type: 'watering', date: new Date().toISOString().split('T')[0], note: '' });
    setShowLogForm(false);
  };

  const markWatered = async () => {
    await updateOrchid(orchid.id, { lastWatered: today });
    await addLog({ type: 'watering', date: today, note: '', createdAt: Date.now() });
  };

  const markFertilized = async () => {
    await updateOrchid(orchid.id, { lastFertilized: today });
    await addLog({ type: 'fertilizing', date: today, note: '', createdAt: Date.now() });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditForm(f => ({ ...f, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    await updateOrchid(orchid.id, {
      name: editForm.name,
      species: editForm.species,
      location: editForm.location,
      quantity: editForm.quantity,
      variety: editForm.variety || undefined,
      purchaseDate: editForm.purchaseDate,
      notes: editForm.notes || undefined,
      healthStatus: editForm.healthStatus,
      imageUrl: editForm.imageUrl || undefined,
      wateringInterval: editForm.wateringInterval,
      fertilizingInterval: editForm.fertilizingInterval,
      price: editForm.price || undefined,
    });
    setShowEdit(false);
  };

  const handleAddGalleryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      addImage({ url: reader.result as string, createdAt: Date.now() });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (showEdit) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowEdit(false)} className="text-gray-400">✕</button>
          <h2 className="text-lg font-bold text-gray-900">{t('orchids.editOrchid')}</h2>
        </div>

        <div
          onClick={() => editFileRef.current?.click()}
          className="h-44 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-200 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors overflow-hidden"
        >
          {editForm.imageUrl
            ? <img src={editForm.imageUrl} className="w-full h-full object-cover" alt="preview" />
            : <>
                <span className="text-4xl mb-2">📷</span>
                <p className="text-sm text-gray-500">{t('orchids.takeOrSelectPhoto')}</p>
              </>
          }
          <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <Field label={t('orchids.fields.name')}>
            <input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="input" />
          </Field>
          <Field label={t('orchids.fields.species')}>
            <select required value={editForm.species} onChange={e => setEditForm(f => ({ ...f, species: e.target.value }))} className="input">
              <option value="">{t('orchids.selectSpecies')}</option>
              {ORCHID_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label={t('orchids.fields.variety')}>
            <input value={editForm.variety} onChange={e => setEditForm(f => ({ ...f, variety: e.target.value }))} placeholder={t('orchids.varietyPlaceholder')} className="input" />
          </Field>
          <Field label={t('orchids.fields.location')}>
            <input required value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} className="input" />
          </Field>
          <Field label="Số lượng cây">
            <input type="number" min="0" step="1" value={editForm.quantity || ''} onChange={e => setEditForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} placeholder="VD: 5" className="input" />
          </Field>
          <Field label={t('orchids.fields.purchaseDate')}>
            <input type="date" value={editForm.purchaseDate} onChange={e => setEditForm(f => ({ ...f, purchaseDate: e.target.value }))} className="input" />
          </Field>
          <Field label={t('orchids.fields.healthStatus')}>
            <div className="flex gap-2">
              {(Object.entries(STATUS_CONFIG) as [Orchid['healthStatus'], typeof STATUS_CONFIG['healthy']][]).map(([key, c]) => (
                <button key={key} type="button"
                  onClick={() => setEditForm(f => ({ ...f, healthStatus: key }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${editForm.healthStatus === key ? c.color + ' border-transparent' : 'border-gray-200 text-gray-500'}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot} mr-1`} />
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t('orchids.fields.wateringInterval')}>
            <input type="number" min="1" max="30" value={editForm.wateringInterval} onChange={e => setEditForm(f => ({ ...f, wateringInterval: parseInt(e.target.value) || 2 }))} className="input" />
          </Field>
          <Field label={t('orchids.fields.fertilizingInterval')}>
            <input type="number" min="1" max="90" value={editForm.fertilizingInterval} onChange={e => setEditForm(f => ({ ...f, fertilizingInterval: parseInt(e.target.value) || 14 }))} className="input" />
          </Field>
          <Field label="Giá (đ)">
            <input type="number" min="0" step="1000" value={editForm.price || ''} onChange={e => setEditForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} placeholder="VD: 150000" className="input" />
          </Field>
          <Field label={t('orchids.fields.notes')}>
            <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="input resize-none" />
          </Field>
        </div>

        <button onClick={handleSaveEdit}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl py-3.5 font-semibold shadow-md">
          {t('orchids.saveChanges')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxUrl(null)}
        >
          <img src={lightboxUrl} className="max-w-full max-h-full object-contain" alt="" />
          <button className="absolute top-4 right-4 text-white text-3xl leading-none">✕</button>
        </div>
      )}

      <button onClick={onBack} className="flex items-center gap-2 text-green-600 font-medium">
        ← {t('orchids.back')}
      </button>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="h-56 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center relative">
          {coverImage
            ? <img src={coverImage} className="w-full h-full object-cover" alt={orchid.name} />
            : <span className="text-8xl">🌺</span>
          }
          <div className="absolute top-3 right-3">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900">{orchid.name}</h2>
          <p className="text-green-600 font-medium">{orchid.species}</p>
          {orchid.variety && <p className="text-gray-500 text-sm">{orchid.variety}</p>}
          <div className="mt-4 space-y-2">
            <InfoRow icon="📍" label={t('orchids.fields.location')} value={orchid.location} />
            <InfoRow icon="📅" label={t('orchids.fields.purchaseDate')} value={orchid.purchaseDate} />
          </div>

          {(orchid.wateringInterval || orchid.fertilizingInterval) && (
            <div className="mt-4 space-y-2">
              {orchid.wateringInterval && (
                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-blue-700">💧 {t('orchids.wateringSchedule', { days: orchid.wateringInterval })}</p>
                    <p className="text-xs text-blue-500 mt-0.5">
                      {orchid.lastWatered
                        ? `${t('orchids.lastTime')}: ${orchid.lastWatered} · ${nextDueLabel(orchid.lastWatered, orchid.wateringInterval, t)}`
                        : t('orchids.noRecordYet')}
                    </p>
                  </div>
                  <button onClick={markWatered}
                    className="shrink-0 ml-2 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform">
                    {t('orchids.watered')}
                  </button>
                </div>
              )}
              {orchid.fertilizingInterval && (
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-green-700">🌱 {t('orchids.fertilizingSchedule', { days: orchid.fertilizingInterval })}</p>
                    <p className="text-xs text-green-500 mt-0.5">
                      {orchid.lastFertilized
                        ? `${t('orchids.lastTime')}: ${orchid.lastFertilized} · ${nextDueLabel(orchid.lastFertilized, orchid.fertilizingInterval, t)}`
                        : t('orchids.noRecordYet')}
                    </p>
                  </div>
                  <button onClick={markFertilized}
                    className="shrink-0 ml-2 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform">
                    {t('orchids.fertilized')}
                  </button>
                </div>
              )}
            </div>
          )}

          {orchid.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-medium mb-1">{t('orchids.fields.notes')}</p>
              <p className="text-sm text-gray-700">{orchid.notes}</p>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button onClick={() => setShowEdit(true)}
              className="flex-1 py-2.5 rounded-xl border border-green-200 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors">
              ✏️ {t('orchids.edit')}
            </button>
            <button onClick={onDelete}
              className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
              {t('orchids.deleteOrchid')}
            </button>
          </div>
        </div>
      </div>

      {/* Photo gallery */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">📷 {t('orchids.photoGallery')}</h3>
          <button onClick={() => galleryFileRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold">
            + {t('orchids.addPhoto')}
          </button>
          <input ref={galleryFileRef} type="file" accept="image/*" className="hidden" onChange={handleAddGalleryPhoto} />
        </div>

        {images.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">{t('orchids.noPhotos')}</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map(img => (
              <div key={img.id} className="relative shrink-0">
                <img
                  src={img.url}
                  onClick={() => setLightboxUrl(img.url)}
                  className="w-24 h-24 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  alt=""
                />
                <button
                  onClick={() => deleteImage(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full text-xs flex items-center justify-center">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Care log section */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">📋 {t('orchids.careLog')}</h3>
          <button onClick={() => setShowLogForm(v => !v)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold">
            + {t('orchids.addLog')}
          </button>
        </div>

        {showLogForm && (
          <div className="border border-green-100 rounded-xl p-3 space-y-3 bg-green-50">
            <div className="grid grid-cols-3 gap-2">
              {LOG_TYPES.map(lt => (
                <button key={lt.type} type="button" onClick={() => setLogForm(f => ({ ...f, type: lt.type }))}
                  className={`py-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-0.5 transition-all
                    ${logForm.type === lt.type ? 'border-green-500 bg-white text-green-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500'}`}>
                  <span className="text-lg">{lt.icon}</span>
                  {lt.label}
                </button>
              ))}
            </div>
            <input type="date" value={logForm.date} onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))} className="input" />
            <input value={logForm.note} onChange={e => setLogForm(f => ({ ...f, note: e.target.value }))} placeholder={t('orchids.notePlaceholder')} className="input" />
            <div className="flex gap-2">
              <button onClick={() => setShowLogForm(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm">{t('common.cancel')}</button>
              <button onClick={handleAddLog} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-semibold">{t('common.save')}</button>
            </div>
          </div>
        )}

        {logs.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">{t('orchids.noLogs')}</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {logs.map(log => {
              const lc = getLogConfig(log.type, t);
              return (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xl mt-0.5">{lc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{lc.label}</p>
                    <p className="text-xs text-gray-400">{log.date}</p>
                    {log.note && <p className="text-xs text-gray-500 mt-0.5">{log.note}</p>}
                  </div>
                  <button onClick={() => deleteLog(log.id)} className="text-gray-300 hover:text-red-400 text-sm shrink-0 mt-0.5">✕</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface CellInfo {
  zoneId: string;
  row: number;
  col: number;
  orchid?: Orchid;
}

function GardenMapTab({ orchids, updateOrchid }: { orchids: Orchid[]; updateOrchid: (id: string, data: Partial<Orchid>) => Promise<void> }) {
  const { profile } = useUserProfile();
  const initialCenter = profile?.gardenLocation || { lat: 10.8231, lng: 106.6297 };
  const { zones } = useGarden(initialCenter);
  const [selectedCell, setSelectedCell] = useState<CellInfo | null>(null);

  const handleCellClick = useCallback((cell: CellInfo) => {
    setSelectedCell(cell);
  }, []);

  const handleAssign = async (orchidId: string) => {
    if (!selectedCell) return;
    await updateOrchid(orchidId, {
      gardenPosition: { zoneId: selectedCell.zoneId, row: selectedCell.row, col: selectedCell.col },
    });
    setSelectedCell(null);
  };

  const handleUnassign = async () => {
    if (!selectedCell?.orchid) return;
    await updateOrchid(selectedCell.orchid.id, { gardenPosition: undefined });
    setSelectedCell(null);
  };

  const handleToggleSold = async () => {
    if (!selectedCell?.orchid) return;
    await updateOrchid(selectedCell.orchid.id, { sold: !selectedCell.orchid.sold });
    setSelectedCell(null);
  };

  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="text-5xl mb-4">🗺️</span>
        <p className="text-gray-500 font-medium">Chưa có khu vườn nào</p>
        <p className="text-gray-400 text-sm mt-1">Vào trang Vườn để vẽ khu vực trồng lan</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-md" style={{ height: 'calc(100vh - 14rem)' }}>
      <MapContainer center={[initialCenter.lat, initialCenter.lng]} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles © Esri" maxZoom={19} />
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" attribution="" maxZoom={19} opacity={0.6} />
        {zones.map(zone => (
          <Polygon
            key={zone.id}
            positions={zone.points.map(p => [p.lat, p.lng])}
            pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.1, weight: 2 }}
          />
        ))}
        <GridOverlay zones={zones} orchids={orchids} onCellClick={handleCellClick} />
      </MapContainer>

      {selectedCell && (() => {
        const zone = zones.find(z => z.id === selectedCell.zoneId);
        if (!zone) return null;
        return (
          <CellDetailPanel
            cell={selectedCell}
            zone={zone}
            orchids={orchids}
            onClose={() => setSelectedCell(null)}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            onToggleSold={handleToggleSold}
          />
        );
      })()}
    </div>
  );
}

export default function OrchidsPage() {
  const { t } = useTranslation();
  const { orchids, addOrchid, deleteOrchid, updateOrchid } = useOrchids();
  const [tab, setTab] = useState<'list' | 'map'>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedOrchid, setSelectedOrchid] = useState<Orchid | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', species: '', location: '', quantity: 0, variety: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '', healthStatus: 'healthy' as Orchid['healthStatus'],
    imageUrl: '',
    wateringInterval: 2,
    fertilizingInterval: 14,
    price: 0,
  });
  const reminders = useSmartReminders(orchids);
  const STATUS_CONFIG = getStatusConfig(t);
  const ORCHID_SPECIES = getOrchidSpecies(t);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setForm(p => ({ ...p, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    addOrchid(form);
    setForm({ name: '', species: '', location: '', quantity: 0, variety: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '', healthStatus: 'healthy', imageUrl: '', wateringInterval: 2, fertilizingInterval: 14, price: 0 });
    setImagePreview('');
    setShowForm(false);
  };

  // Sync selectedOrchid with latest data from Firestore
  const liveOrchid = selectedOrchid ? orchids.find(o => o.id === selectedOrchid.id) ?? selectedOrchid : null;

  if (liveOrchid) {
    return (
      <OrchidDetail
        orchid={liveOrchid}
        onBack={() => setSelectedOrchid(null)}
        onDelete={() => { deleteOrchid(liveOrchid.id); setSelectedOrchid(null); }}
      />
    );
  }

  if (showForm) return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400">✕</button>
        <h2 className="text-lg font-bold text-gray-900">{t('orchids.addNewOrchid')}</h2>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="h-44 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-200 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors overflow-hidden"
      >
        {imagePreview
          ? <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
          : <>
              <span className="text-4xl mb-2">📷</span>
              <p className="text-sm text-gray-500">{t('orchids.takeOrSelectPhoto')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('orchids.tapToAddPhoto')}</p>
            </>
        }
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
        <Field label={t('orchids.fields.nameRequired')}>
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t('orchids.placeholders.name')} className="input" />
        </Field>
        <Field label={t('orchids.fields.speciesRequired')}>
          <select required value={form.species} onChange={e => setForm(p => ({ ...p, species: e.target.value }))} className="input">
            <option value="">{t('orchids.selectSpecies')}</option>
            {ORCHID_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={t('orchids.fields.locationRequired')}>
          <input required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder={t('orchids.placeholders.location')} className="input" />
        </Field>
        <Field label="Số lượng cây">
          <input type="number" min="0" step="1" value={form.quantity || ''} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} placeholder="VD: 5" className="input" />
        </Field>
        <Field label={t('orchids.fields.healthStatus')}>
          <div className="flex gap-2">
            {(Object.entries(STATUS_CONFIG) as [Orchid['healthStatus'], typeof STATUS_CONFIG['healthy']][]).map(([key, cfg]) => (
              <button key={key} type="button"
                onClick={() => setForm(p => ({ ...p, healthStatus: key }))}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${form.healthStatus === key ? cfg.color + ' border-transparent' : 'border-gray-200 text-gray-500'}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1`} />
                {cfg.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label={t('orchids.fields.wateringInterval')}>
          <input type="number" min="1" max="30" value={form.wateringInterval} onChange={e => setForm(p => ({ ...p, wateringInterval: parseInt(e.target.value) || 2 }))} className="input" />
        </Field>
        <Field label={t('orchids.fields.fertilizingInterval')}>
          <input type="number" min="1" max="90" value={form.fertilizingInterval} onChange={e => setForm(p => ({ ...p, fertilizingInterval: parseInt(e.target.value) || 14 }))} className="input" />
        </Field>
        <Field label="Giá (đ)">
          <input type="number" min="0" step="1000" value={form.price || ''} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} placeholder="VD: 150000" className="input" />
        </Field>
        <Field label={t('orchids.fields.notes')}>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder={t('orchids.placeholders.notes')} className="input resize-none" />
        </Field>
      </div>

      <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl py-3.5 font-semibold shadow-md">
        {t('orchids.addOrchidButton')}
      </button>
    </form>
  );

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('list')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
          >
            📋 Danh sách
          </button>
          <button
            onClick={() => setTab('map')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'map' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
          >
            🗺️ Sơ đồ vườn
          </button>
        </div>
        {tab === 'list' && (
          <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
            {t('orchids.addButton')}
          </button>
        )}
      </div>

      {tab === 'map' ? (
        <GardenMapTab orchids={orchids} updateOrchid={updateOrchid} />
      ) : (
        <>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('orchids.myGarden')}</h1>
            <p className="text-sm text-gray-400">{t('orchids.orchidCount', { count: orchids.length })}</p>
          </div>

          {reminders.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 space-y-2">
              <p className="text-xs font-bold text-orange-700">{t('orchids.needsCareNow')}</p>
              {reminders.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span>{r.type === 'watering' ? '💧' : '🌱'} {r.orchidName}</span>
                  <span className="text-orange-600 font-semibold">
                    {r.daysOverdue === 0 ? t('orchids.today') : t('orchids.overdueDays', { days: r.daysOverdue })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {orchids.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(Object.entries(STATUS_CONFIG) as [Orchid['healthStatus'], typeof STATUS_CONFIG['healthy']][]).map(([key, cfg]) => {
                const count = orchids.filter(o => o.healthStatus === key).length;
                if (count === 0) return null;
                return (
                  <span key={key} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}: {count}
                  </span>
                );
              })}
            </div>
          )}

          {orchids.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-5xl">🌺</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('orchids.emptyGarden')}</h3>
              <p className="text-gray-400 text-sm mb-6">{t('orchids.addFirstOrchid')}</p>
              <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-3 rounded-2xl font-semibold shadow-md">
                {t('orchids.addFirstButton')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {orchids.map(orchid => {
                const cfg = STATUS_CONFIG[orchid.healthStatus];
                return (
                  <div key={orchid.id} onClick={() => setSelectedOrchid(orchid)} className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <div className="h-36 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center relative">
                      {orchid.imageUrl
                        ? <img src={orchid.imageUrl} className="w-full h-full object-cover" alt={orchid.name} />
                        : <span className="text-5xl">🌺</span>
                      }
                      <div className="absolute top-2 right-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} block shadow`} />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{orchid.name}</h3>
                      <p className="text-xs text-gray-400 truncate">{orchid.species}</p>
                      <p className="text-xs text-gray-300 mt-1 truncate">📍 {orchid.location}</p>
                    </div>
                  </div>
                );
              })}
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

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-base">{icon}</span>
      <span className="text-gray-400 w-20">{label}</span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  );
}
