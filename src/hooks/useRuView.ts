import { useState, useEffect } from 'react';
import { ref, onValue, query, limitToLast, orderByKey } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface RuViewZone {
  id: string;
  name: string;
  occupied: boolean;
}

export interface RuViewSleep {
  sleeping: boolean;
  apneaDetected: boolean;
  apneaCount: number;
  sleepQuality: 'good' | 'fair' | 'poor' | null;
}

export interface RuViewReading {
  presence: boolean;
  personCount?: number;
  breathingRate: number | null;
  heartRate: number | null;
  fallDetected: boolean;
  signalQuality: number;
  ts: number;
  zones?: RuViewZone[];
  doppler?: number[];   // 16 values 0-1
  heatmap?: number[];   // 300 values (20×15) 0-1
  sleep?: RuViewSleep;
  activity?: string;
}

export interface RuViewEvent {
  type: 'enter' | 'leave' | 'fall';
  ts: number;
}

export function useRuView() {
  const { user } = useAuth();
  const [latest, setLatest] = useState<RuViewReading | null>(null);
  const [events, setEvents] = useState<RuViewEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const latestRef = ref(rtdb, `sensors/${user.uid}/ruview/latest`);
    const unsubLatest = onValue(latestRef, snap => {
      if (snap.exists()) {
        setLatest(snap.val() as RuViewReading);
        setConnected(true);
      } else {
        setConnected(false);
      }
    });

    const eventsRef = query(
      ref(rtdb, `sensors/${user.uid}/ruview/events`),
      orderByKey(),
      limitToLast(50)
    );
    const unsubEvents = onValue(eventsRef, snap => {
      const items: RuViewEvent[] = [];
      snap.forEach(child => { items.push(child.val() as RuViewEvent); });
      setEvents(items.reverse());
    });

    return () => { unsubLatest(); unsubEvents(); };
  }, [user]);

  return { latest, events, connected };
}
