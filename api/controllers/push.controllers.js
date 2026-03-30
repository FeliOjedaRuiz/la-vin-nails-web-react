const PushSubscription = require('../models/push-subscription.model');
const createError = require('http-errors');

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
