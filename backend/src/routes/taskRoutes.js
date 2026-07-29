const express = require("express");


const router = express.Router({ mergeParams: true });

const taskController = require("../controllers/taskController");

const {
  createTaskValidation,
  updateTaskValidation,
} = require("../validators/taskValidator");

router
  .route("/")
  .post(createTaskValidation, taskController.createTask)
  .get(taskController.getTasks);

router
  .route("/:taskId")
  .get(taskController.getTask)
  .put(updateTaskValidation, taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
