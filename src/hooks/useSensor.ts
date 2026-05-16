import { useState, useEffect } from 'react';
import { ref, onValue, query, limitToLast, orderByKey } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface SensorReading {
  n: number;        // Nitơ mg/kg
  p: number;        // Phosphorus mg/kg
  k: number;        // Kali mg/kg
  ph: number;       // pH
  ec: number;       // EC mS/cm
  moisture: number; // Độ ẩm đất %
  temp: number;     // Nhiệt độ °C
  humidity: number; // Độ ẩm không khí %
  ts: number;       // timestamp ms
}

export function useSensor() {
  const { user } = useAuth();
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const latestRef = ref(rtdb, `sensors/${user.uid}/latest`);
    const unsubLatest = onValue(latestRef, snap => {
      if (snap.exists()) {
        setLatest(snap.val() as SensorReading);
        setConnected(true);
      } else {
        setConnected(false);
      }
    });

    const histRef = query(
      ref(rtdb, `sensors/${user.uid}/history`),
      orderByKey(),
      limitToLast(24)
    );
    const unsubHist = onValue(histRef, snap => {
      const items: SensorReading[] = [];
      snap.forEach(child => { items.push(child.val() as SensorReading); });
      setHistory(items.reverse());
    });

    return () => { unsubLatest(); unsubHist(); };
  }, [user]);

  return { latest, history, connected };
}
