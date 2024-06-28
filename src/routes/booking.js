const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.js");
const bookingSavedController = require("../controllers/booking_saved.js");
const adminBookingController = require("../controllers/admin/booking.js");

//admin
router.get("/admin", adminBookingController.getList);

//user
router.post("/saved/:id", bookingSavedController.add);
router.delete("/saved/:id", bookingSavedController.delete);


router.get("/recommend", bookingController.getRecommend);
router.put("/:id", bookingController.update);
router.patch("/:id", bookingController.updateSome);
router.delete("/:id", bookingController.delete);
router.get("/", bookingController.getList);
router.post("/", bookingController.create);

module.exports = router;
