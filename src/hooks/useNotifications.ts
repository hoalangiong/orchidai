import { useEffect } from 'react';
import { CareTask } from '../types/index';
import { Orchid } from '../types/index';

const TYPE_LABELS: Record<string, string> = {
  watering:    'Tưới nước 💧',
  fertilizing: 'Bón phân 🌱',
  repotting:   'Thay chậu 🪴',
  pruning:     'Cắt tỉa ✂️',
  blooming:    'Ra hoa 🌸',
  other:       'Chăm sóc 📝',
};

function todayKey() {
  return 'notif_fired_' + new Date().toISOString().split('T')[0];
}

export function fireTaskNotifications(tasks: CareTask[], orchids: Orchid[]) {
  if (Notification.permission !== 'granted') return;
  const key = todayKey();
  if (localStorage.getItem(key)) return;
  if (tasks.length === 0) return;

  localStorage.setItem(key, '1');

  if (tasks.length === 1) {
    const task = tasks[0];
    const orchid = orchids.find(o => o.id === task.orchidId);
    new Notification('🌸 Nhắc nhở chăm sóc lan', {
      body: `${TYPE_LABELS[task.type]} · ${orchid?.name ?? 'Cây lan'}`,
      icon: '/orchid/pwa-192x192.png',
      badge: '/orchid/pwa-192x192.png',
    });
  } else {
    new Notification('🌸 Nhắc nhở chăm sóc lan', {
      body: `Hôm nay có ${tasks.length} việc cần làm cho vườn lan`,
      icon: '/orchid/pwa-192x192.png',
      badge: '/orchid/pwa-192x192.png',
    });
  }
}

export function useNotifications(todayTasks: CareTask[], orchids: Orchid[]) {
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      fireTaskNotifications(todayTasks, orchids);
    }
  }, [todayTasks, orchids]);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}
