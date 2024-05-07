import http from "./base-api";

const create = (user) => http.post("/users", user);

const login = (user) => http.post("/login", user);

const sendRestoreEmail = (email) => http.post(`/sendRestoreEmail/${email}`);

const restorePassword = (user, userId) =>
  http.post(`/restorepassword/${userId}`, user);

const detail = (userId) => http.get(`/users/${userId}`);

const update = (userId, user) => http.patch(`/users/${userId}`, user);

const list = () => http.get("/users");

export default {
  create,
  login,
  sendRestoreEmail,
  restorePassword,
  detail,
  update,
  list,
};
