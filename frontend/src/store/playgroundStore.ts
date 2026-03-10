import { create } from 'zustand';
import { Board, List, Task } from '@/types';

const STORAGE_KEY = 'playground_board';

const placeholderUser = {
  id: 'playground-user',
  name: 'You',
  email: '',
  role: 'editor' as const,
};

function createSeed(): { board: Board; lists: List[]; tasks: Task[] } {
  const boardId = 'playground';
  const list1Id = crypto.randomUUID();
  const list2Id = crypto.randomUUID();
  const task1Id = crypto.randomUUID();
  const task2Id = crypto.randomUUID();
  const task3Id = crypto.randomUUID();

  const board: Board = {
    _id: boardId,
    title: 'Playground Board',
    description: 'Try the kanban – data is session-only',
    owner: placeholderUser,
    members: [],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const lists: List[] = [
    {
      _id: list1Id,
      title: 'To Do',
      board: boardId,
      position: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: list2Id,
      title: 'Done',
      board: boardId,
      position: 1,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const tasks: Task[] = [
    {
      _id: task1Id,
      title: 'Sample task',
      description: 'Drag me around',
      list: list1Id,
      board: boardId,
      position: 0,
      priority: 'medium',
      isCompleted: false,
      isArchived: false,
      createdBy: placeholderUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: task2Id,
      title: 'Another task',
      list: list1Id,
      board: boardId,
      position: 1,
      priority: 'low',
      isCompleted: false,
      isArchived: false,
      createdBy: placeholderUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: task3Id,
      title: 'Completed item',
      list: list2Id,
      board: boardId,
      position: 0,
      priority: 'high',
      isCompleted: true,
      isArchived: false,
      createdBy: placeholderUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { board, lists, tasks };
}

function loadFromStorage(): { board: Board; lists: List[]; tasks: Task[] } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.board && Array.isArray(data.lists) && Array.isArray(data.tasks)) {
      return {
        board: data.board,
        lists: data.lists,
        tasks: data.tasks,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(board: Board, lists: List[], tasks: Task[]) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ board, lists, tasks })
    );
  } catch {
    // ignore
  }
}

export const PLAYGROUND_BOARD_ID = 'playground';

interface PlaygroundState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoard: (id: string) => Promise<void>;
  createBoard: (data: { title: string; description?: string; backgroundColor?: string }) => Promise<Board>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  addMember: (boardId: string, userEmail: string, role?: string) => Promise<void>;
  createList: (title: string, boardId: string) => Promise<List>;
  updateList: (id: string, data: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  reorderLists: (boardId: string, lists: { listId: string; position: number }[]) => Promise<void>;
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

export const usePlaygroundStore = create<PlaygroundState>((set, get) => {
  const persist = () => {
    const { currentBoard, lists, tasks } = get();
    if (currentBoard) saveToStorage(currentBoard, lists, tasks);
  };

  return {
    boards: [],
    currentBoard: null,
    lists: [],
    tasks: [],
    isLoading: false,
    error: null,

    fetchBoards: async () => {
      const stored = loadFromStorage();
      const seed = createSeed();
      const board = stored?.board ?? seed.board;
      set({
        boards: [board],
        lists: stored?.lists ?? seed.lists,
        tasks: stored?.tasks ?? seed.tasks,
      });
    },

    fetchBoard: async (id: string) => {
      if (id !== PLAYGROUND_BOARD_ID) {
        set({ currentBoard: null, lists: [], tasks: [], isLoading: false });
        return;
      }
      set({ isLoading: true, error: null });
      const stored = loadFromStorage();
      const seed = createSeed();
      if (stored) {
        set({
          currentBoard: stored.board,
          lists: stored.lists.sort((a, b) => a.position - b.position),
          tasks: stored.tasks,
          isLoading: false,
        });
      } else {
        set({
          currentBoard: seed.board,
          lists: seed.lists.sort((a, b) => a.position - b.position),
          tasks: seed.tasks,
          isLoading: false,
        });
      }
    },

    createBoard: async (data) => {
      const board: Board = {
        _id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        owner: placeholderUser,
        members: [],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((s) => ({ boards: [board, ...s.boards] }));
      return board;
    },

    updateBoard: async (id, data) => {
      set((s) => {
        const boards = s.boards.map((b) => (b._id === id ? { ...b, ...data } : b));
        const currentBoard = s.currentBoard?._id === id ? { ...s.currentBoard, ...data } : s.currentBoard;
        if (currentBoard) saveToStorage(currentBoard, s.lists, s.tasks);
        return { boards, currentBoard };
      });
    },

    deleteBoard: async (id) => {
      set({ boards: [], currentBoard: null, lists: [], tasks: [] });
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    },

    addMember: async () => {},

    createList: async (title, boardId) => {
      const list: List = {
        _id: crypto.randomUUID(),
        title,
        board: boardId,
        position: get().lists.length,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((s) => {
        const next = { ...s, lists: [...s.lists, list] };
        if (s.currentBoard) saveToStorage(s.currentBoard, next.lists, next.tasks);
        return next;
      });
      return list;
    },

    updateList: async (id, data) => {
      set((s) => {
        const lists = s.lists.map((l) => (l._id === id ? { ...l, ...data } : l));
        if (s.currentBoard) saveToStorage(s.currentBoard, lists, s.tasks);
        return { lists };
      });
    },

    deleteList: async (id) => {
      set((s) => {
        const lists = s.lists.filter((l) => l._id !== id);
        const tasks = s.tasks.filter((t) => t.list !== id);
        if (s.currentBoard) saveToStorage(s.currentBoard, lists, tasks);
        return { lists, tasks };
      });
    },

    reorderLists: async (_boardId, order) => {
      set((s) => {
        const lists = [...s.lists];
        order.forEach(({ listId, position }) => {
          const list = lists.find((l) => l._id === listId);
          if (list) list.position = position;
        });
        lists.sort((a, b) => a.position - b.position);
        if (s.currentBoard) saveToStorage(s.currentBoard, lists, s.tasks);
        return { lists };
      });
    },

    createTask: async (data) => {
      const task: Task = {
        _id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        list: data.listId,
        board: data.boardId,
        position: get().tasks.filter((t) => t.list === data.listId).length,
        priority: data.priority ?? 'medium',
        isCompleted: false,
        isArchived: false,
        createdBy: placeholderUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((s) => {
        const tasks = [...s.tasks, task];
        if (s.currentBoard) saveToStorage(s.currentBoard, s.lists, tasks);
        return { tasks };
      });
      return task;
    },

    updateTask: async (id, data) => {
      set((s) => {
        const tasks = s.tasks.map((t) => (t._id === id ? { ...t, ...data } : t));
        if (s.currentBoard) saveToStorage(s.currentBoard, s.lists, tasks);
        return { tasks };
      });
    },

    deleteTask: async (id) => {
      set((s) => {
        const tasks = s.tasks.filter((t) => t._id !== id);
        if (s.currentBoard) saveToStorage(s.currentBoard, s.lists, tasks);
        return { tasks };
      });
    },

    moveTask: async (taskId, _sourceListId, destinationListId, _sourcePosition, destinationPosition) => {
      set((s) => {
        const taskToMove = s.tasks.find((t) => t._id === taskId);
        if (!taskToMove) return s;
        const tasks = s.tasks.map((t) =>
          t._id === taskId ? { ...t, list: destinationListId, position: destinationPosition } : t
        );
        if (s.currentBoard) saveToStorage(s.currentBoard, s.lists, tasks);
        return { tasks };
      });
    },
  };
});
