const Turn = require("../models/turn.model");
const Date = require("../models/date.model");
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

module.exports.isFree = (req, res, next) => {
  Date.find({ turn: req.turn.id })
    .then((date) => {
      if (!date[0]) {
        next();
      } else {
        next(createError(400, "One Date is in this turn"))
      }
    })
    .catch(next);
}