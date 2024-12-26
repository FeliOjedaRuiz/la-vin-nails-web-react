const mongoose = require("mongoose");
const { isValidUrl } = require("../utils/validations");

const photoSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "Se requiere un usuario"] 
    },
    photoUrl: {
      type: String,
      required: "Se requiere url de la fotografía",
      validate: {
        validator: isValidUrl,
        message: "Not a valid url",
      },
      default: ''
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);


const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;