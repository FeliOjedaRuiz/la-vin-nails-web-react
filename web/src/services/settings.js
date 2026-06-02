import http from "./base-api";

const getAll = () => http.get("/settings");

const getByKey = (key) => http.get(`/settings/${key}`);

const update = (key, value) => http.patch(`/settings/${key}`, { value });

const settingsApi = {
  getAll,
  getByKey,
  update,
};

export default settingsApi;