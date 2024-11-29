const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");
const { authMiddleware } = require("../middleware/auth");

// Apply auth middleware
router.use(authMiddleware);

// Routes
router.get("/", todoController.getAllTodos);
router.post("/", todoController.createTodo);
router.get("/:id", todoController.getTodo);
router.put("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

module.exports = router;
