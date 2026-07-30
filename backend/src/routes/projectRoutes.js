const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const checkProjectAccess = require("../middleware/checkProjectAccess");

const projectController = require("../controllers/projectController");

const {
  createProjectValidation,
  updateProjectValidation,
  addMemberValidation,
} = require("../validators/projectValidator");

router.use(auth);

router.post("/", createProjectValidation, projectController.createProject);

router.get("/", projectController.getProjects);

router.get("/:id", checkProjectAccess, projectController.getProject);

router.put(
  "/:id",
  checkProjectAccess,
  updateProjectValidation,
  projectController.updateProject,
);

router.delete("/:id", checkProjectAccess, projectController.deleteProject);

router.post(
  "/:id/members",
  checkProjectAccess,
  roleMiddleware("Admin"),
  addMemberValidation,
  projectController.addMember,
);

router.delete(
  "/:id/members/:userId",
  checkProjectAccess,
  roleMiddleware("Admin"),
  projectController.removeMember,
);

module.exports = router;
