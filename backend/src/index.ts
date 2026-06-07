import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  registerHandler,
  loginHandler,
  meHandler,
} from './routes/auth';
import {
  listTasksHandler,
  createTaskHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from './routes/tasks';

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors());

// Auth endpoints
app.post('/api/auth/register', registerHandler);
app.post('/api/auth/login', loginHandler);
app.get('/api/auth/me', meHandler);

// Task endpoints
app.get('/api/tasks', listTasksHandler);
app.post('/api/tasks', createTaskHandler);
app.get('/api/tasks/:id', getTaskHandler);
app.patch('/api/tasks/:id', updateTaskHandler);
app.delete('/api/tasks/:id', deleteTaskHandler);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
