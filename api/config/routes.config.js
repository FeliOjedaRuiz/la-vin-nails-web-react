const express = require("express");
const router = express.Router();

const users = require("../controllers/users.controllers");
const services = require("../controllers/services.controllers");
const turns = require("../controllers/turns.controllers");
const dates = require("../controllers/dates.controllers");

const turnsMid = require("../middlewares/turns.mid");
const datesMid = require("../middlewares/dates.mid");
const secure = require("../middlewares/secure.mid");
const usersMid = require("../middlewares/users.mid");

// USERS
router.post("/users", users.create);
router.post("/login", users.login);
router.post(
  "/sendRestoreEmail/:email",
  usersMid.exists,
  users.sendRestoreEmail
);
router.post(
  "/restorepassword/:userId",
  usersMid.checkUser,
  users.restorePassword
);
router.get("/users/:userId", secure.auth, secure.isAuthorized, users.detail);
router.patch(
  "/users/:userId",
  secure.isAdmin,
  usersMid.clientExists,
  users.update
);
router.get("/users", secure.isAdmin, users.list);

// SERVICES
router.get("/services", services.list);
router.get("/services/:id", services.detail);

// TURNS
router.post("/turns", secure.isAdmin, turns.create);
router.get("/turns", turns.list);
router.get("/turns/:id", turns.detail);
router.patch("/turns/:id", secure.auth, turnsMid.exists, turns.update);
router.delete(
  "/turns/:id",
  secure.isAdmin,
  turnsMid.exists,
  turnsMid.isFree,
  turns.delete
);

// DATES
router.post("/dates", secure.auth, dates.create);
router.get("/dates", secure.isAdmin, dates.list);
router.get("/myDates", secure.auth, dates.myList);
router.patch("/dates/:id", secure.isAdmin, datesMid.exists, dates.update);
router.delete(
  "/dates/:id",
  secure.auth,
  datesMid.exists,
  datesMid.checkOwner,
  dates.delete
);

module.exports = router;
