import { Response } from 'express';
import Task from '../models/Task';
import Board from '../models/Board';
import { AuthRequest } from '../middleware/auth';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      listId,
      boardId,
      assignedTo,
      labels,
      dueDate,
      priority,
    } = req.body;
    const userId = req.userId;

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.role': { $in: ['admin', 'editor'] } },
      ],
    });

    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found or insufficient permissions',
      });
      return;
    }

    // Get the position for the new task
    const tasksCount = await Task.countDocuments({ list: listId, isArchived: false });

    const task = await Task.create({
      title,
      description,
      list: listId,
      board: boardId,
      position: tasksCount,
      assignedTo,
      labels,
      dueDate,
      priority: priority || 'medium',
      createdBy: userId,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message,
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assignedTo,
      labels,
      dueDate,
      priority,
      isCompleted,
      position,
    } = req.body;
    const userId = req.userId;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: task.board,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.role': { $in: ['admin', 'editor'] } },
      ],
    });

    if (!board) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (labels) task.labels = labels;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;
    if (position !== undefined) task.position = position;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: populatedTask },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: task.board,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.role': { $in: ['admin', 'editor'] } },
      ],
    });

    if (!board) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
};

export const moveTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { destinationListId, destinationPosition } = req.body;
    const userId = req.userId;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: task.board,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.role': { $in: ['admin', 'editor'] } },
      ],
    });

    if (!board) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    // Update task list and position
    task.list = destinationListId;
    task.position = destinationPosition;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Task moved successfully',
      data: { task: populatedTask },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error moving task',
      error: error.message,
    });
  }
};

export const reorderTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tasks } = req.body; // tasks is an array of { taskId, position }
    const userId = req.userId;

    // Get one task to verify board access
    const sampleTask = await Task.findById(tasks[0].taskId);
    if (!sampleTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: sampleTask.board,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.role': { $in: ['admin', 'editor'] } },
      ],
    });

    if (!board) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    // Update positions
    const updatePromises = tasks.map((item: any) =>
      Task.findByIdAndUpdate(item.taskId, { position: item.position })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Tasks reordered successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error reordering tasks',
      error: error.message,
    });
  }
};

