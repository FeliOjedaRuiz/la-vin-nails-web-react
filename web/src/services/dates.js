import http from './base-api';

const create = (date) => http.post('/dates', date);

const list = (query) => http.get('/dates', { params: query });

const listByUser = (userId) => http.get(`/dates/${userId}`);

const listByDate = (selectedDate) =>
	http.get(`/dates/selectedDate/${selectedDate}`);

const listByMonth = (selectedMonth) => http.get(`/dates/selectedMonth/${selectedMonth}`)

const myList = () => http.get('/myDates/');

const detail = (id) => http.get(`/dates/${id}`);

const update = (id, date) => http.patch(`/dates/${id}`, date);

const deleteDate = (id) => http.delete(`/dates/${id}`);

export default {
	create,
	list,
	myList,
	listByUser,
	listByDate,
	listByMonth,
	detail,
	update,
	deleteDate,
};
