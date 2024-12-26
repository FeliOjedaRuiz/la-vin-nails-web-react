import http from "./base-api";

const upload = (file) => http.post("/upload", file)

const create = (photo) => http.post("/photos", photo);

const list = () => http.get("/photos");

const listByUser = (userId) => http.get(`/photos/${userId}`);

const deletephoto = (id) => http.delete(`/photos/${id}`);

export default {
  upload,
  create,
  list,
  listByUser,
  deletephoto,
};