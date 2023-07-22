import http from "./base-api";

const create = (turn) => http.post('/turns', turn);

const list = () => http.get('/turns');

const detail = (turnId) => http.get(`/turns/${turnId}`)

export default {
  create,
  list,
  detail,
};