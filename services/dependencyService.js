const Task = require("../models/taskModel");
const {
  checkForCircularDependency,
} = require("../utils/circularDependencyCheck");
const AppError = require("../utils/appError");

class DependencyService {
  async addDependency(taskId, dependencyId) {
    // Check if both tasks exist
    const task = await Task.findById(taskId);
    const dependencyTask = await Task.findById(dependencyId);

    if (!task || !dependencyTask) {
      throw new AppError("Task or dependency task not found", 404);
    }

    // Check if the dependency already exists
    if (task.dependencies.includes(dependencyId)) {
      throw new AppError("Dependency already exists", 400);
    }

    // Check for circular dependency
    const willCreateCircular = await checkForCircularDependency(
      dependencyId,
      taskId
    );

    if (willCreateCircular) {
      throw new AppError(
        "Adding this dependency would create a circular reference",
        400
      );
    }

    // Add dependency
    task.dependencies.push(dependencyId);
    await task.save();

    return task;
  }

  async removeDependency(taskId, dependencyId) {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if dependency exists
    if (!task.dependencies.includes(dependencyId)) {
      throw new AppError("Dependency does not exist", 400);
    }

    // Remove dependency
    task.dependencies = task.dependencies.filter(
      (dep) => dep.toString() !== dependencyId
    );

    await task.save();

    return task;
  }

  async getAllDependencies(taskId) {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Get direct dependencies
    const directDependencies = await Task.find({
      _id: { $in: task.dependencies },
    }).select("_id title status");

    // Get all dependencies (direct and indirect)
    const allDependencies = [];
    const processedIds = new Set();

    await this.collectDependencies(
      task.dependencies,
      processedIds,
      allDependencies
    );

    return {
      task: {
        _id: task._id,
        title: task.title,
      },
      directDependencies,
      allDependencies, // Includes both direct and indirect
    };
  }

  async collectDependencies(ids, processedIds, allDependencies) {
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
            await this.collectDependencies(
              depTask.dependencies,
              processedIds,
              allDependencies
            );
          }
        }
      }
    }
  }

  async addMultipleDependencies(taskId, dependencyIds) {
    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Track success and errors
    const results = {
      successful: [],
      failed: [],
    };

    // Process each dependency ID
    for (const dependencyId of dependencyIds) {
      try {
        // Check if dependency task exists
        const dependencyTask = await Task.findById(dependencyId);
        if (!dependencyTask) {
          results.failed.push({
            dependencyId,
            reason: "Dependency task not found",
          });
          continue;
        }

        // Check if already exists
        if (task.dependencies.includes(dependencyId)) {
          results.failed.push({
            dependencyId,
            reason: "Dependency already exists",
          });
          continue;
        }

        // Check for circular dependency
        const willCreateCircular = await checkForCircularDependency(
          dependencyId,
          taskId
        );

        if (willCreateCircular) {
          results.failed.push({
            dependencyId,
            reason: "Would create circular reference",
          });
          continue;
        }

        // Add dependency
        task.dependencies.push(dependencyId);
        results.successful.push(dependencyId);
      } catch (err) {
        results.failed.push({
          dependencyId,
          reason: err.message,
        });
      }
    }

    // Save task if any dependencies were added
    if (results.successful.length > 0) {
      await task.save();
    }

    return {
      task: {
        _id: task._id,
        title: task.title,
      },
      results,
    };
  }
}

module.exports = new DependencyService();
