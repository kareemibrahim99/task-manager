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

const taskRoutes = require("./taskRoutes");

// Every project (and task) route requires a logged-in user.
router.use(auth);

router
  .route("/")
  .post(createProjectValidation, projectController.createProject)
  .get(projectController.getProjects);

router
  .route("/:id")
  .get(checkProjectAccess, projectController.getProject)
  .put(checkProjectAccess, updateProjectValidation, projectController.updateProject)
  .delete(checkProjectAccess, projectController.deleteProject);


router.post(
  "/:id/members",
  checkProjectAccess,
  roleMiddleware("Admin"),
  addMemberValidation,
  projectController.addMember
);

router.delete(
  "/:id/members/:userId",
  checkProjectAccess,
  roleMiddleware("Admin"),
  projectController.removeMember
);

router.use("/:projectId/tasks", checkProjectAccess, taskRoutes);

module.exports = router;
