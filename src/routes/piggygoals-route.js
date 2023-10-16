const express = require("express");
const router = express.Router();
const piggygoalsController = require("../controllers/piggygoals-controller");
const authentication = require("../middlewares/authenticate");

router.post("/", authentication, piggygoalsController.createGoal);

module.exports = router;