const mongoose = require("mongoose");

const turnSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    hour: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      enum: ["Disponible", "Solicitado", "Confirmado", "Cancelado", "Reservado"],
      default: "Disponible",
    },
    category: {
      type: String,
      enum: ["normal", "retiro"],
      default: "normal",
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

turnSchema.index({ date: 1 }, { background: true });
turnSchema.index({ date: 1, category: 1 }, { background: true });

const Turn = mongoose.model("Turn", turnSchema);

module.exports = Turn;
