const AppSetting = require('../models/app-setting.model');

/**
 * Checks if registration is open based on the registration.enabled setting.
 * - Fail-open: if doc is missing or value is true -> next()
 * - Block: if value is false -> 403 with closed message
 * - DB errors also fail-open (propagate as 500)
 */
module.exports.isOpen = (req, res, next) => {
  AppSetting.findOne({ key: 'registration.enabled' })
    .then((setting) => {
      if (!setting || setting.value === true) {
        return next();
      }
      res.status(403).json({ message: 'Registro temporalmente cerrado.' });
    })
    .catch(next); // DB failure also fail-open
};