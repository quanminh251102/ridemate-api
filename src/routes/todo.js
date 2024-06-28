const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo");

router.post("", todoController.createTodo);

router.put("/:id", todoController.updateTodo);

router.get("", todoController.getTodos);

router.get("/:id", todoController.getTodoById);

router.delete("/:id", todoController.deleteTodo);

module.exports = router;