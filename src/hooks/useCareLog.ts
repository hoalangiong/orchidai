import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { CareLog } from '../types/index';

export function useCareLog(orchidId: string) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CareLog[]>([]);

  useEffect(() => {
    if (!user || !orchidId) { setLogs([]); return; }
    const q = query(
      collection(db, 'users', user.uid, 'orchids', orchidId, 'logs'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as CareLog)));
    });
  }, [user, orchidId]);

  const addLog = async (log: Omit<CareLog, 'id'>) => {
    if (!user || !orchidId) return;
    await addDoc(collection(db, 'users', user.uid, 'orchids', orchidId, 'logs'), log);
  };

  const deleteLog = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'orchids', orchidId, 'logs', id));
  };

  return { logs, addLog, deleteLog };
}
