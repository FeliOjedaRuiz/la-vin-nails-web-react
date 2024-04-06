const Date = require("../models/date.model");
const mailer = require("../config/mailer.config");

module.exports.create = (req, res, next) => {
  Date.create(req.body)
    .then((date) => {
      res.status(201).json(date);
      Date.findById(date.id)
        .populate("turn")
        .populate("user")
        .populate("service")
        .then((date) => {
          mailer.sendDateCreationEmail(date);
        });
    })
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

module.exports.delete = (req, res, next) => {
  Date.findById(req.date.id)
    .populate("turn")
    .populate("user")
    .populate("service")
    .then((date) => {
      Date.deleteOne({ _id: req.date.id }).then(() => {
        res.status(204).send();
        console.log(`deleting date ${req.date.id}`);
        mailer.sendDateDeletedEmail(date);
      });
    })
    .catch(next);
};
