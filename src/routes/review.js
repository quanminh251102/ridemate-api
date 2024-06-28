const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.js");
const adminReviewController = require("../controllers/admin/review.js");

//admin
router.get("/admin", adminReviewController.getList);

//user
router.post("/", reviewController.create);
router.get("/", reviewController.getList);

module.exports = router;
