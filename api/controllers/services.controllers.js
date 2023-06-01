const Service = require("../models/service.model");
const mongoose = require("mongoose");

module.exports.list = (req, res, next) => {
  Service.find()
    .then((services) => {
      res.json(services);
    })
    .catch(next);
};
