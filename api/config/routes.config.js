const express = require("express");
const router = express.Router();

const users = require("../controllers/users.controllers");
const services = require("../controllers/services.controllers");
const turns = require("../controllers/turns.controllers");
const dates = require("../controllers/dates.controllers");

const turnsMid = require("../middlewares/turns.mid");
const datesMid = require("../middlewares/dates.mid");
const secure = require('../middlewares/secure.mid');

// USERS
router.post("/users", users.create);
router.post("/login", users.login);

// SERVICES
router.get("/services", services.list);
router.get("/services/:id", services.detail);

// TURNS
router.post("/turns", /*checkAdmin */ turns.create);
router.get("/turns", turns.list);
router.get("/turns/:id", turns.detail);
router.patch("/turns/:id", /*checkAdmin*/ turnsMid.exists, turns.update);
router.delete("/turns/:id", secure.auth, turnsMid.exists, /*checkAdmin turnFree */ turns.delete);

// DATES
router.post("/dates", secure.auth, dates.create);
router.get("/dates", secure.auth, /*checkAdmin*/ dates.list);
router.get("/myDates", secure.auth, dates.myList);
router.patch("/dates/:id", /*checkAdmin*/ datesMid.exists, dates.update);
router.delete("/dates/:id", secure.auth, datesMid.exists, datesMid.checkOwner, dates.delete)

module.exports = router;
