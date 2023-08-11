const Date = require("../models/date.model");

module.exports.create = (req, res, next) => {
  Date.create(req.body)
    .then((date) => res.status(201).json(date))
    .catch(next);
};

module.exports.list = (req, res, next) => {
  const { turn } = req.query;

  const criterial = {};
  if (turn) criterial.turn = turn;

  Date.find(criterial)
    .populate("turn")
    .populate("user")
    .populate("service")
    .then((dates) => res.json(dates))
    .catch(next);
};

module.exports.myList = (req, res, next) => {
  const criterial = { user: req.user.id };

  console.log(req.user.id);
  console.log(criterial);

  if (req.user) {
    Date.find(criterial)
      .populate("turn")
      .populate("user")
      .populate("service")
      .then((dates) => res.json(dates))
      .catch(next);
  }
};

module.exports.update = (req, res, next) => {
  Object.assign(req.date, req.body);
  req.date
    .save()
    .then((date) => res.json(date))
    .catch(next);
};
