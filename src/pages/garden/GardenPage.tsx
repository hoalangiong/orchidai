import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { useGarden, LatLng, GardenZone, calcArea } from '../../hooks/useGarden';
import { useUserProfile } from '../../hooks/useUserProfile';
import LocationSetupModal from '../../components/garden/LocationSetupModal';

function formatArea(m2: number): string {
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(2)} ha`;
  if (m2 >= 1) return `${m2.toFixed(1)} m²`;
  return `${(m2 * 10000).toFixed(0)} cm²`;
}

// Fix leaflet default icon
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

// Component lắng nghe click trên map
function MapClickHandler({ onMapClick, drawing }: { onMapClick: (latlng: LatLng) => void; drawing: boolean }) {
  useMapEvents({
    click(e) {
      if (drawing) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function GardenPage() {
  const { t } = useTranslation();
  const { profile, loading: profileLoading, updateGardenLocation, hasGardenLocation } = useUserProfile();
  const [showLocationSetup, setShowLocationSetup] = useState(false);

  // Initialize mapCenter from profile or default
  const initialCenter = profile?.gardenLocation || { lat: 10.8231, lng: 106.6297 };
  const { zones, addZone, deleteZone } = useGarden(initialCenter);

  const [drawing, setDrawing] = useState(false);
  const [draftPoints, setDraftPoints] = useState<LatLng[]>([]);
  const [zoneName, setZoneName] = useState('');
  const [zoneNotes, setZoneNotes] = useState('');
  const [zoneAreaInput, setZoneAreaInput] = useState('');
  const [selectedZone, setSelectedZone] = useState<GardenZone | null>(null);
  const [showForm, setShowForm] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Check if location setup is needed
  useEffect(() => {
    if (!profileLoading && !hasGardenLocation()) {
      setShowLocationSetup(true);
    }
  }, [profileLoading, hasGardenLocation]);

  // Diện tích tính được từ polygon đang vẽ
  const calculatedArea = draftPoints.length >= 3 ? calcArea(draftPoints) : 0;

  const handleMapClick = (latlng: LatLng) => {
    setDraftPoints(prev => [...prev, latlng]);
  };

  const handleLocationSet = async (location: { lat: number; lng: number; address?: string }) => {
    await updateGardenLocation(location);
    setShowLocationSetup(false);
  };

  const handleSkipLocationSetup = () => {
    setShowLocationSetup(false);
  };

  const startDrawing = () => {
    setDraftPoints([]);
    setZoneName('');
    setZoneNotes('');
    setDrawing(true);
    setShowForm(false);
    setSelectedZone(null);
  };

  const undoLastPoint = () => {
    setDraftPoints(prev => prev.slice(0, -1));
  };

  const finishDrawing = () => {
    if (draftPoints.length < 3) return;
    setDrawing(false);
    setShowForm(true);
    // Pre-fill diện tích tính được
    setZoneAreaInput(calculatedArea > 0 ? calculatedArea.toFixed(1) : '');
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const cancelDrawing = () => {
    setDrawing(false);
    setDraftPoints([]);
    setShowForm(false);
    setZoneAreaInput('');
  };

  const saveZone = () => {
    if (!zoneName.trim() || draftPoints.length < 3) return;
    const manualArea = parseFloat(zoneAreaInput);
    const area = !isNaN(manualArea) && manualArea > 0 ? manualArea : calculatedArea;
    addZone(zoneName.trim(), draftPoints, zoneNotes.trim() || undefined, area);
    setDraftPoints([]);
    setZoneName('');
    setZoneNotes('');
    setZoneAreaInput('');
    setShowForm(false);
  };

  const draftColor = '#22c55e';

  if (showLocationSetup) {
    return <LocationSetupModal onLocationSet={handleLocationSet} onSkip={handleSkipLocationSetup} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('garden.title')}</h1>
          <p className="text-xs text-gray-400">{t('garden.zonesDrawn', { count: zones.length })}</p>
        </div>
        {!drawing && !showForm && (
          <button
            onClick={startDrawing}
            className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm"
          >
            ✏️ {t('garden.drawZone')}
          </button>
        )}
      </div>

      {/* Drawing instructions */}
      {drawing && (
        <div className="mb-2 shrink-0 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-green-700">
              {draftPoints.length === 0
                ? t('garden.tapFirstPoint')
                : draftPoints.length < 3
                ? t('garden.tapContinue', { count: draftPoints.length })
                : t('garden.canSave', { count: draftPoints.length })}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {draftPoints.length > 0 && (
              <button onClick={undoLastPoint} className="bg-white border border-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg text-xs font-medium">
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
          <input
            ref={nameInputRef}
            value={zoneName}
            onChange={e => setZoneName(e.target.value)}
            placeholder={t('garden.namePlaceholder')}
            className="input"
          />
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">
              {t('garden.area')}
              {calculatedArea > 0 && (
                <span className="ml-2 text-green-600 font-semibold">
                  📐 {t('garden.calculated')}: {formatArea(calculatedArea)}
                </span>
              )}
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={zoneAreaInput}
              onChange={e => setZoneAreaInput(e.target.value)}
              placeholder={calculatedArea > 0 ? `${calculatedArea.toFixed(1)} (${t('garden.autoCalculated')})` : t('garden.manualInput')}
              className="input"
            />
          </div>
          <input
            value={zoneNotes}
            onChange={e => setZoneNotes(e.target.value)}
            placeholder={t('garden.notesPlaceholder')}
            className="input"
          />
          <div className="flex gap-2">
            <button onClick={cancelDrawing} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600">{t('common.cancel')}</button>
            <button
              onClick={saveZone}
              disabled={!zoneName.trim()}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl py-2 text-sm font-semibold disabled:opacity-50"
            >
              {t('garden.saveZone')}
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-md border border-gray-100 relative">
        <MapContainer
          center={[initialCenter.lat, initialCenter.lng]}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          {/* Esri Satellite tile */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
            maxZoom={19}
          />
          {/* Street labels overlay */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution=""
            maxZoom={19}
            opacity={0.6}
          />

          <MapClickHandler onMapClick={handleMapClick} drawing={drawing} />

          {/* Saved zones */}
          {zones.map(zone => (
            <Polygon
              key={zone.id}
              positions={zone.points.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.25,
                weight: 2,
              }}
              eventHandlers={{ click: () => setSelectedZone(zone) }}
            />
          ))}

          {/* Draft polygon */}
          {draftPoints.length >= 2 && (
            <Polygon
              positions={draftPoints.map(p => [p.lat, p.lng])}
              pathOptions={{ color: draftColor, fillColor: draftColor, fillOpacity: 0.2, weight: 2, dashArray: '6 4' }}
            />
          )}

          {/* Draft markers */}
          {draftPoints.map((pt, i) => (
            <Marker key={i} position={[pt.lat, pt.lng]} icon={createDotIcon(draftColor)} />
          ))}
        </MapContainer>
      </div>

      {/* Zone list */}
      {zones.length > 0 && !drawing && !showForm && (
        <div className="mt-3 shrink-0 space-y-1.5 max-h-36 overflow-y-auto">
          {zones.map(zone => (
            <div
              key={zone.id}
              className={`flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-sm border transition-all cursor-pointer ${selectedZone?.id === zone.id ? 'border-green-400' : 'border-gray-100'}`}
              onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
            >
              <div className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: zone.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{zone.name}</p>
                {zone.notes && <p className="text-xs text-gray-400 truncate">{zone.notes}</p>}
                <p className="text-xs text-gray-400">
                  {zone.area ? `📐 ${formatArea(zone.area)}` : t('garden.points', { count: zone.points.length })}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteZone(zone.id); if (selectedZone?.id === zone.id) setSelectedZone(null); }}
                className="text-red-300 hover:text-red-500 text-lg px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
