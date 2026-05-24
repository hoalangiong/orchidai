import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface PropagationStage {
  date: string;
  note: string;
}

export interface PropagationBatch {
  id: string;
  method: 'split' | 'keiki' | 'stem';
  species: string;
  startDate: string;
  quantity: number;
  stages: PropagationStage[];
  outcome: 'ongoing' | 'success' | 'failed';
  successCount: number;
  materialCost: number;
  orchidLinked: boolean;
  createdAt: number;
}

export function usePropagation() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<PropagationBatch[]>([]);

  useEffect(() => {
    if (!user) { setBatches([]); return; }
    const q = query(collection(db, 'users', user.uid, 'propagations'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() } as PropagationBatch)));
    });
  }, [user]);

  const addBatch = async (batch: Omit<PropagationBatch, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'propagations'), batch);
  };

  const updateBatch = async (id: string, updates: Partial<PropagationBatch>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'propagations', id), updates as Record<string, unknown>);
  };

  const deleteBatch = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'propagations', id));
  };

  const addStage = async (id: string, stage: PropagationStage, currentStages: PropagationStage[]) => {
    await updateBatch(id, { stages: [...currentStages, stage] });
  };

  return { batches, addBatch, updateBatch, deleteBatch, addStage };
}
