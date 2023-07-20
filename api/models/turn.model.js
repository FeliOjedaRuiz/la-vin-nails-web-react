const mongoose = require("mongoose");

const turnSchema = new mongoose.Schema({
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
    enum: ["Disponible", "Solicitado", "Confirmado", "Cancelado"],
    default: "Disponible",
  },
});

const Turn = mongoose.model("Turn", turnSchema);

module.exports = Turn;