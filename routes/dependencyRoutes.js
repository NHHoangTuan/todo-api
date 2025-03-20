const express = require("express");
const router = express.Router();
const {
  addDependency,
  removeDependency,
  getAllDependencies,
} = require("../controllers/dependencyController");

// Add dependency
router.post("/tasks/:taskId/dependencies/:dependencyId", addDependency);

// Remove dependency
router.delete("/tasks/:taskId/dependencies/:dependencyId", removeDependency);

// Get all dependencies (direct and indirect)
router.get("/tasks/:taskId/dependencies", getAllDependencies);

module.exports = router;
