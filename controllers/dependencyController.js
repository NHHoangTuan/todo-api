const Task = require("../models/taskModel");
const {
  checkForCircularDependency,
} = require("../utils/circularDependencyCheck");

// Add dependency
exports.addDependency = async (req, res) => {
  try {
    const { taskId, dependencyId } = req.params;

    // Check if both tasks exist
    const task = await Task.findById(taskId);
    const dependencyTask = await Task.findById(dependencyId);

    if (!task || !dependencyTask) {
      return res.status(404).json({
        success: false,
        error: "Task or dependency not found",
      });
    }

    // Check if the dependency already exists
    if (task.dependencies.includes(dependencyId)) {
      return res.status(400).json({
        success: false,
        error: "Dependency already exists",
      });
    }

    // Check for circular dependency
    const willCreateCircular = await checkForCircularDependency(
      dependencyId,
      taskId
    );

    if (willCreateCircular) {
      return res.status(400).json({
        success: false,
        error: "Adding this dependency would create a circular reference",
      });
    }

    // Add dependency
    task.dependencies.push(dependencyId);
    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Remove dependency
exports.removeDependency = async (req, res) => {
  try {
    const { taskId, dependencyId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Check if dependency exists
    if (!task.dependencies.includes(dependencyId)) {
      return res.status(400).json({
        success: false,
        error: "Dependency does not exist",
      });
    }

    // Remove dependency
    task.dependencies = task.dependencies.filter(
      (dep) => dep.toString() !== dependencyId
    );

    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all dependencies (direct and indirect)
exports.getAllDependencies = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Get direct dependencies
    const directDependencies = await Task.find({
      _id: { $in: task.dependencies },
    }).select("_id title status");

    // Get all dependencies (direct and indirect)
    const allDependencies = [];
    const processedIds = new Set();

    async function collectDependencies(ids) {
      for (const id of ids) {
        if (!processedIds.has(id.toString())) {
          processedIds.add(id.toString());

          const depTask = await Task.findById(id);

          if (depTask) {
            allDependencies.push({
              _id: depTask._id,
              title: depTask.title,
              status: depTask.status,
            });

            if (depTask.dependencies.length > 0) {
              await collectDependencies(depTask.dependencies);
            }
          }
        }
      }
    }

    await collectDependencies(task.dependencies);

    res.status(200).json({
      success: true,
      data: {
        task: {
          _id: task._id,
          title: task.title,
        },
        directDependencies,
        allDependencies, // Includes both direct and indirect
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
