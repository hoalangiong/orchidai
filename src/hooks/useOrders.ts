import { useState, useEffect } from 'react';
import {
  collection, doc, onSnapshot, addDoc, updateDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: string;
  priceNum: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'cod' | 'transfer';
  status: 'pending' | 'confirmed' | 'shipping' | 'done' | 'cancelled';
  note: string;
  createdAt: number;
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) { setOrders([]); return; }
    const q = query(collection(db, 'users', user.uid, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    });
    return unsub;
  }, [user]);

  const placeOrder = async (order: Omit<Order, 'id'>) => {
    if (!user) return null;
    const ref = await addDoc(collection(db, 'users', user.uid, 'orders'), order);
    await addDoc(collection(db, 'orders'), { ...order, orderId: ref.id });
    return ref.id;
  };

  return { orders, placeOrder };
}

export function useAllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    });
    return unsub;
  }, []);

  const updateStatus = async (id: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', id), { status });
  };

  return { orders, updateStatus };
}
