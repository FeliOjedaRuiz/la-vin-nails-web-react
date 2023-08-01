const Date = require("../models/date.model");
const createError = require("http-errors");

module.exports.exists = (req, res, next) => {
  Date.findById(req.params.id)
    .then((date) => {
      if (date) {
        req.date = date;
        next();
      } else {
        next(createError(404, "Date not found"))
      }
    })
    .catch(next);
}