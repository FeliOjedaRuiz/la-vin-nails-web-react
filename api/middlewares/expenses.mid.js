const Expense = require("../models/expense.model");
const createError = require("http-errors");

module.exports.exists = (req, res, next) => {
  Expense.findById(req.params.expenseId)
    .then((expense) => {
      if (expense) {
        req.expense = expense;
        next();
      } else {
        next(createError(404, "Expense not found"));
      }
    })
    .catch(next);
};