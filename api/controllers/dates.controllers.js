const Date = require('../models/date.model');
const mailer = require('../config/mailer.config');

module.exports.create = (req, res, next) => {
	Date.create(req.body)
		.then((date) => {
			res.status(201).json(date);
			Date.findById(date.id)
				.populate('turn')
				.populate('user')
				.populate('service')
				.then((date) => {
					mailer.sendDateCreationEmail(date);
				});
		})
		.catch(next);
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

	Date.find()
		.populate('turn')
		.then((dates) => {
			const filteredDates = dates.filter((date) => {
				if (date.turn) {
					const [year, month] = date.turn.date.split('-');
					if (year === targetYear && month === targetMonth) {
						return true;
					}
				}
			});
			res.json(filteredDates);
		})
		.catch(next);
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
