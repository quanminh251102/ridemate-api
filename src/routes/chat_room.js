const express = require("express");
const router = express.Router();
const chatRoomController = require("../controllers/chat_room");

router.get("/:id", chatRoomController.getOne);
router.get("/", chatRoomController.getList);
router.post("/", chatRoomController.create);

module.exports = router;
