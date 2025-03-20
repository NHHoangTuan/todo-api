const Task = require("../models/taskModel");

// Function to check for circular dependencies
exports.checkForCircularDependency = async (sourceTaskId, targetTaskId) => {
  // If source and target are the same, it's obviously circular
  if (sourceTaskId === targetTaskId) {
    return true;
  }

  const visited = new Set();

  // DFS function to traverse the dependency tree
  async function hasCycle(currentTaskId) {
    // If we've seen this task before, we found a cycle
    if (visited.has(currentTaskId.toString())) {
      return false;
    }

    // If current task is our target, we found a path from target to source
    // which means adding source as a dependency of target would create a cycle
    if (currentTaskId.toString() === targetTaskId.toString()) {
      return true;
    }

    visited.add(currentTaskId.toString());

    const task = await Task.findById(currentTaskId);
    if (!task) return false;

    // Look through all dependencies of the current task
    for (const depId of task.dependencies) {
      if (await hasCycle(depId)) {
        return true;
      }
    }

    return false;
  }

  // Start DFS from source task
  return await hasCycle(sourceTaskId);
};
