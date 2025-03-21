const Task = require("../models/taskModel");
const AppError = require("../utils/appError");

class TaskValidator {
  async validateTaskStatusForDependencies(task, newStatus) {
    // If the status is changing to in-progress or completed
    if (newStatus === "in-progress" || newStatus === "completed") {
      // Get all dependencies
      const dependencies = await Task.find({
        _id: { $in: task.dependencies },
      });

      // Check if all dependencies are completed
      const incompleteDependencies = dependencies.filter(
        (dep) => dep.status !== "completed"
      );

      if (incompleteDependencies.length > 0) {
        const error = new AppError(
          "Cannot update task status - it has incomplete dependencies",
          400
        );
        error.incompleteDependencies = incompleteDependencies.map((dep) => ({
          id: dep._id,
          title: dep.title,
          status: dep.status,
        }));
        throw error;
      }
    }
  }
}

module.exports = new TaskValidator();
