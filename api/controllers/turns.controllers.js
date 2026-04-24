const Turn = require('../models/turn.model');

module.exports.create = (req, res, next) => {
	Turn.create(req.body)
		.then((turn) => res.status(201).json(turn))
		.catch(next);
};

module.exports.list = async (req, res, next) => {
	try {
		const criterial = { date: { $gt: req.params.date } };
		if (req.query.endDate) {
			criterial.date.$lte = req.query.endDate;
		}

		const turns = await Turn.find(criterial).lean();

		// Fetch all relevant dates for these turns
		const turnIds = turns.map(t => t._id);
		const DateModel = require('../models/date.model');
		const dates = await DateModel.find({ turn: { $in: turnIds } })
			.populate('user')
			.populate('service')
			.lean();

		const datesByTurnId = {};
		dates.forEach(d => {
			if (d.turn) {
				// .lean() omite virtuals de toJSON → los subdocumentos populados
				// solo tienen _id. Mapeamos manualmente para que el frontend
				// pueda usar .id de forma consistente.
				const user = d.user ? { ...d.user, id: d.user._id } : d.user;
				const service = d.service ? { ...d.service, id: d.service._id } : d.service;
				datesByTurnId[d.turn.toString()] = {
					...d,
					id: d._id,
					user,
					service,
					turn: d.turn.toString()
				};
			}
		});

		const populatedTurns = turns.map(t => {
			const turnWithId = { ...t, id: t._id };
			if (datesByTurnId[t._id.toString()]) {
				turnWithId.dateData = datesByTurnId[t._id.toString()];
			} else {
				turnWithId.dateData = null;
			}
			return turnWithId;
		});

		res.json(populatedTurns);
	} catch (error) {
		next(error);
	}
};

module.exports.detail = (req, res, next) => {
	Turn.findById(req.params.id)
		.then((turn) => {
			res.json(turn);
		})
		.catch(next);
};

module.exports.update = (req, res, next) => {
	Object.assign(req.turn, req.body);
	req.turn
		.save()
		.then((turn) => res.json(turn))
		.catch(next);
};

module.exports.delete = (req, res, next) => {
	Turn.deleteOne({ _id: req.turn.id })
		.then(() => res.status(204).send())
		.catch(next);
};
