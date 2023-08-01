const Turn = require("../models/turn.model");
const createError = require("http-errors");

module.exports.exists = (req, res, next) => {
  Turn.findById(req.params.id)
    .then((turn) => {
      if (turn) {
        req.turn = turn;
        next();
      } else {
        next(createError(404, "Turn not found"))
      }
    })
    .catch(next);
}