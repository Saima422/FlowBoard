import { Response } from 'express';
import List from '../models/List';
import Board from '../models/Board';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const createList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, boardId } = req.body;
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

    // Get the position for the new list
    const listsCount = await List.countDocuments({ board: boardId, isArchived: false });

    const list = await List.create({
      title,
      board: boardId,
      position: listsCount,
    });

    res.status(201).json({
      success: true,
      message: 'List created successfully',
      data: { list },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating list',
      error: error.message,
    });
  }
};

export const updateList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, position } = req.body;
    const userId = req.userId;

    const list = await List.findById(id);
    if (!list) {
      res.status(404).json({
        success: false,
        message: 'List not found',
      });
      return;
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: list.board,
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

    if (title) list.title = title;
    if (position !== undefined) list.position = position;

    await list.save();

    res.status(200).json({
      success: true,
      message: 'List updated successfully',
      data: { list },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating list',
      error: error.message,
    });
  }
};

export const deleteList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const list = await List.findById(id);
    if (!list) {
      res.status(404).json({
        success: false,
        message: 'List not found',
      });
      return;
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: list.board,
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

    // Delete associated tasks
    await Task.deleteMany({ list: id });
    await List.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'List deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting list',
      error: error.message,
    });
  }
};

export const reorderLists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId, lists } = req.body; // lists is an array of { listId, position }
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

    // Update positions
    const updatePromises = lists.map((item: any) =>
      List.findByIdAndUpdate(item.listId, { position: item.position })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Lists reordered successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error reordering lists',
      error: error.message,
    });
  }
};

