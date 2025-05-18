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
	const [targetYear, targetMonth] = targetDate.split('-');

	Expense.find()
		.then((expenses) => {
			const filteredExpenses = expenses.filter((expense) => {
				if (expense) {
					const [year, month] = expense.date.split('-');
					if (year === targetYear && month === targetMonth) {
						return true;
					}
				}
			});
			res.json(filteredExpenses);
		})
		.catch(next);
};

module.exports.update = (req, res, next) => {
	Object.assign(req.expense, req.body);
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
