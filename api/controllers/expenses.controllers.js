const Expense = require('../models/expense.model');

module.exports.create = (req, res, next) => {
	Expense.create(req.body)
		.then((expense) => {
			res.status(201).json(expense);
		})
		.catch(next);
};

module.exports.listByDate = (req, res, next) => {

	const criterial = { date: req.params.date };

	Expense.find(criterial)
		.then((expenses) => {
			res.json(expenses);
		})
		.catch(next);
};

module.exports.listByMonth = (req, res, next) => {
	const targetDate = req.params.selectedMonth;
	const dateRegex = `^${targetDate}`;

	Expense.find({ date: { $regex: dateRegex } })
		.then((expenses) => res.json(expenses))
		.catch(next);
};

module.exports.update = (req, res, next) => {
	req.expense.description = req.body.description;
	req.expense.amount = req.body.amount;
	req.expense.category = req.body.category;
	req.expense.date = req.body.date;
	req.expense
		.save()
		.then((expense) => res.json(expense))
		.catch(next);
};

module.exports.delete = (req, res, next) => {
	Expense.deleteOne({ _id: req.expense.id })
		.then(() => {
			res.status(204).send();
			console.log(`deleting expense ${req.expense.id}`);
		})
		.catch(next);
};
