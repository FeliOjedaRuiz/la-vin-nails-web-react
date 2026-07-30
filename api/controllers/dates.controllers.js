const createError = require('http-errors');
const Date = require('../models/date.model');
const Turn = require('../models/turn.model');
const Service = require('../models/service.model');
const mailer = require('../config/mailer.config');
const pushService = require('../utils/push.service');

// NOTE: retiro identity is tied to `service.name === "Retiro"` (see api/bin/services.seed.js).
// If the seed name is renamed, update this helper AND the frontend DatesForm derivation.
const RETIRO_SERVICE_NAME = 'Retiro';

async function assertServiceTurnCompatibility(turnId, serviceId) {
	const [turn, service] = await Promise.all([
		Turn.findById(turnId).lean(),
		Service.findById(serviceId).lean(),
	]);

	if (!turn) {
		throw createError(400, 'Turno no encontrado');
	}
	if (!service) {
		throw createError(400, 'Servicio no encontrado');
	}

	const isRetiroService = service.name === RETIRO_SERVICE_NAME;
	const isRetiroTurn = turn.category === 'retiro';

	if (isRetiroService !== isRetiroTurn) {
		const message = isRetiroService
			? 'El servicio Retiro solo puede reservarse en turnos marcados como retiro.'
			: 'Los turnos marcados como retiro solo admiten el servicio Retiro.';
		throw createError(400, message);
	}
}

module.exports.create = async (req, res, next) => {
	try {
		await assertServiceTurnCompatibility(req.body.turn, req.body.service);
		const date = await Date.create(req.body);
		res.status(201).json(date);
		Date.findById(date.id)
			.populate('turn')
			.populate('user')
			.populate('service')
			.then((date) => {
				if (!date) return;
				mailer.sendDateCreationEmail(date);

				// Push a los Administradores
				const clientName = date.user?.name || 'Un cliente';
				const serviceName = date.service?.name || 'un servicio';
				pushService.notifyAdmins({
					title: '🗓️ Nueva Reserva',
					body: `${clientName} ha reservado ${serviceName}.`,
					url: date.turn?._id ? `/turns/${date.turn._id}` : '/admin-schedule'
				});
			});
	} catch (error) {
		next(error);
	}
};

module.exports.list = (req, res, next) => {
	const { turn } = req.query;

	const criterial = {};
	if (turn) criterial.turn = turn;

	Date.find(criterial)
		.populate('turn')
		.populate('user')
		.populate('service')
		.then((dates) => res.json(dates))
		.catch(next);
};

module.exports.myList = (req, res, next) => {
	const criterial = { user: req.user.id };

	if (req.user) {
		Date.find(criterial)
			.populate('turn')
			.populate('user')
			.populate('service')
			.then((dates) => res.json(dates))
			.catch(next);
	}
};

module.exports.listByUser = (req, res, next) => {
	const criterial = { user: req.params.userId };

	Date.find(criterial)
		.populate('turn')
		.populate('user')
		.populate('service')
		.then((dates) => res.json(dates))
		.catch(next);
};

module.exports.listByDate = (req, res, next) => {
	const targetDate = req.params.selectedDate;

	Date.find()
		.populate('turn')
		.populate('user')
		.then((dates) => {
			const filteredDates = dates.filter((date) => {
				if (date.turn) {					
					if (date.turn.date === targetDate) {
						return true;
					}
				}
			});
			res.json(filteredDates);
		})
		.catch(next);
};

module.exports.listByMonth = (req, res, next) => {
	const targetDate = req.params.selectedMonth;
	const [targetYear, targetMonth] = targetDate.split('-');
	const dateRegex = `^${targetYear}-${targetMonth}`;

	Date.aggregate([
		{
			$lookup: {
				from: 'turns',
				localField: 'turn',
				foreignField: '_id',
				as: 'turn',
			},
		},
		{
			$unwind: {
				path: '$turn',
				preserveNullAndEmptyArrays: false,
			},
		},
		{
			$match: {
				'turn.date': { $regex: dateRegex },
			},
		},
	])
		.then((dates) => res.json(dates))
		.catch(next);
};

module.exports.update = async (req, res, next) => {
	try {
		const turnId = req.body.turn ?? req.date.turn;
		const serviceId = req.body.service ?? req.date.service;
		await assertServiceTurnCompatibility(turnId, serviceId);
		Object.assign(req.date, req.body);
		const date = await req.date.save();
		res.json(date);
	} catch (error) {
		next(error);
	}
};

module.exports.delete = (req, res, next) => {
	Date.findById(req.date.id)
		.populate('turn')
		.populate('user')
		.populate('service')
		.then((date) => {
			Date.deleteOne({ _id: req.date.id }).then(() => {
				res.status(204).send();
				console.log(`deleting date ${req.date.id}`);
				mailer.sendDateDeletedEmail(date);
			});
		})
		.catch(next);
};
