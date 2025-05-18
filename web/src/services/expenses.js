import http from "./base-api";

const create = (expense) => http.post("/expenses", expense);

const listByDate = (date) => http.get(`/expenses/${date}`);

const listByMonth = (selectedMonth) => http.get(`/expenses/selectedMonth/${selectedMonth}`)

const update = (expenseId, expense) => http.patch(`/expenses/${expenseId}`, expense);

const deleteExpense = (id) => http.delete(`/expenses/${id}`);

export default {
  create,
  listByDate,
  listByMonth,
  update,
  deleteExpense,
};
