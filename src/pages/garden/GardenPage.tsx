import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { useGarden, calcArea, LatLng, GardenZone } from '../../hooks/useGarden';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useOrchids } from '../../hooks/useOrchids';
import GridOverlay, { CellDetailPanel } from '../../components/garden/GardenGrid';
import { geocodeAddress } from '../../utils/geocoding';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import type { Orchid } from '../../types/index';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createDotIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function MapClickHandler({ onMapClick, drawing }: { onMapClick: (latlng: LatLng) => void; drawing: boolean }) {
  useMapEvents({
    click(e) {
      if (drawing) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Bay bản đồ tới vị trí mới khi tọa độ đổi (react-leaflet chỉ dùng center ở
// lần render đầu, nên khi cập nhật GPS phải chủ động gọi setView).
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface CellInfo {
  zoneId: string;
  row: number;
  col: number;
  orchid?: Orchid;
}

export default function GardenPage() {
  const { t } = useTranslation();
  const { profile, updateGardenLocation } = useUserProfile();
  const { orchids, updateOrchid } = useOrchids();

  // Đặt vị trí vườn: chạm bản đồ để đặt ghim
  const [settingLocation, setSettingLocation] = useState(false);
  // Tìm theo tên địa điểm
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeSearching, setPlaceSearching] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const initialCenter = profile?.gardenLocation || { lat: 10.8231, lng: 106.6297 };
  const { zones, addZone, deleteZone, updateZone } = useGarden(initialCenter);

  const [drawing, setDrawing] = useState(false);
  const [draftPoints, setDraftPoints] = useState<LatLng[]>([]);
  const [zoneName, setZoneName] = useState('');
  const [zoneNotes, setZoneNotes] = useState('');
  const [zoneQuantityInput, setZoneQuantityInput] = useState('');
  const [zoneRows, setZoneRows] = useState(4);
  const [zoneCols, setZoneCols] = useState(4);
  const [selectedZone, setSelectedZone] = useState<GardenZone | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCell, setSelectedCell] = useState<CellInfo | null>(null);
  const [showGridConfig, setShowGridConfig] = useState<string | null>(null); // zoneId
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Chạm bản đồ: đang đặt vị trí -> ghim vị trí vườn; đang vẽ -> thêm điểm vùng
  const handleMapClick = (latlng: LatLng) => {
    if (settingLocation) {
      updateGardenLocation({ lat: latlng.lat, lng: latlng.lng });
      setSettingLocation(false);
      return;
    }
    if (drawing) setDraftPoints(prev => [...prev, latlng]);
  };

  // Tìm vị trí theo tên địa điểm (dùng lại geocodeAddress)
  const handleSearchPlace = async () => {
    if (!placeQuery.trim()) return;
    setPlaceSearching(true);
    setPlaceError(null);
    try {
      const r = await geocodeAddress(placeQuery.trim());
      await updateGardenLocation({ lat: r.lat, lng: r.lng, address: r.displayName });
      setPlaceQuery('');
      setSettingLocation(false);
    } catch {
      setPlaceError(t('garden.locationSetup.notFound'));
    } finally {
      setPlaceSearching(false);
    }
  };

  // Dùng GPS thiết bị. Trên native (APK) dùng plugin Capacitor để xin quyền
  // và lấy vị trí đúng cách; navigator.geolocation không hoạt động trong
  // WebView. Trên web thì fallback navigator.geolocation.
  const handleUseGPS = async () => {
    setGpsLoading(true);
    setPlaceError(null);
    try {
      let pos: { lat: number; lng: number };

      if (Capacitor.isNativePlatform()) {
        // Xin quyền native trước
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted' && req.coarseLocation !== 'granted') {
            setPlaceError(t('garden.locationSetup.gpsPermissionDenied'));
            setGpsLoading(false);
            return;
          }
        }
        const p = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
        pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      } else {
        pos = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
          if (!navigator.geolocation) { reject(new Error('no geolocation')); return; }
          navigator.geolocation.getCurrentPosition(
            p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            err => reject(err),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        });
      }

      await updateGardenLocation(pos);
      setSettingLocation(false);
    } catch {
      setPlaceError(t('garden.locationSetup.gpsError'));
    } finally {
      setGpsLoading(false);
    }
  };

  const startDrawing = () => {
    setDraftPoints([]);
    setZoneName('');
    setZoneNotes('');
    setDrawing(true);
    setShowForm(false);
    setSelectedZone(null);
    setSelectedCell(null);
  };

  const finishDrawing = () => {
    if (draftPoints.length < 3) return;
    setDrawing(false);
    setShowForm(true);
    setZoneQuantityInput('');
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const cancelDrawing = () => {
    setDrawing(false);
    setDraftPoints([]);
    setShowForm(false);
    setZoneQuantityInput('');
  };

  const saveZone = () => {
    if (!zoneName.trim() || draftPoints.length < 3) return;
    const quantity = parseInt(zoneQuantityInput);
    addZone(zoneName.trim(), draftPoints, zoneNotes.trim() || undefined, !isNaN(quantity) && quantity > 0 ? quantity : undefined);
    setDraftPoints([]);
    setZoneName('');
    setZoneNotes('');
    setZoneQuantityInput('');
    setShowForm(false);
  };

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

  // Stats per zone
  const zoneStats = (zoneId: string) => {
    const inZone = orchids.filter(o => o.gardenPosition?.zoneId === zoneId);
    return { total: inZone.length, sold: inZone.filter(o => o.sold).length };
  };

  const draftColor = '#22c55e';
  const gardenLoc = profile?.gardenLocation;

  const configZone = showGridConfig ? zones.find(z => z.id === showGridConfig) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('garden.title')}</h1>
          <p className="text-xs text-gray-400">{t('garden.zonesDrawn', { count: zones.length })}</p>
        </div>
        {!drawing && !showForm && !settingLocation && (
          <div className="flex gap-2">
            <button
              onClick={() => { setSettingLocation(true); setPlaceError(null); }}
              className="border-2 border-green-500 text-green-700 px-3 py-2 rounded-xl text-sm font-semibold"
            >
              📍 {gardenLoc ? 'Đổi vị trí' : 'Đặt vị trí'}
            </button>
            <button
              onClick={startDrawing}
              className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm"
            >
              ✏️ {t('garden.drawZone')}
            </button>
          </div>
        )}
      </div>

      {/* Thanh đặt vị trí vườn */}
      {settingLocation && (
        <div className="mb-2 shrink-0 bg-white border border-green-200 rounded-xl p-3 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-green-700">📍 Xác định vị trí vườn</p>
            <button onClick={() => { setSettingLocation(false); setPlaceQuery(''); setPlaceError(null); }} className="text-gray-400 text-lg leading-none">×</button>
          </div>
          <p className="text-xs text-gray-500">Chạm lên bản đồ để đặt vị trí, hoặc tìm theo tên/địa chỉ, hoặc dùng GPS.</p>
          <div className="flex gap-2">
            <input
              value={placeQuery}
              onChange={e => setPlaceQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchPlace()}
              placeholder="VD: Chợ Lách, Bến Tre"
              className="input flex-1"
              disabled={placeSearching}
            />
            <button
              onClick={handleSearchPlace}
              disabled={!placeQuery.trim() || placeSearching}
              className="bg-green-600 text-white rounded-xl px-4 text-sm font-semibold disabled:opacity-50"
            >
              {placeSearching ? '...' : '🔍 Tìm'}
            </button>
          </div>
          <button
            onClick={handleUseGPS}
            disabled={gpsLoading}
            className="w-full border border-green-200 bg-green-50 text-green-700 rounded-xl py-2 text-sm font-medium disabled:opacity-50"
          >
            {gpsLoading ? 'Đang lấy vị trí...' : '📡 Dùng GPS thiết bị'}
          </button>
          {placeError && <p className="text-xs text-red-500">{placeError}</p>}
        </div>
      )}

      {/* Drawing instructions */}
      {drawing && (
        <div className="mb-2 shrink-0 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-green-700">
            {draftPoints.length === 0
              ? t('garden.tapFirstPoint')
              : draftPoints.length < 3
              ? t('garden.tapContinue', { count: draftPoints.length })
              : t('garden.canSave', { count: draftPoints.length })}
          </p>
          <div className="flex gap-1.5 shrink-0">
            {draftPoints.length > 0 && (
              <button onClick={() => setDraftPoints(p => p.slice(0, -1))} className="bg-white border border-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg text-xs font-medium">
                ↩ {t('garden.undo')}
              </button>
            )}
            {draftPoints.length >= 3 && (
              <button onClick={finishDrawing} className="bg-green-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                {t('garden.done')}
              </button>
            )}
            <button onClick={cancelDrawing} className="bg-red-50 text-red-400 px-2.5 py-1.5 rounded-lg text-xs">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Save zone form */}
      {showForm && (
        <div className="mb-2 shrink-0 bg-white border border-green-100 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 text-sm">{t('garden.nameZone')}</h3>
          <input ref={nameInputRef} value={zoneName} onChange={e => setZoneName(e.target.value)} placeholder={t('garden.namePlaceholder')} className="input" />
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Số lượng cây (tùy chọn)</label>
            <input type="number" min="0" step="1" value={zoneQuantityInput} onChange={e => setZoneQuantityInput(e.target.value)} placeholder="VD: 50" className="input" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium mb-1 block">Số hàng</label>
              <input type="number" min="1" max="20" value={zoneRows} onChange={e => setZoneRows(parseInt(e.target.value) || 4)} className="input" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium mb-1 block">Số cột</label>
              <input type="number" min="1" max="20" value={zoneCols} onChange={e => setZoneCols(parseInt(e.target.value) || 4)} className="input" />
            </div>
          </div>
          <input value={zoneNotes} onChange={e => setZoneNotes(e.target.value)} placeholder={t('garden.notesPlaceholder')} className="input" />
          <div className="flex gap-2">
            <button onClick={cancelDrawing} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600">{t('common.cancel')}</button>
            <button onClick={saveZone} disabled={!zoneName.trim()} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl py-2 text-sm font-semibold disabled:opacity-50">
              {t('garden.saveZone')}
            </button>
          </div>
        </div>
      )}

      {/* Grid config modal */}
      {configZone && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Cấu hình lưới: {configZone.name}</h3>
              <button onClick={() => setShowGridConfig(null)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium mb-1 block">Số hàng</label>
                <input
                  type="number" min="1" max="20"
                  defaultValue={configZone.gridRows ?? 4}
                  onChange={e => updateZone(configZone.id, { gridRows: parseInt(e.target.value) || 4 })}
                  className="input"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium mb-1 block">Số cột</label>
                <input
                  type="number" min="1" max="20"
                  defaultValue={configZone.gridCols ?? 4}
                  onChange={e => updateZone(configZone.id, { gridCols: parseInt(e.target.value) || 4 })}
                  className="input"
                />
              </div>
            </div>
            <button onClick={() => setShowGridConfig(null)} className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl py-2.5 font-semibold">
              Xong
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-md border border-gray-100 relative">
        <MapContainer center={[initialCenter.lat, initialCenter.lng]} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles © Esri" maxZoom={19} />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" attribution="" maxZoom={19} opacity={0.6} />

          <RecenterMap lat={initialCenter.lat} lng={initialCenter.lng} />
          <MapClickHandler onMapClick={handleMapClick} drawing={drawing || settingLocation} />

          {gardenLoc && <Marker position={[gardenLoc.lat, gardenLoc.lng]} />}

          {zones.map(zone => (
            <Polygon
              key={zone.id}
              positions={zone.points.map(p => [p.lat, p.lng])}
              pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.1, weight: 2 }}
              eventHandlers={{ click: () => !drawing && setSelectedZone(zone) }}
            />
          ))}

          {draftPoints.length >= 2 && (
            <Polygon positions={draftPoints.map(p => [p.lat, p.lng])} pathOptions={{ color: draftColor, fillColor: draftColor, fillOpacity: 0.2, weight: 2, dashArray: '6 4' }} />
          )}
          {draftPoints.map((pt, i) => (
            <Marker key={i} position={[pt.lat, pt.lng]} icon={createDotIcon(draftColor)} />
          ))}

          {!drawing && (
            <GridOverlay zones={zones} orchids={orchids} onCellClick={handleCellClick} />
          )}
        </MapContainer>

        {/* Cell detail panel */}
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

      {/* Zone list */}
      {zones.length > 0 && !drawing && !showForm && (
        <div className="mt-3 shrink-0 space-y-1.5 max-h-36 overflow-y-auto">
          {zones.map(zone => {
            const stats = zoneStats(zone.id);
            return (
              <div
                key={zone.id}
                className={`flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-sm border transition-all cursor-pointer ${selectedZone?.id === zone.id ? 'border-green-400' : 'border-gray-100'}`}
                onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
              >
                <div className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: zone.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{zone.name}</p>
                  <p className="text-xs text-gray-400">
                    📐 {Math.round(calcArea(zone.points))} m²
                    {zone.quantity ? ` · 🌱 ${zone.quantity} cây` : ` · ${t('garden.points', { count: zone.points.length })}`}
                    {stats.total > 0 && ` · 🌺 ${stats.total - stats.sold} còn · 🏷️ ${stats.sold} đã bán`}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setShowGridConfig(zone.id); }}
                  className="text-gray-400 hover:text-green-600 text-sm px-1"
                  title="Cấu hình lưới"
                >
                  ⚙️
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deleteZone(zone.id); if (selectedZone?.id === zone.id) setSelectedZone(null); }}
                  className="text-red-300 hover:text-red-500 text-lg px-1"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
