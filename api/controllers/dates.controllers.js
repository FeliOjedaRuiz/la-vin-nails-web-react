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
  const { user } = req.user.id;
  console.log(`USER ${ user }`) 
  const criterial = {};

  if (user) criterial.user = user;

  if (req.user.id) {   
    
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