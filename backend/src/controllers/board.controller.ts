import { Response } from 'express';
import Board from '../models/Board';
import List from '../models/List';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, backgroundColor } = req.body;
    const userId = req.userId;

    // Check if board with same title already exists for this user
    const existingBoard = await Board.findOne({
      title: title.trim(),
      $or: [
        { owner: userId },
        { 'members.user': userId },
      ],
      isArchived: false,
    });

    if (existingBoard) {
      res.status(400).json({
        success: false,
        message: 'A board with this name already exists',
      });
      return;
    }

    const board = await Board.create({
      title: title.trim(),
      description,
      owner: userId,
      backgroundColor,
      members: [
        {
          user: userId,
          role: 'admin',
          joinedAt: new Date(),
        },
      ],
    });

    const populatedBoard = await Board.findById(board._id).populate('owner', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      data: { board: populatedBoard },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating board',
      error: error.message,
    });
  }
};

export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const boards = await Board.find({
      $or: [
        { owner: userId },
        { 'members.user': userId },
      ],
      isArchived: false,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { boards },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching boards',
      error: error.message,
    });
  }
};

export const getBoardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const board = await Board.findOne({
      _id: id,
      $or: [
        { owner: userId },
        { 'members.user': userId },
      ],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found or access denied',
      });
      return;
    }

    // Get lists and tasks for this board
    const lists = await List.find({ board: id, isArchived: false }).sort({ position: 1 });
    const tasks = await Task.find({ board: id, isArchived: false })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ position: 1 });

    res.status(200).json({
      success: true,
      data: {
        board,
        lists,
        tasks,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching board',
      error: error.message,
    });
  }
};

export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, backgroundColor } = req.body;
    const userId = req.userId;

    const board = await Board.findOne({
      _id: id,
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

    // Check if new title conflicts with existing board
    if (title && title.trim() !== board.title) {
      const existingBoard = await Board.findOne({
        _id: { $ne: id },
        title: title.trim(),
        $or: [
          { owner: userId },
          { 'members.user': userId },
        ],
        isArchived: false,
      });

      if (existingBoard) {
        res.status(400).json({
          success: false,
          message: 'A board with this name already exists',
        });
        return;
      }
      board.title = title.trim();
    }

    if (description !== undefined) board.description = description;
    if (backgroundColor) board.backgroundColor = backgroundColor;

    await board.save();

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Board updated successfully',
      data: { board: populatedBoard },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating board',
      error: error.message,
    });
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const board = await Board.findOne({
      _id: id,
      owner: userId,
    });

    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found or insufficient permissions',
      });
      return;
    }

    // Delete associated lists and tasks
    await List.deleteMany({ board: id });
    await Task.deleteMany({ board: id });
    await Board.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Board deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting board',
      error: error.message,
    });
  }
};

export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userEmail, role } = req.body;
    const userId = req.userId;

    const board = await Board.findOne({
      _id: id,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.role': 'admin' },
      ],
    });

    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found or insufficient permissions',
      });
      return;
    }

    // Find user by email
    const User = require('../models/User').default;
    const userToAdd = await User.findOne({ email: userEmail });

    if (!userToAdd) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if user is already a member
    const isMember = board.members.some(
      (member) => member.user.toString() === userToAdd._id.toString()
    );

    if (isMember) {
      res.status(400).json({
        success: false,
        message: 'User is already a member',
      });
      return;
    }

    board.members.push({
      user: userToAdd._id,
      role: role || 'editor',
      joinedAt: new Date(),
    });

    await board.save();

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: { board: populatedBoard },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error adding member',
      error: error.message,
    });
  }
};

