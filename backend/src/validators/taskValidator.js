const { body } = require("express-validator");

const STATUSES = ["To Do", "In Progress", "Done"];
const PRIORITIES = ["Low", "Medium", "High"];

exports.createTaskValidation = [
  body("title").trim().notEmpty().withMessage("Task title is required"),

  body("description").optional().trim(),

  body("status")
    .optional()
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),

  body("priority")
    .optional()
    .isIn(PRIORITIES)
    .withMessage(`Priority must be one of: ${PRIORITIES.join(", ")}`),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("assignee").optional().isMongoId().withMessage("Invalid assignee id"),
];

exports.updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Task title cannot be empty"),

  body("description").optional().trim(),

  body("status")
    .optional()
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(", ")}`),

  body("priority")
    .optional()
    .isIn(PRIORITIES)
    .withMessage(`Priority must be one of: ${PRIORITIES.join(", ")}`),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("assignee").optional().isMongoId().withMessage("Invalid assignee id"),
];
