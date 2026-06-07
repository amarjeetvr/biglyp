import { Context } from 'hono';
import { eq, and } from 'drizzle-orm';
import { initDB, tasksTable } from '../db';
import {
  createTaskSchema,
  updateTaskSchema,
} from '../utils/validation';
import { verifyAuth } from '../utils/auth';
import { generateId } from '../utils/id';

export const listTasksHandler = async (c: Context) => {
  const db = initDB(c.env.DB);

  const auth = await verifyAuth(c, c.env.JWT_SECRET);
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const status = c.req.query('status');
  let query = db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.userId, auth.userId));

  if (status && ['todo', 'in-progress', 'done'].includes(status)) {
    query = db
      .select()
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.userId, auth.userId),
          eq(tasksTable.status, status as any)
        )
      );
  }

  const tasks = await query;
  return c.json(tasks);
};

export const createTaskHandler = async (c: Context) => {
  const db = initDB(c.env.DB);

  const auth = await verifyAuth(c, c.env.JWT_SECRET);
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();

  try {
    const { title, description, status, dueDate } =
      createTaskSchema.parse(body);

    const taskId = generateId();
    const dueDateValue = dueDate ? new Date(dueDate) : null;

    await db.insert(tasksTable).values({
      id: taskId,
      userId: auth.userId,
      title,
      description: description || null,
      status: (status || 'todo') as 'todo' | 'in-progress' | 'done',
      dueDate: dueDateValue,
    } as any);

    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId));

    return c.json(tasks[0], 201);
  } catch (error: any) {
    if (error.errors) {
      return c.json(
        { error: 'Validation failed', details: error.errors },
        400
      );
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const getTaskHandler = async (c: Context) => {
  const db = initDB(c.env.DB);

  const auth = await verifyAuth(c, c.env.JWT_SECRET);
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const taskId = c.req.param('id') || '';
  if (!taskId) {
    return c.json({ error: 'Task ID required' }, 400);
  }

  const tasks = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.id, taskId),
        eq(tasksTable.userId, auth.userId)
      )
    );

  if (tasks.length === 0) {
    return c.json({ error: 'Task not found' }, 404);
  }

  return c.json(tasks[0]);
};

export const updateTaskHandler = async (c: Context) => {
  const db = initDB(c.env.DB);

  const auth = await verifyAuth(c, c.env.JWT_SECRET);
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const taskId = c.req.param('id') || '';
  if (!taskId) {
    return c.json({ error: 'Task ID required' }, 400);
  }

  const body = await c.req.json();

  try {
    const updateData = updateTaskSchema.parse(body);

    // Verify ownership
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.id, taskId),
          eq(tasksTable.userId, auth.userId)
        )
      );

    if (tasks.length === 0) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updatePayload: any = {};
    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.description !== undefined) updatePayload.description = updateData.description;
    if (updateData.status !== undefined) updatePayload.status = updateData.status;
    if (updateData.dueDate !== undefined) {
      updatePayload.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }
    updatePayload.updatedAt = new Date();

    await db
      .update(tasksTable)
      .set(updatePayload)
      .where(eq(tasksTable.id, taskId));

    const updated = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId));

    return c.json(updated[0]);
  } catch (error: any) {
    if (error.errors) {
      return c.json(
        { error: 'Validation failed', details: error.errors },
        400
      );
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const deleteTaskHandler = async (c: Context) => {
  const db = initDB(c.env.DB);

  const auth = await verifyAuth(c, c.env.JWT_SECRET);
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const taskId = c.req.param('id') || '';
  if (!taskId) {
    return c.json({ error: 'Task ID required' }, 400);
  }

  // Verify ownership
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.id, taskId),
        eq(tasksTable.userId, auth.userId)
      )
    );

  if (tasks.length === 0) {
    return c.json({ error: 'Task not found' }, 404);
  }

  await db.delete(tasksTable).where(eq(tasksTable.id, taskId));

  return c.json({ success: true });
};
