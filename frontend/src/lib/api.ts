const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const makeRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
};

// Auth API
export const auth = {
  register: (data: { name: string; email: string; password: string }) =>
    makeRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => makeRequest<User>('/api/auth/me'),
};

// Tasks API
export const tasks = {
  list: (status?: string) =>
    makeRequest<Task[]>(
      `/api/tasks${status ? `?status=${status}` : ''}`
    ),

  create: (data: {
    title: string;
    description?: string;
    status?: 'todo' | 'in-progress' | 'done';
    dueDate?: number;
  }) =>
    makeRequest<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (id: string) =>
    makeRequest<Task>(`/api/tasks/${id}`),

  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: 'todo' | 'in-progress' | 'done';
      dueDate?: number;
    }
  ) =>
    makeRequest<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    makeRequest<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
};
