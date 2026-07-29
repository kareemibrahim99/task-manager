const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const authController = require("../controllers/authController");

const {
  registerValidation,
  loginValidation,
} = require("../validators/authValidator");

router.post("/register", registerValidation, authController.register);

router.post("/login", loginValidation, authController.login);

router.get("/profile", auth, authController.profile);

module.exports = router;
