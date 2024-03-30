const User = require("../models/user.model");
const createError = require("http-errors");

module.exports.exists = (req, res, next) => {
  User.findOne({ email: req.params.email })
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        next(createError(404, "User not found"));
      }
      // res.json(user);
    })
    .catch(next);
};

module.exports.checkUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        next(createError(404, "User not found"));
      }
    })
    .catch(next);
};
