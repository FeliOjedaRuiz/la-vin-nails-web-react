const mongoose = require("mongoose");

const appSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

/**
 * Get a setting value by key, creating it with defaultValue if it doesn't exist.
 * Uses upsert to be atomic and safe across concurrent deploys.
 * @param {string} key - The setting key
 * @param {*} defaultValue - The default value to set if the key doesn't exist
 * @returns {Promise<Document>} The AppSetting document
 */
appSettingSchema.statics.getOrDefault = function (key, defaultValue) {
  return this.findOneAndUpdate(
    { key },
    { $setOnInsert: { key, value: defaultValue } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const AppSetting = mongoose.model("AppSetting", appSettingSchema);

module.exports = AppSetting;