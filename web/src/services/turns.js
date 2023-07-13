import http from "./base-api";

const create = (turn) => http.post('/turns', turn)

export default {
  create,
};