import { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { CareLog } from '../types/index';

export interface CareLogWithOrchid extends CareLog {
  orchidId: string;
}

export function useAllCareLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CareLogWithOrchid[]>([]);

  useEffect(() => {
    if (!user) { setLogs([]); return; }
    // collectionGroup lấy tất cả subcollection 'logs' trong toàn bộ Firestore của user
    // Nhưng collectionGroup không filter theo user — dùng cách khác: lắng nghe từng orchid
    // Thực tế dùng collectionGroup với where clause
    const q = query(collectionGroup(db, 'logs'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      const result: CareLogWithOrchid[] = [];
      for (const d of snap.docs) {
        // Path: users/{uid}/orchids/{orchidId}/logs/{logId}
        const pathParts = d.ref.path.split('/');
        const uid = pathParts[1];
        if (uid !== user.uid) continue;
        const orchidId = pathParts[3];
        result.push({ id: d.id, orchidId, ...d.data() } as CareLogWithOrchid);
      }
      setLogs(result);
    });
  }, [user]);

  return { logs };
}
