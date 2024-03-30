import http from "./base-api";

const create = (user) => http.post("/users", user);

const login = (user) => http.post("/login", user);

const sendRestoreEmail = (email) => http.post(`/sendRestoreEmail/${email}`);

const restorePassword = (user, userId) =>
  http.post(`/restorepassword/${userId}`, user);

const detail = (id) => http.get(`/users/${id}`);

export default {
  create,
  login,
  sendRestoreEmail,
  restorePassword,
  detail,
};
