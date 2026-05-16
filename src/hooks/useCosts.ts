import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface CostEntry {
  id: string;
  type: 'expense' | 'revenue';
  category: string;
  amount: number;
  note: string;
  date: string;
  createdAt: number;
}

export function useCosts() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CostEntry[]>([]);

  useEffect(() => {
    if (!user) { setEntries([]); return; }
    const q = query(collection(db, 'users', user.uid, 'costs'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as CostEntry)));
    });
  }, [user]);

  const addEntry = async (entry: Omit<CostEntry, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'costs'), entry);
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'costs', id));
  };

  const totalRevenue = useMemo(() => entries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0), [entries]);
  const totalExpense = useMemo(() => entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0), [entries]);
  const profit = totalRevenue - totalExpense;

  return { entries, addEntry, deleteEntry, totalRevenue, totalExpense, profit };
}
