#!/usr/bin/env node
// Chạy mỗi ngày lúc 7 giờ sáng qua crontab:
// 0 7 * * * /usr/bin/node /var/www/push-notify.js >> /var/log/push-notify.log 2>&1

const admin = require('firebase-admin');
const serviceAccount = require('/var/www/orchids-service-account.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();
const messaging = admin.messaging();

const today = new Date().toISOString().split('T')[0];

function daysDiff(dateStr, todayStr) {
  const a = new Date(dateStr).setHours(0,0,0,0);
  const b = new Date(todayStr).setHours(0,0,0,0);
  return Math.round((b - a) / 86400000);
}

async function run() {
  console.log(`[${new Date().toISOString()}] Starting push notification job for ${today}`);

  // Lấy tất cả users có FCM token
  const usersSnap = await db.collection('users').listDocuments();
  let sent = 0;

  for (const userRef of usersSnap) {
    try {
      // Lấy FCM token
      const tokenDoc = await userRef.collection('fcm').doc('token').get();
      if (!tokenDoc.exists) continue;
      const { token } = tokenDoc.data();
      if (!token) continue;

      // Lấy tất cả orchids của user
      const orchidsSnap = await userRef.collection('orchids').get();
      const reminders = [];

      for (const orchidDoc of orchidsSnap.docs) {
        const o = orchidDoc.data();

        if (o.wateringInterval && o.lastWatered) {
          const due = new Date(o.lastWatered);
          due.setDate(due.getDate() + o.wateringInterval);
          const dueStr = due.toISOString().split('T')[0];
          const daysOverdue = daysDiff(dueStr, today);
          if (daysOverdue >= 0) {
            reminders.push({ name: o.name, type: 'watering', daysOverdue });
          }
        }

        if (o.fertilizingInterval && o.lastFertilized) {
          const due = new Date(o.lastFertilized);
          due.setDate(due.getDate() + o.fertilizingInterval);
          const dueStr = due.toISOString().split('T')[0];
          const daysOverdue = daysDiff(dueStr, today);
          if (daysOverdue >= 0) {
            reminders.push({ name: o.name, type: 'fertilizing', daysOverdue });
          }
        }
      }

      if (reminders.length === 0) continue;

      // Tạo nội dung thông báo
      let title, body;
      const overdue = reminders.filter(r => r.daysOverdue > 0);
      const dueToday = reminders.filter(r => r.daysOverdue === 0);

      if (reminders.length === 1) {
        const r = reminders[0];
        const action = r.type === 'watering' ? 'tưới nước 💧' : 'bón phân 🌱';
        title = '🌸 Nhắc nhở chăm sóc lan';
        body = r.daysOverdue === 0
          ? `${r.name} cần ${action} hôm nay`
          : `${r.name} quá hạn ${action} ${r.daysOverdue} ngày`;
      } else {
        title = '🌸 Vườn lan cần chăm sóc';
        const parts = [];
        if (overdue.length > 0) parts.push(`${overdue.length} cây quá hạn`);
        if (dueToday.length > 0) parts.push(`${dueToday.length} cây đến hạn hôm nay`);
        body = parts.join(', ');
      }

      await messaging.send({
        token,
        notification: { title, body },
        webpush: {
          notification: {
            title,
            body,
            icon: 'https://orchidstore.io.vn/orchid/pwa-192x192.png',
            badge: 'https://orchidstore.io.vn/orchid/pwa-192x192.png',
          },
          fcmOptions: { link: 'https://orchidstore.io.vn/orchid/' },
        },
      });

      sent++;
      console.log(`  → Sent to ${userRef.id}: ${body}`);
    } catch (err) {
      // Token expired hoặc invalid — xóa token
      if (err.code === 'messaging/registration-token-not-registered' ||
          err.code === 'messaging/invalid-registration-token') {
        await userRef.collection('fcm').doc('token').delete();
        console.log(`  → Removed invalid token for ${userRef.id}`);
      } else {
        console.error(`  → Error for ${userRef.id}:`, err.message);
      }
    }
  }

  console.log(`[${new Date().toISOString()}] Done. Sent ${sent} notifications.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
