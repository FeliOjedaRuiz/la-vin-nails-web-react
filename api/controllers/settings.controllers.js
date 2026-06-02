const AppSetting = require('../models/app-setting.model');
const createError = require('http-errors');

/**
 * List all settings.
 * Lazily seeds registration.enabled if not present.
 */
module.exports.list = (req, res, next) => {
  AppSetting.find()
    .then((settings) => {
      // Lazy seed registration.enabled if not found
      const hasRegistrationEnabled = settings.some((s) => s.key === 'registration.enabled');
      if (!hasRegistrationEnabled) {
        return AppSetting.getOrDefault('registration.enabled', true).then((seeded) => {
          const allSettings = [...settings, seeded];
          // Return as key-value map
          const result = allSettings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
          }, {});
          res.json(result);
        });
      }
      // Return as key-value map
      const result = settings.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {});
      res.json(result);
    })
    .catch(next);
};

/**
 * Get a single setting by key.
 * Seeds registration.enabled with true if missing.
 * Returns 404 for other non-existent keys.
 */
module.exports.getByKey = (req, res, next) => {
  const { key } = req.params;
  AppSetting.findOne({ key })
    .then((setting) => {
      if (setting) {
        return res.json(setting);
      }
      // Lazy seed for registration.enabled
      if (key === 'registration.enabled') {
        return AppSetting.getOrDefault(key, true).then((seeded) => {
          res.json(seeded);
        });
      }
      next(createError(404, 'Setting not found'));
    })
    .catch(next);
};

/**
 * Update a setting value by key.
 * Creates (upsert) if doesn't exist.
 * Validates that registration.enabled must be boolean.
 */
module.exports.update = (req, res, next) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined || value === null) {
    return next(createError(400, 'value is required in body'));
  }

  // Validate registration.enabled must be boolean
  if (key === 'registration.enabled' && typeof value !== 'boolean') {
    return next(createError(400, 'registration.enabled must be a boolean'));
  }

  AppSetting.findOneAndUpdate(
    { key },
    { $set: { value } },
    { upsert: true, new: true, runValidators: true }
  )
    .then((setting) => res.json(setting))
    .catch(next);
};