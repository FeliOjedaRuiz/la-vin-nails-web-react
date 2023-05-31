const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ADMIN_USERS = (process.env.ADMIN_USERS || "admin@lavin.org")
  .split(",")
  .map((email) => email.trim());

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "Es necesario un nombre",
      maxLength: [20, "Máximo 20 caracteres"],
      minlength: [2, "Necesitamos al menos 2 caracteres"],
    },
    surname: {
      type: String,
      required: "Es necesario almenos un apellido",
      maxLength: [20, "Máximo 20 caracteres"],
      minlength: [2, "Es necesario al menos 2 caracteres"],
    },
    phone: {
      type: Number,
      required: [true, "Es necesario número de móvil"],
    },
    email: {
      type: String,
      required: [true, "Es necesario un email"],
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Es necesaria una contraseña"],
      minLength: [8, "Largo minimo 8 caracteres"],
      maxLength: [16, "Largo máximo 16 caracteres"],
    },
    role: {
      type: String,
      enum: ["admin", "guest"],
      default: "guest",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;

  if (ADMIN_USERS.includes(user.email)) {
    user.role = "admin";
  }

  if (user.isModified("password")) {
    bcrypt
      .hash(user.password, 10)
      .then((encryptedPassword) => {
        user.password = encryptedPassword;
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
