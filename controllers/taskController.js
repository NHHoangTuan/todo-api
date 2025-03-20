const Task = require("../models/taskModel");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
    });

    res.status(201).json({
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

// Get all tasks with filtering and pagination
exports.getTasks = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Filtering
    let query = Task.find(queryObj);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const tasks = await query;

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        currentPage: page,
        limit,
        totalTasks: await Task.countDocuments(),
      },
      data: tasks,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("dependencies");

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

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

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Check status of dependent tasks
    if (req.body.status === "in-progress" || req.body.status === "completed") {
      const dependencies = await Task.find({
        _id: { $in: task.dependencies },
      });

      const incompleteDependencies = dependencies.filter(
        (dep) => dep.status !== "completed"
      );

      if (incompleteDependencies.length > 0) {
        return res.status(400).json({
          success: false,
          error:
            "Cannot mark task as completed - it has incomplete dependencies",
          incompleteDependencies: incompleteDependencies.map((dep) => ({
            id: dep._id,
            title: dep.title,
            status: dep.status,
          })),
        });
      }
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // Check if this task is a dependency for any other task
    const dependentTasks = await Task.find({ dependencies: req.params.id });

    if (dependentTasks.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete task - it is a dependency for other tasks",
        dependentTasks: dependentTasks.map((t) => ({
          id: t._id,
          title: t.title,
        })),
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
