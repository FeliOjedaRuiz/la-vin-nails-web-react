const express = require("express");
const router = express.Router();

const users = require("../controllers/users.controllers");
const services = require("../controllers/services.controllers");
const turns = require("../controllers/turns.controllers");
const dates = require("../controllers/dates.controllers");

const turnsMid = require("../middlewares/turns.mid");

// USERS
router.post("/users", users.create);
router.post("/login", users.login);

// SERVICES
router.get("/services", services.list);
router.get("/services/:id", services.detail);

// TURNS
router.post("/turns", turns.create);
router.get("/turns", turns.list);
router.get("/turns/:id", turns.detail);
router.patch("/turns/:id", turnsMid.exists, turns.update);
router.delete("/turns/:id");

// DATES
router.post("/dates", dates.create);
router.get("/dates", dates.list);

module.exports = router;
