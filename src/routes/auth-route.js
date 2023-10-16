const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const authentication = require("../middlewares/authenticate");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/me", authentication, authController.getMe);

module.exports = router;