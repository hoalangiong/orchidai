import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { geocodeAddress, reverseGeocode } from '../../utils/geocoding';
import type { GardenLocation } from '../../hooks/useUserProfile';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationSetupModalProps {
  onLocationSet: (location: GardenLocation) => Promise<void>;
  onSkip: () => void;
}

export default function LocationSetupModal({ onLocationSet, onSkip }: LocationSetupModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'choice' | 'gps' | 'address'>('choice');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewLocation, setPreviewLocation] = useState<GardenLocation | null>(null);

  const handleUseGPS = async () => {
    setMode('gps');
    setLoading(true);
    setError(null);

    try {
      // Request permission first
      const permission = await Geolocation.checkPermissions();
      console.log('Permission status:', permission);

      if (permission.location !== 'granted') {
        const requested = await Geolocation.requestPermissions();
        console.log('Permission requested:', requested);

        if (requested.location !== 'granted') {
          setError(t('garden.locationSetup.gpsPermissionDenied'));
          setLoading(false);
          return;
        }
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });

      console.log('Position obtained:', position);

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Try to get address via reverse geocoding
      let addressName: string | undefined;
      try {
        addressName = await reverseGeocode(lat, lng);
      } catch (geocodeErr) {
        console.warn('Reverse geocoding failed:', geocodeErr);
        // Ignore reverse geocoding errors
      }

      const location: GardenLocation = { lat, lng, address: addressName };
      setPreviewLocation(location);
    } catch (err: any) {
      console.error('GPS error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);

      // Check specific error types
      if (err.message?.includes('location disabled') || err.message?.includes('Location services are not enabled') || err.code === 2) {
        setError(t('garden.locationSetup.gpsDisabled'));
      } else if (err.message?.includes('permission') || err.message?.includes('denied') || err.code === 1) {
        setError(t('garden.locationSetup.gpsPermissionDenied'));
      } else if (err.message?.includes('timeout') || err.code === 3) {
        setError(t('garden.locationSetup.gpsTimeout'));
      } else {
        setError(`${t('garden.locationSetup.gpsError')}\n\n${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAddress = async () => {
    if (!address.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await geocodeAddress(address);
      const location: GardenLocation = {
        lat: result.lat,
        lng: result.lng,
        address: result.displayName,
      };
      setPreviewLocation(location);
    } catch (err) {
      console.error('Geocoding error:', err);
      setError(t('garden.locationSetup.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewLocation) return;

    setLoading(true);
    setError(null);

    try {
      await onLocationSet(previewLocation);
    } catch (err) {
      console.error('Save location error:', err);
      setError('Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 rounded-t-3xl relative">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
          <h2 className="text-xl font-bold text-white">{t('garden.locationSetup.title')}</h2>
          <p className="text-green-100 text-sm mt-1">{t('garden.locationSetup.description')}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Choice mode */}
          {mode === 'choice' && (
            <div className="space-y-3">
              <button
                onClick={handleUseGPS}
                className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-500 active:scale-95 transition-all shadow-md"
              >
                📍 {t('garden.locationSetup.useGPS')}
              </button>

              <button
                onClick={() => setMode('address')}
                className="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-2xl font-semibold text-gray-700 border-2 border-green-200 bg-green-50 active:scale-95 transition-all"
              >
                🔍 {t('garden.locationSetup.enterAddress')}
              </button>

              <button
                onClick={onSkip}
                className="w-full py-3 text-sm text-gray-500 hover:text-gray-700"
              >
                {t('garden.locationSetup.skip')}
              </button>
            </div>
          )}

          {/* GPS mode */}
          {mode === 'gps' && !previewLocation && (
            <div className="text-center py-8">
              {loading ? (
                <>
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">{t('garden.locationSetup.searching')}</p>
                </>
              ) : error ? (
                <>
                  <p className="text-red-600 mb-4 whitespace-pre-line text-left px-4">{error}</p>
                  <button
                    onClick={() => setMode('choice')}
                    className="text-green-600 font-semibold"
                  >
                    ← {t('common.back')}
                  </button>
                </>
              ) : null}
            </div>
          )}

          {/* Address mode */}
          {mode === 'address' && !previewLocation && (
            <div className="space-y-3">
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchAddress()}
                placeholder={t('garden.locationSetup.addressPlaceholder')}
                className="input"
                disabled={loading}
              />

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setMode('choice')}
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600"
                  disabled={loading}
                >
                  {t('common.back')}
                </button>
                <button
                  onClick={handleSearchAddress}
                  disabled={!address.trim() || loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? t('garden.locationSetup.searching') : t('common.search')}
                </button>
              </div>
            </div>
          )}

          {/* Preview mode */}
          {previewLocation && (
            <div className="space-y-4">
              {/* Address display */}
              {previewLocation.address && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-xs text-green-600 font-medium mb-1">📍 {t('garden.locationSetup.foundLocation')}</p>
                  <p className="text-sm text-gray-700">{previewLocation.address}</p>
                </div>
              )}

              {/* Map preview */}
              <div className="h-64 rounded-2xl overflow-hidden border-2 border-gray-200">
                <MapContainer
                  center={[previewLocation.lat, previewLocation.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles © Esri"
                  />
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    opacity={0.6}
                  />
                  <Marker position={[previewLocation.lat, previewLocation.lng]} />
                </MapContainer>
              </div>

              {/* Confirm buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPreviewLocation(null);
                    setMode('choice');
                    setError(null);
                  }}
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600"
                  disabled={loading}
                >
                  {t('common.back')}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? t('common.saving') : t('garden.locationSetup.confirm')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
