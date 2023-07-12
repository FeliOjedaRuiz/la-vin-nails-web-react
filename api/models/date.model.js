const mongoose = require("mongoose");

const dateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Seleccione un servicio"],
    },
    type: {
      type: String,
      required: [true, "Seleccione un tipo de servicio"],
    },
    handState: {
      type: String,
    },
    desiredDesign: {
      type: String,
    },
    designDetails: {
      type: String,
      required: [true, "Son necesarios los detalles"],
      maxLength: [300, "max 300 chars."],
    },    
    turn: {
      type: String,
      required: [true, "Es necesario seleccionar una hora"],
    },
    cost: {
      type: Number,
    },    
  },
  { timestamps: true }
);

dateSchema.index({ date: 1, turn: 1 }, { unique: true });

const Date = mongoose.model("Date", dateSchema);

module.exports = Date;
