const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statistics");

router.get("", statisticsController.get);

module.exports = router;