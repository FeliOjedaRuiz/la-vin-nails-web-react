const express = require("express");
const router = express.Router();
const users = require("../controllers/users.controllers");

// USERS
router.post("/users", users.create);

module.exports = router;
