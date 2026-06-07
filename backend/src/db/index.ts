import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export const initDB = (database: D1Database) => {
  return drizzle(database, { schema });
};

export { usersTable, tasksTable } from './schema';
export type { User, NewUser, Task, NewTask } from './schema';
