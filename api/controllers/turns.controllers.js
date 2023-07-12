const Turn = require("../models/turn.model");

module.exports.create = (req, res, next) => {
  Turn.create(req.body)
  .then((turn) => res.status(201).json(turn))
  .catch(next);
};