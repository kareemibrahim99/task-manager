const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const taskController = require("../controllers/taskController");

const {
  createTaskValidation,
  updateTaskValidation,
} = require("../validators/taskValidator");

router.use(auth);

router.post("/", createTaskValidation, taskController.createTask);

router.get("/", taskController.getTasks);

router.get("/:taskId", taskController.getTask);

router.put("/:taskId", updateTaskValidation, taskController.updateTask);

router.delete("/:taskId", taskController.deleteTask);

module.exports = router;