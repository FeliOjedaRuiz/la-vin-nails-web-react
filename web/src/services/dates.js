import http from "./base-api";

const create = (date) => http.post('/dates', date);

const list = (query) => http.get('/dates', { params: query });

const detail = (id) => http.get(`/dates/${id}`)

const update = (id, date) => http.patch(`/dates/${id}`, date)

export default {
  create,
  list,
  detail,
  update,
};