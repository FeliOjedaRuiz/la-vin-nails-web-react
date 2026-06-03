const PushSubscription = require('../models/push-subscription.model');
const createError = require('http-errors');
const webpush = require('web-push');
const Date = require('../models/date.model');

module.exports.getPublicKey = (req, res, next) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return next(createError(500, 'Servidor no configurado para notificaciones Push'));
  }
  // Trim para evitar problemas con espacios en Safari/iOS
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY.trim() });
};

module.exports.subscribe = (req, res, next) => {
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys) {
    return next(createError(400, 'Datos de suscripción incompletos'));
  }

  const subscriptionData = {
    user: req.user.id,
    endpoint,
    keys
  };

  // Usamos findOneAndUpdate con upsert para evitar duplicados del mismo endpoint
  PushSubscription.findOneAndUpdate(
    { endpoint },
    { $set: subscriptionData },
    { upsert: true, new: true, runValidators: true }
  )
    .then((subscription) => {
      res.status(201).json(subscription);
    })
    .catch((error) => {
      // Si el índice único salta a nivel de BD, lo manejamos
      if (error.code === 11000) {
        return next(createError(409, 'Esta suscripción ya existe.'));
      }
      next(error);
    });
};

/**
 * DELETE /push/unsubscribe
 * Elimina la suscripción push del dispositivo actual del admin logueado.
 * Recibe { endpoint } en el body.
 */
module.exports.unsubscribe = (req, res, next) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return next(createError(400, 'Endpoint requerido'));
  }

  PushSubscription.findOneAndDelete({ endpoint, user: req.user.id })
    .then((deleted) => {
      if (!deleted) {
        return next(createError(404, 'Suscripción no encontrada'));
      }
      res.status(204).send();
    })
    .catch(next);
};

/**
 * POST /push/test
 * Envía una notificación push de prueba SOLO al admin logueado,
 * usando los datos de la última reserva real de la BD.
 */
module.exports.sendTest = async (req, res, next) => {
  try {
    // Buscar las suscripciones del admin logueado
    const subscriptions = await PushSubscription.find({ user: req.user.id });

    if (subscriptions.length === 0) {
      return next(createError(404, 'No hay suscripciones activas para este administrador'));
    }

    // Buscar la última reserva real con datos completos
    const lastDate = await Date.findOne()
      .sort({ createdAt: -1 })
      .populate('turn')
      .populate('user')
      .populate('service');

    let payload;
    if (lastDate) {
      const clientName = lastDate.user?.name || 'Una clienta';
      const serviceName = lastDate.service?.name || 'un servicio';
      const turnId = lastDate.turn?._id;
      payload = {
        title: '🧪 Test — Nueva Reserva',
        body: `${clientName} ha reservado ${serviceName}.`,
        url: turnId ? `/turns/${turnId}` : '/admin-schedule',
      };
    } else {
      payload = {
        title: '🧪 Notificación de Prueba',
        body: 'Push funcionando correctamente en La Vin Nails.',
        url: '/admin',
      };
    }

    const payloadString = JSON.stringify(payload);

    const results = await Promise.allSettled(
      subscriptions.map((sub) => {
        const subscriptionInfo = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };
        return webpush.sendNotification(subscriptionInfo, payloadString).catch(async (err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.findByIdAndDelete(sub._id);
          }
          throw err;
        });
      })
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    res.json({
      message: `Notificación de prueba enviada: ${sent} exitosas, ${failed} fallidas.`,
      payload,
    });
  } catch (err) {
    next(err);
  }
};
