import { Response } from 'express';
import Board from '../models/Board';
import List from '../models/List';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
  asyncHandler,
} from '../utils/response';

export const createBoard = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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
    return sendBadRequest(res, 'A board with this name already exists');
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

  sendCreated(res, 'Board created successfully', { board: populatedBoard });
});

export const getBoards = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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

  sendSuccess(res, 200, undefined, { boards });
});

export const getBoardById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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
    return sendNotFound(res, 'Board not found or access denied');
  }

  // Get lists and tasks for this board
  const lists = await List.find({ board: id, isArchived: false }).sort({ position: 1 });
  const tasks = await Task.find({ board: id, isArchived: false })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ position: 1 });

  sendSuccess(res, 200, undefined, { board, lists, tasks });
});

export const updateBoard = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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
    return sendNotFound(res, 'Board not found or insufficient permissions');
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
      return sendBadRequest(res, 'A board with this name already exists');
    }
    board.title = title.trim();
  }

  if (description !== undefined) board.description = description;
  if (backgroundColor) board.backgroundColor = backgroundColor;

  await board.save();

  const populatedBoard = await Board.findById(board._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  sendSuccess(res, 200, 'Board updated successfully', { board: populatedBoard });
});

export const deleteBoard = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  const board = await Board.findOne({
    _id: id,
    owner: userId,
  });

  if (!board) {
    return sendNotFound(res, 'Board not found or insufficient permissions');
  }

  // Delete associated lists and tasks
  await List.deleteMany({ board: id });
  await Task.deleteMany({ board: id });
  await Board.findByIdAndDelete(id);

  sendSuccess(res, 200, 'Board deleted successfully');
});

export const addMember = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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
    return sendNotFound(res, 'Board not found or insufficient permissions');
  }

  // Find user by email
  const User = require('../models/User').default;
  const userToAdd = await User.findOne({ email: userEmail });

  if (!userToAdd) {
    return sendNotFound(res, 'User not found');
  }

  // Check if user is already a member
  const isMember = board.members.some(
    (member) => member.user.toString() === userToAdd._id.toString()
  );

  if (isMember) {
    return sendBadRequest(res, 'User is already a member');
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

  sendSuccess(res, 200, 'Member added successfully', { board: populatedBoard });
});

