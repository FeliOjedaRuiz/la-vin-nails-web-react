require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const createError = require("http-errors");
const secure = require("./middlewares/secure.mid");

//** Load configuration */
require("./config/db.config");
const app = express();

const cors = require("./config/cors.config");
app.use(cors);
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(logger("dev"));
app.use(secure.cleanBody);


//** Configuración Notion */

const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = "11d24cbdade3809fa1bdf7f65f05f8bd";

app.get("/api/v1/notices", async (req, res, next) => {
  try {
    const query = { database_id: DATABASE_ID };
    const { results } = await notion.databases.query(query);

    // Aquí se filtra por slug si se pasa como query param
    const { slug } = req.query; // Obtener el parámetro de la query (si lo hay)

    const filteredResults = results
      .map((page) => {
        const { properties } = page;
        const title = properties.title?.title[0]?.plain_text || "No Title";
        const description = properties.description?.rich_text[0]?.plain_text || "No Description";
        const subtitle = properties.subtitle?.rich_text[0]?.plain_text || "No Subtitle";
        const slugValue = properties.slug?.rich_text[0]?.plain_text || null;
        const active = properties.active?.checkbox || false;

        return {
          title,
          description,
          subtitle,
          slug: slugValue,
          active,
        };
      })
      .filter((page) => {
        // Filtrar solo si hay un slug en la query
        return slug ? page.slug === slug : true;
      });

    // Devuelve los resultados filtrados o todos si no se pasó un slug
    res.json(filteredResults);
  } catch (error) {
    console.error(error);
    next(createError(500, "Error fetching data from Notion"));
  }
});

//** Rutas de api la vin nails */

const api = require("./config/routes.config");
app.use("/api/v1", api);

app.get("/*", (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

//** Error Handling */
app.use((req, res, next) => next(createError(404, "Route not found")));

app.use((error, req, res, next) => {
  console.error(error);
  if (error instanceof mongoose.Error.ValidationError) {
    error = createError(400, error);
  } else if (
    error instanceof mongoose.Error.CastError &&
    error.path === "_id"
  ) {
    const resourceName = error.model().constructor.modelName;
    error = createError(404, `${resourceName} not found`);
  } else if (error.message.includes("E11000")) {
    // Duplicate keys
    Object.keys(error.keyValue).forEach(
      (key) => (error.keyValue[key] = "Already exists")
    );
    error = createError(409, { errors: error.keyValue });
  } else if (!error.status) {
    error = createError(500, error);
  }
  console.error(error);

  const data = {
    message: error.message,
  };

  if (error.errors) {
    const errors = Object.keys(error.errors).reduce((errors, errorKey) => {
      errors[errorKey] =
        error.errors[errorKey]?.message || error.errors[errorKey];
      return errors;
    }, {});
    data.errors = errors;
  }

  res.status(error.status).json(data);
});

const port = process.env.PORT || 3002;
app.listen(port, () => console.info(`aplication is running at port ${port}`));
