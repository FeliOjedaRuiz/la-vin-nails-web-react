const User = require('../models/user.model');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const mailer = require('../config/mailer.config');

const maxSessionTime = parseInt(process.env.MAX_SESSION_TIME) || 3_600;

module.exports.create = (req, res, next) => {
	User.create(req.body)
		.then((user) => res.status(201).json(user))
		.catch(next);
};

module.exports.login = (req, res, next) => {
	User.findOne({ email: req.body.email })
		.then((user) => {
			if (!user) {
				return next(
					createError(401, { errors: { password: 'Credenciales invalidas' } })
				);
			}
			user.checkPassword(req.body.password).then((match) => {
				if (!match) {
					console.log('AQUI');
					return next(
						createError(401, { errors: { password: 'Credenciales invalidas' } })
					);
				}
				const token = jwt.sign(
					{ sub: user.id, exp: Date.now() / 1000 + maxSessionTime },
					process.env.JWT_SECRET
				);
				res.json({ token, ...user.toJSON() });
			});
		})
		.catch(next);
};

module.exports.sendRestoreEmail = (req, res, next) => {
	User.findOne({ email: req.user.email })
		.then((user) => {
			mailer.sendRestorePasswordEmail(user);
		})
		.catch(next);
};

module.exports.restorePassword = (req, res, next) => {
	Object.assign(req.user, req.body);
	req.user
		.save()
		.then((user) => {
			res.json(user);
		})
		.catch(next);
};

module.exports.detail = (req, res, next) => {
	User.findById(req.params.userId)
		.then((user) => res.json(user))
		.catch(next);
};


module.exports.update = (req, res, next) => {
  User.findByIdAndUpdate(req.clientUser.id, req.body)
    .then((user) => {
      User.findById(user.id)
        .then((user) => {
          res.json(user);
        })
    })
    .catch(next);
};

module.exports.list = (req, res, next) => {
	User.find()
		.then((users) => res.json(users))
		.catch(next);
};
