const Service = require("../models/service.model");

module.exports.list = (req, res, next) => {
  Service.find()
    .then((services) => res.json(services))
    .catch(next);
};

module.exports.detail = (req, res, next) => {
  Service.findById(req.params.id)
    .then((service) => res.json(service))
    .catch(next);
};
