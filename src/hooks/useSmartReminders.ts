import { useMemo } from 'react';
import { Orchid } from '../types/index';

export interface SmartReminder {
  orchidId: string;
  orchidName: string;
  type: 'watering' | 'fertilizing';
  daysOverdue: number; // >0 = quá hạn, 0 = hôm nay, <0 = còn X ngày
  dueDate: string;
}

function daysDiff(from: string, to: string): number {
  const a = new Date(from).setHours(0, 0, 0, 0);
  const b = new Date(to).setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

export function useSmartReminders(orchids: Orchid[]): SmartReminder[] {
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const reminders: SmartReminder[] = [];

    for (const o of orchids) {
      if (o.wateringInterval && o.lastWatered) {
        const dueDate = new Date(o.lastWatered);
        dueDate.setDate(dueDate.getDate() + o.wateringInterval);
        const due = dueDate.toISOString().split('T')[0];
        const daysOverdue = daysDiff(due, today);
        // Chỉ nhắc khi đến hạn hoặc quá hạn (daysOverdue >= 0)
        if (daysOverdue >= 0) {
          reminders.push({ orchidId: o.id, orchidName: o.name, type: 'watering', daysOverdue, dueDate: due });
        }
      }

      if (o.fertilizingInterval && o.lastFertilized) {
        const dueDate = new Date(o.lastFertilized);
        dueDate.setDate(dueDate.getDate() + o.fertilizingInterval);
        const due = dueDate.toISOString().split('T')[0];
        const daysOverdue = daysDiff(due, today);
        if (daysOverdue >= 0) {
          reminders.push({ orchidId: o.id, orchidName: o.name, type: 'fertilizing', daysOverdue, dueDate: due });
        }
      }
    }

    // Quá hạn nhiều nhất lên đầu
    return reminders.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [orchids]);
}
