var express = require("express");

const {
  userRegister,
  verifyEmail,
  loginUser,
  forgotPassword,
  verifyCode,
  resetPassword,
} = require("../controllers/users");

var router = express.Router();

router.post("/register", userRegister);

router.get("/verify-email/:token", verifyEmail);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

router.post("/confirm-reset-password-code", verifyCode);

router.post("/reset-password", resetPassword);

module.exports = router;
