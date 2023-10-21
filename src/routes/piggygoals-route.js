const express = require("express");
const router = express.Router();
const piggygoalsController = require("../controllers/piggygoals-controller");
const authentication = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");

router.get("/", authentication, piggygoalsController.getMyGoal);
router.get("/record", authentication, piggygoalsController.getMyGoalRecord);
router.get("/piggyrecord", authentication, piggygoalsController.getPiggyAndRecord);
router.get("/recorduser", authentication, piggygoalsController.getRecordAndUser);
router.post("/", authentication,uploadMiddleware.fields([{name: "goalImage"}]), piggygoalsController.createGoal);
router.post("/add", authentication, piggygoalsController.addFunds);
router.post("/withdraw", authentication, piggygoalsController.withDraw);
router.put("/success/:piggyId", authentication, piggygoalsController.goalSuccess);
router.patch("/update", authentication, piggygoalsController.updateGoal);
router.patch("/image/:piggyId", authentication,uploadMiddleware.fields([{name: "goalImage", maxCount: 1}]), piggygoalsController.updateGoalImage);
router.delete("/delete/:piggyId", authentication, piggygoalsController.deleteGoal);

module.exports = router;