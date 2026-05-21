import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GardenZone } from '../../hooks/useGarden';
import type { Orchid } from '../../types/index';

interface CellInfo {
  zoneId: string;
  row: number;
  col: number;
  orchid?: Orchid;
}

interface Props {
  zones: GardenZone[];
  orchids: Orchid[];
  onCellClick: (cell: CellInfo) => void;
}

function getStatusColor(orchid?: Orchid): string {
  if (!orchid) return 'rgba(255,255,255,0.15)';
  if (orchid.sold) return 'rgba(156,163,175,0.7)';
  switch (orchid.healthStatus) {
    case 'healthy': return 'rgba(34,197,94,0.75)';
    case 'warning': return 'rgba(234,179,8,0.75)';
    case 'sick':    return 'rgba(239,68,68,0.75)';
    default:        return 'rgba(255,255,255,0.3)';
  }
}

function GridOverlay({ zones, orchids, onCellClick }: Props) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.clearLayers();
    } else {
      layerRef.current = L.layerGroup().addTo(map);
    }

    zones.forEach(zone => {
      if (zone.points.length < 3) return;
      const rows = zone.gridRows ?? 4;
      const cols = zone.gridCols ?? 4;

      // Bounding box của zone
      const lats = zone.points.map(p => p.lat);
      const lngs = zone.points.map(p => p.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const cellLatH = (maxLat - minLat) / rows;
      const cellLngW = (maxLng - minLng) / cols;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellMinLat = minLat + r * cellLatH;
          const cellMaxLat = cellMinLat + cellLatH;
          const cellMinLng = minLng + c * cellLngW;
          const cellMaxLng = cellMinLng + cellLngW;
          const centerLat = (cellMinLat + cellMaxLat) / 2;
          const centerLng = (cellMinLng + cellMaxLng) / 2;

          const orchid = orchids.find(
            o => o.gardenPosition?.zoneId === zone.id &&
                 o.gardenPosition?.row === r &&
                 o.gardenPosition?.col === c
          );

          const bg = getStatusColor(orchid);
          const label = orchid
            ? `<div style="font-size:9px;font-weight:600;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.8);line-height:1.2;text-align:center;padding:1px 2px;overflow:hidden;max-width:100%">
                ${orchid.sold ? '🏷️' : '🌺'} ${orchid.name}
               </div>`
            : `<div style="font-size:9px;color:rgba(255,255,255,0.5);text-align:center">+</div>`;

          const sw = map.latLngToLayerPoint([cellMinLat, cellMinLng]);
          const ne = map.latLngToLayerPoint([cellMaxLat, cellMaxLng]);
          const pxW = Math.abs(ne.x - sw.x);
          const pxH = Math.abs(ne.y - sw.y);

          const marker = L.marker([centerLat, centerLng], {
            icon: L.divIcon({
              className: '',
              html: `<div style="
                width:${pxW}px;height:${pxH}px;
                background:${bg};
                border:1px solid rgba(255,255,255,0.3);
                border-radius:4px;
                display:flex;align-items:center;justify-content:center;
                cursor:pointer;
                box-sizing:border-box;
              ">${label}</div>`,
              iconSize: [pxW, pxH],
              iconAnchor: [pxW / 2, pxH / 2],
            }),
            interactive: true,
          });

          marker.on('click', () => {
            onCellClick({ zoneId: zone.id, row: r, col: c, orchid });
          });

          layerRef.current!.addLayer(marker);
        }
      }
    });

    // Re-render on zoom
    const redraw = () => {
      if (layerRef.current) {
        layerRef.current.clearLayers();
      }
      zones.forEach(zone => {
        if (zone.points.length < 3) return;
        const rows = zone.gridRows ?? 4;
        const cols = zone.gridCols ?? 4;
        const lats = zone.points.map(p => p.lat);
        const lngs = zone.points.map(p => p.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const cellLatH = (maxLat - minLat) / rows;
        const cellLngW = (maxLng - minLng) / cols;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cellMinLat = minLat + r * cellLatH;
            const cellMaxLat = cellMinLat + cellLatH;
            const cellMinLng = minLng + c * cellLngW;
            const cellMaxLng = cellMinLng + cellLngW;
            const centerLat = (cellMinLat + cellMaxLat) / 2;
            const centerLng = (cellMinLng + cellMaxLng) / 2;

            const orchid = orchids.find(
              o => o.gardenPosition?.zoneId === zone.id &&
                   o.gardenPosition?.row === r &&
                   o.gardenPosition?.col === c
            );

            const bg = getStatusColor(orchid);
            const label = orchid
              ? `<div style="font-size:9px;font-weight:600;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.8);line-height:1.2;text-align:center;padding:1px 2px;overflow:hidden;max-width:100%">
                  ${orchid.sold ? '🏷️' : '🌺'} ${orchid.name}
                 </div>`
              : `<div style="font-size:9px;color:rgba(255,255,255,0.5);text-align:center">+</div>`;

            const sw = map.latLngToLayerPoint([cellMinLat, cellMinLng]);
            const ne = map.latLngToLayerPoint([cellMaxLat, cellMaxLng]);
            const pxW = Math.max(Math.abs(ne.x - sw.x), 20);
            const pxH = Math.max(Math.abs(ne.y - sw.y), 20);

            const marker = L.marker([centerLat, centerLng], {
              icon: L.divIcon({
                className: '',
                html: `<div style="
                  width:${pxW}px;height:${pxH}px;
                  background:${bg};
                  border:1px solid rgba(255,255,255,0.3);
                  border-radius:4px;
                  display:flex;align-items:center;justify-content:center;
                  cursor:pointer;
                  box-sizing:border-box;
                ">${label}</div>`,
                iconSize: [pxW, pxH],
                iconAnchor: [pxW / 2, pxH / 2],
              }),
              interactive: true,
            });

            marker.on('click', () => {
              onCellClick({ zoneId: zone.id, row: r, col: c, orchid });
            });

            layerRef.current!.addLayer(marker);
          }
        }
      });
    };

    map.on('zoomend', redraw);
    return () => {
      map.off('zoomend', redraw);
      layerRef.current?.clearLayers();
    };
  }, [zones, orchids, map, onCellClick]);

  return null;
}

// Panel chi tiết khi click vào ô
interface CellDetailPanelProps {
  cell: CellInfo;
  zone: GardenZone;
  orchids: Orchid[];
  onClose: () => void;
  onAssign: (orchidId: string) => void;
  onUnassign: () => void;
  onToggleSold: () => void;
}

export function CellDetailPanel({ cell, zone, orchids, onClose, onAssign, onUnassign, onToggleSold }: CellDetailPanelProps) {
  const [selectingOrchid, setSelectingOrchid] = useState(false);
  const unassigned = orchids.filter(o => !o.gardenPosition);

  if (cell.orchid) {
    const o = cell.orchid;
    return (
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{o.sold ? '🏷️' : '🌺'} {o.name}</h3>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs text-gray-400">Loại</p>
            <p className="font-medium text-gray-800">{o.species}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs text-gray-400">Ngày nhập</p>
            <p className="font-medium text-gray-800">{o.purchaseDate}</p>
          </div>
          {o.price != null && (
            <div className="bg-gray-50 rounded-xl p-2">
              <p className="text-xs text-gray-400">Giá</p>
              <p className="font-medium text-gray-800">{o.price.toLocaleString('vi-VN')}đ</p>
            </div>
          )}
          <div className={`rounded-xl p-2 ${o.healthStatus === 'healthy' ? 'bg-green-50' : o.healthStatus === 'warning' ? 'bg-yellow-50' : 'bg-red-50'}`}>
            <p className="text-xs text-gray-400">Trạng thái</p>
            <p className="font-medium">{o.healthStatus === 'healthy' ? '✅ Khỏe' : o.healthStatus === 'warning' ? '⚠️ Cảnh báo' : '🔴 Bệnh'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleSold}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold ${o.sold ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
          >
            {o.sold ? '↩ Chưa bán' : '🏷️ Đánh dấu đã bán'}
          </button>
          <button
            onClick={onUnassign}
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-500"
          >
            Gỡ khỏi vị trí
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center">Vị trí: {zone.name} · Hàng {cell.row + 1}, Cột {cell.col + 1}</p>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Ô trống</h3>
        <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
      </div>
      <p className="text-sm text-gray-500">{zone.name} · Hàng {cell.row + 1}, Cột {cell.col + 1}</p>

      {!selectingOrchid ? (
        <button
          onClick={() => setSelectingOrchid(true)}
          disabled={unassigned.length === 0}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-semibold disabled:opacity-40"
        >
          {unassigned.length === 0 ? 'Không có cây chưa gán vị trí' : '🌺 Gán cây vào đây'}
        </button>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <p className="text-xs text-gray-500 font-medium">Chọn cây để gán:</p>
          {unassigned.map(o => (
            <button
              key={o.id}
              onClick={() => onAssign(o.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 text-left transition-colors"
            >
              <span className="text-xl">🌺</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{o.name}</p>
                <p className="text-xs text-gray-400">{o.species} · {o.purchaseDate}</p>
              </div>
            </button>
          ))}
          <button onClick={() => setSelectingOrchid(false)} className="w-full py-2 text-sm text-gray-400">Hủy</button>
        </div>
      )}
    </div>
  );
}

export default GridOverlay;
