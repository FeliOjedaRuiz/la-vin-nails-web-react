const Date = require("../models/date.model");
const createError = require("http-errors");

module.exports.exists = (req, res, next) => {
  Date.findById(req.params.id)
    .then((date) => {
      if (date) {
        req.date = date;
        next();
      } else {
        next(createError(404, "Date not found"));
      }
    })
    .catch(next);
};

module.exports.checkOwner = (req, res, next) => {
  const userId = req.date.user.toString()
  if (req.user.role === "admin") {
    next();
  } else if (userId === req.user.id) {
    next();
  } else {
    next(createError(403, "Forbidden"));
  }
};
