import http from "./base-api";

const create = (user) => http.post("/users", user);

const login = (user) => http.post("/login", user);

const sendRestoreEmail = (user) => http.post("/restorepassword", user);

const restorePassword = (user, userId) => http.post(`/restorepassword/${userId}`, user)

export default {
  create,
  login,
  sendRestoreEmail,
  restorePassword
};
