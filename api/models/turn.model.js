const mongoose = require("mongoose");

const turnSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  hour: {
    type: [String],
    required: true,
  },
  state: {
    type: String,
    enum: ["Pendiente", "Confirmada", "Rechazada"],
    default: "Pendiente",
  },
});

const Turn = mongoose.model("Turn", turnSchema);

module.exports = Turn;