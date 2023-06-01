import http from "./base-api";

const list = () => http.get("/services");

export default {
  list,
};
