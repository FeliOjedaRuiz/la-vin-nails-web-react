const Turn = require("../models/turn.model");

module.exports.create = (req, res, next) => {
  Turn.create(req.body)
  .then((turn) => res.status(201).json(turn))
  .catch(next);
};

module.exports.list = (req, res, next) => {
  Turn.find()
    .then((turns) => res.json(turns))
    .catch(next);
}