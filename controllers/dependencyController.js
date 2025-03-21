const dependencyService = require("../services/dependencyService");
const asyncHandler = require("../middleware/asyncHandler");

// Add dependency
exports.addDependency = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { dependencyId } = req.body;

  // Validate required fields
  if (!dependencyId) {
    return res.status(400).json({
      success: false,
      error: "dependencyId is required in request body",
    });
  }

  // Add dependency via service
  const task = await dependencyService.addDependency(taskId, dependencyId);

  res.status(200).json({
    success: true,
    data: task,
  });
});

// Remove dependency
exports.removeDependency = asyncHandler(async (req, res) => {
  const { taskId, dependencyId } = req.params;

  const task = await dependencyService.removeDependency(taskId, dependencyId);

  res.status(200).json({
    success: true,
    data: task,
  });
});

// Get all dependencies (direct and indirect)
exports.getAllDependencies = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const dependencies = await dependencyService.getAllDependencies(taskId);

  res.status(200).json({
    success: true,
    data: dependencies,
  });
});
