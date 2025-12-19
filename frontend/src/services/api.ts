import axios from '@/lib/axios';
import { encryptLoginCredentials, encryptRegisterCredentials } from '@/lib/crypto';
import { AuthResponse, Board, List, Task, User } from '@/types';

// Auth APIs
export const authApi = {
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    // Encrypt credentials before sending
    const encryptedCredentials = await encryptRegisterCredentials(
      data.name,
      data.email,
      data.password
    );
    return axios.post<{ data: AuthResponse }>('/auth/register', {
      ...encryptedCredentials,
      role: data.role,
    });
  },
  
  login: async (data: { email: string; password: string }) => {
    // Encrypt credentials before sending
    const encryptedCredentials = await encryptLoginCredentials(data.email, data.password);
    return axios.post<{ data: AuthResponse }>('/auth/login', encryptedCredentials);
  },
  
  getMe: () =>
    axios.get<{ data: { user: User } }>('/auth/me'),
};

// Board APIs
export const boardApi = {
  create: (data: { title: string; description?: string; backgroundColor?: string }) =>
    axios.post<{ data: { board: Board } }>('/boards', data),
  
  getAll: () =>
    axios.get<{ data: { boards: Board[] } }>('/boards'),
  
  getById: (id: string) =>
    axios.get<{ data: { board: Board; lists: List[]; tasks: Task[] } }>(`/boards/${id}`),
  
  update: (id: string, data: Partial<Board>) =>
    axios.put<{ data: { board: Board } }>(`/boards/${id}`, data),
  
  delete: (id: string) =>
    axios.delete(`/boards/${id}`),
  
  addMember: (id: string, data: { userEmail: string; role?: string }) =>
    axios.post<{ data: { board: Board } }>(`/boards/${id}/members`, data),
};

// List APIs
export const listApi = {
  create: (data: { title: string; boardId: string }) =>
    axios.post<{ data: { list: List } }>('/lists', data),
  
  update: (id: string, data: Partial<List>) =>
    axios.put<{ data: { list: List } }>(`/lists/${id}`, data),
  
  delete: (id: string) =>
    axios.delete(`/lists/${id}`),
  
  reorder: (data: { boardId: string; lists: { listId: string; position: number }[] }) =>
    axios.post('/lists/reorder', data),
};

// Task APIs
export const taskApi = {
  create: (data: {
    title: string;
    listId: string;
    boardId: string;
    description?: string;
    assignedTo?: string[];
    labels?: string[];
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
  }) =>
    axios.post<{ data: { task: Task } }>('/tasks', data),
  
  update: (id: string, data: Partial<Task>) =>
    axios.put<{ data: { task: Task } }>(`/tasks/${id}`, data),
  
  delete: (id: string) =>
    axios.delete(`/tasks/${id}`),
  
  move: (id: string, data: {
    sourceListId: string;
    destinationListId: string;
    sourcePosition: number;
    destinationPosition: number;
  }) =>
    axios.post<{ data: { task: Task } }>(`/tasks/${id}/move`, data),
  
  reorder: (data: { listId: string; tasks: { taskId: string; position: number }[] }) =>
    axios.post('/tasks/reorder', data),
};

