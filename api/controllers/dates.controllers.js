const Date = require("../models/date.model");

// const nodemailer = require("nodemailer");

// const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "melisaoviedo.92.22@gmail.com",
//     pass: EMAIL_PASSWORD,
//   },
// });

module.exports.create = (req, res, next) => {
  Date.create(req.body)
    .then((date) => {
      res.status(201).json(date);
    })
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
  const criterial = { user: req.user.id };

  if (req.user) {
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

module.exports.delete = (req, res, next) => {
  Date.findById(req.date.id)
    .populate("turn")
    .populate("user")
    .populate("service")
    .then((dateEmail) => {
      Date.deleteOne({ _id: req.date.id }).then(() => {
        res.status(204).send(), console.log(`deleting date ${req.date.id}`);
        transporter
          .sendMail({
            from: "La Vin Nails Admin <melisaoviedo.92.22@gmail.com>",
            to: "m.o.92gm@gmail.com",
            subject: "Se ha cancelado una cita",
            html: `<h1>Se ha cancelado una cita</h1> <h3>De: ${dateEmail.user.name} ${dateEmail.user.surname}</h3> <h3>mail: ${dateEmail.user.email} </h3> <h3>Móvil: +34 ${dateEmail.user.phone} </h3> <h3>Servicio: ${dateEmail.service.name}</h3> <h3>Día: ${dateEmail.turn.date} hora: ${dateEmail.turn.hour}</h3> <a href="https://la-vin-nails-app.fly.dev/">Ir a la app</a>`,
          })
          .then((info) => console.log(info))
          .catch((error) => console.log(error));
      });
    })
    .catch(next);
};
