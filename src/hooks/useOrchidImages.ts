import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { OrchidImage } from '../types/index';

export function useOrchidImages(orchidId: string) {
  const { user } = useAuth();
  const [images, setImages] = useState<OrchidImage[]>([]);

  useEffect(() => {
    if (!user || !orchidId) { setImages([]); return; }
    const q = query(
      collection(db, 'users', user.uid, 'orchids', orchidId, 'images'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, snap => {
      setImages(snap.docs.map(d => ({ id: d.id, ...d.data() } as OrchidImage)));
    });
  }, [user, orchidId]);

  const addImage = async (image: Omit<OrchidImage, 'id'>) => {
    if (!user || !orchidId) return;
    await addDoc(collection(db, 'users', user.uid, 'orchids', orchidId, 'images'), image);
  };

  const deleteImage = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'orchids', orchidId, 'images', id));
  };

  return { images, addImage, deleteImage };
}
