const express = require("express");
const router = express.Router();
const users = require("../controllers/users.controllers");
const services = require("../controllers/services.controllers");

// USERS
router.post("/users", users.create);

router.post("/login", users.login);

// SERVICES
router.get("/services", services.list);

module.exports = router;
