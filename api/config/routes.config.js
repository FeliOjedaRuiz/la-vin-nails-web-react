const express = require("express");
const router = express.Router();
const users = require("../controllers/users.controllers");
const services = require("../controllers/services.controllers");
const turns = require("../controllers/turns.controllers");

// USERS
router.post("/users", users.create);
router.post("/login", users.login);


// SERVICES
router.get("/services", services.list);


// TURNS
router.post("/turns", turns.create);
router.get("/turns", turns.list);
router.get("/turns/:id", turns.detail);


module.exports = router;
