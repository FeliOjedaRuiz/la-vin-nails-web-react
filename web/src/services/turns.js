import http from "./base-api";

const create = (turn) => http.post('/turns', turn);

const list = () => http.get('/turns')

export default {
  create,
  list,
};