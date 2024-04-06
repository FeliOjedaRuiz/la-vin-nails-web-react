const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports.sendDateCreationEmail = (date) => {
  transporter
    .sendMail({
      from: "La Vin Nails <la.vin.nails.22@gmail.com>",
      to: "la.vin.nails.22@gmail.com",
      subject: "Nueva solicitud de cita",
      html: `<h1>Tienes una nueva solicitud de cita</h1> <h3>De: ${date.user.name} ${date.user.surname}</h3> <h3>mail: ${date.user.email} </h3> <h3>Móvil: +34 ${date.user.phone} </h3> <h3>Servicio: ${date.service.name}</h3> <h3>Día: ${date.turn.date} hora: ${date.turn.hour}</h3> <a href="https://la-vin-nails-app.fly.dev/">Ir a la app</a>`,
    })
    .then((info) => {
      console.log(`Sending date creation email...`);
      console.log(info);
    })
    .catch((error) => console.log(error));
};

module.exports.sendDateDeletedEmail = (date) => {
  transporter
    .sendMail({
      from: "La Vin Nails <la.vin.nails.22@gmail.com>",
      to: "la.vin.nails.22@gmail.com",
      subject: "Se ha cancelado una cita",
      html: `<h1>Se ha cancelado una cita</h1> <h3>De: ${date.user.name} ${date.user.surname}</h3> <h3>mail: ${date.user.email} </h3> <h3>Móvil: +34 ${date.user.phone} </h3> <h3>Servicio: ${date.service.name}</h3> <h3>Día: ${date.turn.date} hora: ${date.turn.hour}</h3> <a href="https://la-vin-nails-app.fly.dev/">Ir a la app</a>`,
    })
    .then((info) => {
      console.log(`Sending date deleted email...`);
      console.log(info);
    })
    .catch((error) => console.log(error));
};

module.exports.sendRestorePasswordEmail = (user) => {
  transporter
    .sendMail({
      from: "La Vin Nails <la.vin.nails.22@gmail.com>",
      to: user.email,
      subject: "Restaurar contraseña de La Vin Nails App",
      html: `<h2>Estas intentando restaurar tu contraseña para La Vin Nails APP</h2>
      <h3>Si no fuiste tu, comunicate con el administrador.</h3>
      <br />
      <h3>Para restaurar tu contraseña debes acceder al siguiente enlace:</h3>      
      <h3><a href="https://la-vin-nails-app.fly.dev/restore/${user.id}">Click aqui para restaurar contraseña</a></h3> 
      <br />
      <h4>Equipo de La Vin Nails</h4> `,
    })
    .then((info) => {
      console.log(`Sending restore password email...`);
      console.log('Message sent: %s', info.messageId)
    })
    .catch((error) => {
      console.error(error);
      console.log(error);
    });
};
