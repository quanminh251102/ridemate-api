const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const auth = require("../middleware/auth");

router.post("/register", authController.register);

router.post("/login", authController.login);
router.post("/loginWithGoogle", authController.loginWithGoogle);

router.post("/resetPassword", authController.resetPassword);

router.post("/refresh", authController.refresh);

router.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

module.exports = router;
