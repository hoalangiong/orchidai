import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { messagingPromise, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

const VAPID_KEY = import.meta.env.VITE_VAPID_KEY as string;
const BASE = import.meta.env.BASE_URL || '/';

async function saveFcmToken(uid: string) {
  const messaging = await messagingPromise;
  if (!messaging) return;
  try {
    const swReg = await navigator.serviceWorker.register(
      `${BASE}firebase-messaging-sw.js`,
      { scope: BASE }
    );
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });
    if (token) {
      await setDoc(doc(db, 'users', uid, 'fcm', 'token'), {
        token,
        updatedAt: Date.now(),
      });
    }
  } catch {
    // permission denied or not supported — silent
  }
}

export default function NotificationBanner() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [status, setStatus] = useState<NotificationPermission | 'unknown' | 'unsupported'>('unknown');

  useEffect(() => {
    if (!('Notification' in window)) { setStatus('unsupported'); return; }
    setStatus(Notification.permission);
    // If already granted, refresh token silently
    if (Notification.permission === 'granted' && user) {
      saveFcmToken(user.uid);
    }
  }, [user]);

  const handleEnable = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setStatus(result);
    if (result === 'granted' && user) {
      await saveFcmToken(user.uid);
    }
  };

  if (status !== 'default' && status !== 'unknown') return null;

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl border"
      style={{ background: 'linear-gradient(135deg, #f0fae8, #e2f5d4)', borderColor: '#c3ecb8' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #5db53c, #3d9e20)' }}>
        <span className="text-xl">🔔</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: '#276b1e' }}>{t('notification.enableTitle')}</p>
        <p className="text-xs" style={{ color: '#5db53c' }}>{t('notification.enableDesc')}</p>
      </div>
      <button onClick={handleEnable}
        className="shrink-0 px-4 py-1.5 rounded-xl text-white text-xs font-bold active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg, #5db53c, #2d7d18)' }}>
        {t('notification.enable')}
      </button>
    </div>
  );
}
