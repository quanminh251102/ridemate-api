const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.js");

router.post("/", notificationController.create);
router.get("/", notificationController.getList);

module.exports = router;
