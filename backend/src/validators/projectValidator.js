const { body } = require("express-validator");

exports.createProjectValidation = [
  body("name").trim().notEmpty().withMessage("Project name is required"),

  body("description").optional().trim(),
];

exports.updateProjectValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project name cannot be empty"),

  body("description").optional().trim(),
];

exports.addMemberValidation = [
  body("userId").optional().isMongoId().withMessage("Invalid user id"),

  body("email").optional().isEmail().withMessage("Invalid email"),

  body().custom((_, { req }) => {
    if (!req.body.userId && !req.body.email) {
      throw new Error("Provide either a userId or an email to add a member");
    }
    return true;
  }),
];
