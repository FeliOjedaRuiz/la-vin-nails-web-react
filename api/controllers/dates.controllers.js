const Date = require("../models/date.model");

module.exports.create = (req, res, next) => {
  Date.create(req.body)
    .then((date) => res.status(201).json(date))
    .catch(next);
};

module.exports.list = (req, res, next) => {
  Date.find()
    .populate("turn")
    .populate("user")
    .populate("service")
    .then((dates) => res.json(dates))
    .catch(next);
};