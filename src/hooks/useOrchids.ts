import { useState, useEffect } from 'react';
import {
  collection, doc, onSnapshot,
  addDoc, updateDoc, deleteDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Orchid } from '../types/index';

export function useOrchids() {
  const { user } = useAuth();
  const [orchids, setOrchids] = useState<Orchid[]>([]);

  useEffect(() => {
    if (!user) { setOrchids([]); return; }
    const q = query(collection(db, 'users', user.uid, 'orchids'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrchids(snap.docs.map(d => ({ id: d.id, ...d.data() } as Orchid)));
    });
    return unsub;
  }, [user]);

  const addOrchid = async (orchid: Omit<Orchid, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'orchids'), {
      ...orchid,
      createdAt: Date.now(),
    });
  };

  const updateOrchid = async (id: string, updates: Partial<Orchid>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'orchids', id), updates);
  };

  const deleteOrchid = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'orchids', id));
  };

  return { orchids, addOrchid, updateOrchid, deleteOrchid };
}
