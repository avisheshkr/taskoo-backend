import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";

export const createTask = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, errors: true, message: "Title is required" });
  }

  await Task.create({ title, description, user: userId });

  res.status(201).json({
    success: true,
    errors: null,
    message: "Task created successfully",
  });
});

export const getUserTasks = asyncHandler(async (req, res) => {
  // const userId = req.user._id;
  const userId = req.query.userId;
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const hasPagination = req.query.hasPagination === "true";

  const tasksQuery = Task.find({ user: userId })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  const tasks = await tasksQuery.exec();

  if (!tasks) {
    res
      .status(404)
      .json({ success: false, errors: true, message: "Task not found" });
  }

  if (hasPagination) {
    const totalRecords = await Task.find({ user: userId }).countDocuments({});

    res.json({
      success: true,
      errors: null,
      message: "Task found",
      totalRecords,
      pageNumber,
      pageSize,
      data: tasks,
    });
  } else {
    res.json({
      success: true,
      errors: null,
      message: "Task found",
      data: tasks,
    });
  }
});

export const getTask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;

  if (!taskId) {
    res
      .status(404)
      .json({ success: false, errors: true, message: "Task Id not found" });
  }

  const task = await Task.findById(taskId);
  if (!task)
    return res
      .status(404)
      .json({ success: false, errors: true, message: "Task not found" });

  res.json({ success: true, errors: null, message: "Task found", data: task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;
  const { title, description } = req.body;

  if (!taskId) {
    res
      .status(404)
      .json({ success: false, errors: true, message: "Task Id not found" });
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      _id: taskId,
      title,
      description,
    },
    { new: true }
  );

  if (!updatedTask)
    return res
      .status(400)
      .json({ success: false, errors: true, message: "Task update failed" });

  res.json({
    success: true,
    errors: null,
    message: "Task updated successfully",
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;

  await Task.findByIdAndDelete(taskId);

  res.json({
    success: true,
    errors: null,
    message: "Task deleted successfully",
  });
});
