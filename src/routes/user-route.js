const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");
const userController = require("../controllers/user-controller");

router.patch("/", authentication, uploadMiddleware.fields([{name: "profileImage", maxCount: 1}]), userController.updateProfile);

module.exports = router;