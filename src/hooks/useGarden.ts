import { useState, useEffect } from 'react';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GardenZone {
  id: string;
  name: string;
  color: string;
  points: LatLng[];
  notes?: string;
  quantity?: number;
  gridRows?: number;
  gridCols?: number;
}

// Tính diện tích polygon từ tọa độ địa lý (Shoelace + chuyển sang m²)
export function calcArea(points: LatLng[]): number {
  if (points.length < 3) return 0;
  const R = 6371000; // bán kính trái đất (m)
  const toRad = (d: number) => (d * Math.PI) / 180;
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = toRad(points[i].lng) * Math.cos(toRad((points[i].lat + points[j].lat) / 2));
    const xj = toRad(points[j].lng) * Math.cos(toRad((points[i].lat + points[j].lat) / 2));
    const yi = toRad(points[i].lat);
    const yj = toRad(points[j].lat);
    area += (xi * yj - xj * yi);
  }
  return Math.abs((area / 2) * R * R);
}

const STORAGE_KEY = 'orchid-farm-garden';

const ZONE_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export function useGarden(_initialCenter?: LatLng) {
  const [zones, setZones] = useState<GardenZone[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
  }, [zones]);

  const addZone = (name: string, points: LatLng[], notes?: string, quantity?: number) => {
    const color = ZONE_COLORS[zones.length % ZONE_COLORS.length];
    const newZone: GardenZone = {
      id: Date.now().toString(),
      name, color, points, notes,
      quantity,
    };
    setZones(prev => [...prev, newZone]);
    return newZone;
  };

  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
  };

  const updateZone = (id: string, updates: Partial<Pick<GardenZone, 'name' | 'notes' | 'gridRows' | 'gridCols'>>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  return { zones, addZone, deleteZone, updateZone, ZONE_COLORS };
}
