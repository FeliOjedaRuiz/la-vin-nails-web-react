import http from "./base-api";

const list = () => http.get("/services");

const detail = (id) => http.get(`/services/${id}`)

export default {
  list,
  detail,
};
