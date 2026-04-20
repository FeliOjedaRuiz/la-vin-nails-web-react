import http from "./base-api";

const create = (turn) => http.post("/turns", turn);

const list = (date, endDate) => {
  const url = endDate ? `/turns/date/${date}?endDate=${endDate}` : `/turns/date/${date}`;
  return http.get(url);
};

const detail = (id) => http.get(`/turns/${id}`);

const update = (id, turn) => http.patch(`/turns/${id}`, turn);

const deleteTurn = (id) => http.delete(`/turns/${id}`);

export default {
  create,
  list,
  detail,
  update,
  deleteTurn,
};
