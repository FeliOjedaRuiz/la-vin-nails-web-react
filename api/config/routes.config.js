const express = require("express");
const router = express.Router();

const users = require("../controllers/users.controllers");
const services = require("../controllers/services.controllers");
const turns = require("../controllers/turns.controllers");

const turnsMid = require("../middlewares/turns.mid");

// USERS
router.post("/users", users.create);
router.post("/login", users.login);

// SERVICES
router.get("/services", services.list);

// TURNS
router.post("/turns", turns.create);
router.get("/turns", turns.list);
router.get("/turns/:id", turns.detail);
router.patch("/turns/:id", turnsMid.exists, turns.update);
router.delete("/turns/:id");

// DATES
router.post("/dates");
router.get("/dates");

module.exports = router;
