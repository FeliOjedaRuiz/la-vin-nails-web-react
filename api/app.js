require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const createError = require("http-errors");

const app = express();

app.use(logger("dev"));

app.use((req, res, next) => next(createError(404, "Route not found")));

app.use((error, req, res, next) => {
  if (!error.status) {
    error = createError(500, error);
  }
  console.error(error);

  const data = {
    message: error.message
  }

  res.status(error.status).json()
});

const port = process.env.PORT || 3002;
app.listen(port, () => console.info(`aplication is running at port ${port}`));
