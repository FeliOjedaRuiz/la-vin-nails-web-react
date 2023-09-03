const Date = require("../models/date.model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "melisaoviedo.92.22@gmail.com",
    pass: "xbkvskjjroqabzne",
  },
});

module.exports.create = (req, res, next) => {
  Date.create(req.body)
     .then((date) => {
      res.status(201).json(date);
      transporter
        .sendMail({
          from: "La Vin Nails Admin <melisaoviedo.92.22@gmail.com>",
          to: "m.o.92gm@gmail.com",
          subject: "Nueva solicitud de cita",
          html: `<h1>Tienes una nueva solicitud de cita</h1> <h4>De: ${req.user.name} ${req.user.surname}</h4> <h4>mail: ${req.user.email} cel: ${req.user.phone}</h4>`,
        })
        .then((info) => console.log(info))
        .catch((error) => console.log(error));
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
  Date.deleteOne({ _id: req.date.id })
    .then(
      () => {res.status(204).send(),
      console.log(`deleting date ${req.date.id}`);
      transporter
        .sendMail({
          from: "La Vin Nails Admin <melisaoviedo.92.22@gmail.com>",
          to: "m.o.92gm@gmail.com",
          subject: "Se ha cancelado una cita",
          html: `<h1>Se ha cancelado una cita</h1> <h4>De: ${req.user.name} ${req.user.surname}</h4> <h4>mail: ${req.user.email} cel: ${req.user.phone}</h4>`,
        })
        .then((info) => console.log(info))
        .catch((error) => console.log(error));    
    }
    )
    .catch(next);
};
