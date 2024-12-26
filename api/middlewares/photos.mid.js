const Photo = require("../models/photo.model");
const createError = require("http-errors");

module.exports.exists = (req, res, next) => {
  Photo.findById(req.params.id)
    .then((photo) => {
      if (photo) {
        req.photo = photo;
        next();
      } else {
        next(createError(404, "Photo not found"));
      }
    })
    .catch(next);
};