const express = require("express");
const router = express.Router();
const LocationSavedController = require("../controllers/location_saved");

router.get("/:id", LocationSavedController.getOne);
router.delete("/:id", LocationSavedController.delete);
router.put("/:id", LocationSavedController.update);

router.post("/", LocationSavedController.create);
router.get("/", LocationSavedController.getList);

module.exports = router;