const taskService = require("../services/taskService");
const asyncHandler = require("../middleware/asyncHandler");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    const task = await taskService.createTask({
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
exports.getTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort, fields, ...filters } = req.query;

  // Get tasks with pagination, filtering, sorting
  const result = await taskService.getAllTasks({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    fields,
    filters,
  });

  res.status(200).json({
    success: true,
    count: result.tasks.length,
    pagination: result.pagination,
    data: result.tasks,
  });
});

// Get single task
exports.getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);

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
});

// Update task
exports.updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedTask = await taskService.updateTask(id, updateData);

  res.status(200).json({
    success: true,
    data: updatedTask,
  });
});

// Delete task
exports.deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await taskService.deleteTask(id);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});
