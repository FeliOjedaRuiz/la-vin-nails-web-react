import http from "./base-api";

const create = (expense) => http.post("/expenses", expense);

const listByDate = (date) => http.get(`/expenses/${date}`);

const update = (expenseId, expense) => http.patch(`/expenses/${expenseId}`, expense);

const deleteExpense = (id) => http.delete(`/expenses/${id}`);

export default {
  create,
  listByDate,
  update,
  deleteExpense,
};
