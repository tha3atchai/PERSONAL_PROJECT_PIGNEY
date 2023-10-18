const express = require("express");
const router = express.Router();
const piggygoalsController = require("../controllers/piggygoals-controller");
const authentication = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");

router.get("/", authentication, piggygoalsController.getMyGoal);
router.get("/record", authentication, piggygoalsController.getMyGoalRecord);
router.post("/", authentication,uploadMiddleware.fields([{name: "goalImage"}]), piggygoalsController.createGoal);
router.post("/add", authentication, piggygoalsController.addFunds);
router.post("/withdraw", authentication, piggygoalsController.withDraw);

module.exports = router;