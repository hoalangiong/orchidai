import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useOrchids } from './useOrchids';
import { CareLog } from '../types/index';

export interface CareLogWithOrchid extends CareLog {
  orchidId: string;
}

export function useAllCareLogs() {
  const { user } = useAuth();
  const { orchids } = useOrchids();
  const [logs, setLogs] = useState<CareLogWithOrchid[]>([]);

  useEffect(() => {
    if (!user || orchids.length === 0) { setLogs([]); return; }

    // Subscribe to each orchid's logs subcollection individually — avoids
    // collectionGroup which requires a composite index and can't be filtered by uid.
    const allLogs = new Map<string, CareLogWithOrchid[]>();
    const unsubs = orchids.map(orchid => {
      const q = query(
        collection(db, 'users', user.uid, 'orchids', orchid.id, 'logs'),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(q, snap => {
        allLogs.set(orchid.id, snap.docs.map(d => ({
          id: d.id,
          orchidId: orchid.id,
          ...d.data(),
        } as CareLogWithOrchid)));
        // Merge and sort all logs by createdAt desc
        const merged = Array.from(allLogs.values())
          .flat()
          .sort((a, b) => (b.createdAt as number) - (a.createdAt as number));
        setLogs(merged);
      });
    });

    return () => unsubs.forEach(u => u());
  }, [user, orchids]);

  return { logs };
}

