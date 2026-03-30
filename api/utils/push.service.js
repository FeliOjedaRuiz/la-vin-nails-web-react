const webpush = require('web-push');
const PushSubscription = require('../models/push-subscription.model');
const User = require('../models/user.model');

// Configuración inicial (se llama cuando el backend arranca)
const initializeWebPush = () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('⚠️ Push Notifications no configuradas (faltan claves VAPID en .env)');
    return;
  }
  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:admin@neverlandcullarvega.es',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
};
initializeWebPush();

/**
 * Notifica a todos los usuarios que tengan rol "admin"
 * @param {Object} payload 
 * @param {string} payload.title - Título de la notificación
 * @param {string} payload.body - Cuerpo de la notificación
 * @param {string} payload.url - URL para abrir al clickar
 */
const notifyAdmins = async (payload) => {
  try {
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    const adminIds = adminUsers.map((u) => u._id);

    const subscriptions = await PushSubscription.find({ user: { $in: adminIds } });

    if (subscriptions.length === 0) {
      console.log('Push: No hay administradores suscritos a notificaciones.');
      return;
    }

    const payloadString = JSON.stringify(payload);

    const notifications = subscriptions.map((sub) => {
      const subscriptionInfo = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      };

      return webpush.sendNotification(subscriptionInfo, payloadString).catch(async (err) => {
        // HTTP 410 (Gone) or 404 significa que la suscripción ya no es válida o el navegador la borró
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Push: Suscripción inválida detectada (${sub.endpoint}). Eliminando...`);
          await PushSubscription.findByIdAndDelete(sub._id);
        } else {
          console.error('Error enviando push notification:', err);
        }
      });
    });

    await Promise.allSettled(notifications);
  } catch (err) {
    console.error('Error general enviando notificaciones a admins:', err);
  }
};

module.exports = {
  notifyAdmins,
};
