const express = require("express");
const router = express.Router();
const LocationHistorySearchController = require("../controllers/location_history_search");

router.get("/:id", LocationHistorySearchController.getOne);
router.delete("/:id", LocationHistorySearchController.delete);
router.put("/:id", LocationHistorySearchController.update);

router.post("/", LocationHistorySearchController.create);
router.get("/", LocationHistorySearchController.getList);

module.exports = router;