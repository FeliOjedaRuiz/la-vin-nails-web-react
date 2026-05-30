const Turn = require('../models/turn.model');

module.exports.create = (req, res, next) => {
	Turn.create(req.body)
		.then((turn) => res.status(201).json(turn))
		.catch(next);
};

module.exports.list = async (req, res, next) => {
	try {
		let startDate = req.params.date;

		// Si no es administrador, aplicamos restricciones de visibilidad
		if (req.user?.role !== 'admin') {
			// --- Suelo: no ver semanas pasadas ---
			// Calculamos el inicio de la semana actual en UTC (domingo)
			const now = new Date();
			const currentWeekStart = new Date(now);
			currentWeekStart.setDate(now.getDate() - now.getDay());
			currentWeekStart.setHours(0, 0, 0, 0);
			const currentWeekStartStr = currentWeekStart.toISOString().split('T')[0];
			if (startDate < currentWeekStartStr) {
				startDate = currentWeekStartStr;
			}

			// --- Techo: no ver más allá del mes siguiente (hora España) ---
			// El día 1 del mes M se abren los turnos del mes M+1.
			// Usamos Intl para leer la fecha actual en Europe/Madrid sin librerías.
			const spainDateStr = new Intl.DateTimeFormat('en-CA', {
				timeZone: 'Europe/Madrid',
				year: 'numeric', month: '2-digit', day: '2-digit',
			}).format(new Date()); // Formato: 'YYYY-MM-DD'
			const [spainYear, spainMonth] = spainDateStr.split('-').map(Number);

			// Mes visible más lejano = mes actual + 1 (0-indexed)
			// June exception: June (6) → M+2 (2 months ahead)
			const isJuneException = spainMonth === 6;
			const maxMonth = isJuneException ? spainMonth + 1 : spainMonth % 12; // M+2 for June only
			const maxYear = isJuneException ? spainYear : (spainMonth === 12 ? spainYear + 1 : spainYear);
			// Último día del mes visible: día 0 del mes posterior
			const lastDayOfMaxMonth = new Date(maxYear, maxMonth + 1, 0);
			const maxEndDate = `${lastDayOfMaxMonth.getFullYear()}-${String(lastDayOfMaxMonth.getMonth() + 1).padStart(2, '0')}-${String(lastDayOfMaxMonth.getDate()).padStart(2, '0')}`;

			// Forzar endDate al límite si no hay uno o si excede el máximo
			if (!req.query.endDate || req.query.endDate > maxEndDate) {
				req.query.endDate = maxEndDate;
			}
		}

		const criterial = { date: { $gt: startDate } };
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
