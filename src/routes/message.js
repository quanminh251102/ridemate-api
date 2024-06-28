const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message");


//user
router.patch("/:id", messageController.update);
router.post("/", messageController.create);
router.get("/", messageController.getList);

module.exports = router;