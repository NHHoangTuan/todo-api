const Task = require("../models/taskModel");
const AppError = require("../utils/appError");
const taskValidator = require("../validators/taskValidator");

class TaskService {
  async createTask(taskData) {
    return await Task.create(taskData);
  }

  async getAllTasks({ page = 1, limit = 10, sort, fields, filters }) {
    // Build query
    let query = Task.find(filters);

    // Sorting
    if (sort) {
      const sortBy = sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Field limiting
    if (fields) {
      const fieldList = fields.split(",").join(" ");
      query = query.select(fieldList);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Execute query
    const tasks = await query;
    const total = await Task.countDocuments(filters);

    return {
      tasks,
      pagination: {
        currentPage: page,
        limit,
        totalTasks: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(id) {
    return await Task.findById(id).populate("dependencies");
  }

  async updateTask(id, updateData) {
    // Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Validate task status update
    if (
      updateData.status &&
      (updateData.status === "in-progress" || updateData.status === "completed")
    ) {
      await taskValidator.validateTaskStatusForDependencies(
        task,
        updateData.status
      );
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return updatedTask;
  }

  async deleteTask(id) {
    // Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if this task is a dependency for any other task
    const dependentTasks = await Task.find({ dependencies: id });
    if (dependentTasks.length > 0) {
      const error = new AppError(
        "Cannot delete task - it is a dependency for other tasks",
        400
      );
      error.dependentTasks = dependentTasks.map((t) => ({
        id: t._id,
        title: t.title,
      }));
      throw error;
    }

    // Delete task
    await Task.findByIdAndDelete(id);
    return true;
  }
}

module.exports = new TaskService();
