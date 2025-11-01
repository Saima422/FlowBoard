import { create } from 'zustand';
import { Board, List, Task } from '@/types';
import { boardApi, listApi, taskApi } from '@/services/api';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Board actions
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (data: { title: string; description?: string; backgroundColor?: string }) => Promise<Board>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  addMember: (boardId: string, userEmail: string, role?: string) => Promise<void>;

  // List actions
  createList: (title: string, boardId: string) => Promise<List>;
  updateList: (id: string, data: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  reorderLists: (boardId: string, lists: { listId: string; position: number }[]) => Promise<void>;

  // Task actions
  createTask: (data: {
    title: string;
    listId: string;
    boardId: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (
    taskId: string,
    sourceListId: string,
    destinationListId: string,
    sourcePosition: number,
    destinationPosition: number
  ) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  tasks: [],
  isLoading: false,
  error: null,

  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardApi.getAll();
      set({ boards: response.data.data.boards, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch boards',
        isLoading: false,
      });
    }
  },

  fetchBoard: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardApi.getById(id);
      const { board, lists, tasks } = response.data.data;
      
      set({
        currentBoard: board,
        lists: lists.sort((a, b) => a.position - b.position),
        tasks,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch board',
        isLoading: false,
      });
    }
  },

  createBoard: async (data) => {
    const response = await boardApi.create(data);
    const board = response.data.data.board;
    set((state) => ({ boards: [board, ...state.boards] }));
    return board;
  },

  updateBoard: async (id, data) => {
    const response = await boardApi.update(id, data);
    const updatedBoard = response.data.data.board;
    set((state) => ({
      boards: state.boards.map((b) => (b._id === id ? updatedBoard : b)),
      currentBoard: state.currentBoard?._id === id ? updatedBoard : state.currentBoard,
    }));
  },

  deleteBoard: async (id) => {
    await boardApi.delete(id);
    set((state) => ({
      boards: state.boards.filter((b) => b._id !== id),
      currentBoard: state.currentBoard?._id === id ? null : state.currentBoard,
    }));
  },

  addMember: async (boardId, userEmail, role) => {
    const response = await boardApi.addMember(boardId, { userEmail, role });
    const updatedBoard = response.data.data.board;
    set((state) => ({
      currentBoard: state.currentBoard?._id === boardId ? updatedBoard : state.currentBoard,
    }));
  },

  createList: async (title, boardId) => {
    const response = await listApi.create({ title, boardId });
    const list = response.data.data.list;
    set((state) => ({ lists: [...state.lists, list] }));
    return list;
  },

  updateList: async (id, data) => {
    const response = await listApi.update(id, data);
    const updatedList = response.data.data.list;
    set((state) => ({
      lists: state.lists.map((l) => (l._id === id ? updatedList : l)),
    }));
  },

  deleteList: async (id) => {
    await listApi.delete(id);
    set((state) => ({
      lists: state.lists.filter((l) => l._id !== id),
      tasks: state.tasks.filter((t) => t.list !== id),
    }));
  },

  reorderLists: async (boardId, lists) => {
    await listApi.reorder({ boardId, lists });
    // Optimistically update UI
    set((state) => {
      const newLists = [...state.lists];
      lists.forEach(({ listId, position }) => {
        const list = newLists.find((l) => l._id === listId);
        if (list) list.position = position;
      });
      return { lists: newLists.sort((a, b) => a.position - b.position) };
    });
  },

  createTask: async (data) => {
    const response = await taskApi.create(data);
    const task = response.data.data.task;
    set((state) => ({ tasks: [...state.tasks, task] }));
    return task;
  },

  updateTask: async (id, data) => {
    const response = await taskApi.update(id, data);
    const updatedTask = response.data.data.task;
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? updatedTask : t)),
    }));
  },

  deleteTask: async (id) => {
    await taskApi.delete(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== id),
    }));
  },

  moveTask: async (taskId, sourceListId, destinationListId, sourcePosition, destinationPosition) => {
    // Optimistically update UI for immediate feedback
    set((state) => {
      const taskToMove = state.tasks.find((t) => t._id === taskId);
      if (!taskToMove) return state;
      
      const updatedTasks = state.tasks.map((t) => {
        if (t._id === taskId) {
          return { ...t, list: destinationListId, position: destinationPosition };
        }
        return t;
      });
      
      return { tasks: updatedTasks };
    });

    try {
      // Update backend
      const response = await taskApi.move(taskId, {
        sourceListId,
        destinationListId,
        sourcePosition,
        destinationPosition,
      });
      
      // Sync with backend response
      const movedTask = response.data.data.task;
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? movedTask : t)),
      }));
    } catch (error) {
      // Revert on error - will be handled by caller
      throw error;
    }
  },
}));
