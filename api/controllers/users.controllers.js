const User = require("../models/user.model")

module.exports.create = (req, res, next) => {
  User.create(req.body).then((user) => res.status(201).json(user));
};
