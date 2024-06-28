const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.js");

router.post("/find-1-booking", bookingController.getBookingInChatBot);


module.exports = router;
