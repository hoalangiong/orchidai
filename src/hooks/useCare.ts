import { useState, useEffect } from 'react';
import {
  collection, doc, onSnapshot,
  addDoc, updateDoc, deleteDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { CareTask } from '../types/index';

export function useCare() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CareTask[]>([]);

  useEffect(() => {
    if (!user) { setTasks([]); return; }
    const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('scheduledDate', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as CareTask)));
    });
    return unsub;
  }, [user]);

  const addTask = async (task: Omit<CareTask, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'tasks'), task);
  };

  const completeTask = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', id), {
      isCompleted: true,
      completedDate: new Date().toISOString().split('T')[0],
    });
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
  };

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.scheduledDate <= today && !t.isCompleted);
  const upcomingTasks = tasks.filter(t => t.scheduledDate > today && !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  return { tasks, todayTasks, upcomingTasks, completedTasks, addTask, completeTask, deleteTask };
}
