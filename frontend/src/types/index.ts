export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

export interface Member {
  user: User;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: User;
  members: Member[];
  backgroundColor?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  title: string;
  board: string;
  position: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  list: string;
  board: string;
  position: number;
  assignedTo?: User[];
  labels?: string[];
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  isArchived: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

