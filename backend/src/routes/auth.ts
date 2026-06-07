import { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { initDB, usersTable } from '../db';
import { registerSchema, loginSchema } from '../utils/validation';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { verifyAuth } from '../utils/auth';
import { generateId } from '../utils/id';

export const registerHandler = async (c: Context) => {
  const db = initDB(c.env.DB);
  const body = await c.req.json();

  try {
    const { name, email, password } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const userId = generateId();

    await db.insert(usersTable).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
    });

    return c.json({
      id: userId,
      name,
      email,
    });
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

export const loginHandler = async (c: Context) => {
  const db = initDB(c.env.DB);
  const body = await c.req.json();

  try {
    const { email, password } = loginSchema.parse(body);

    // Find user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    console.log("JWT_SECRET exists:", !!c.env.JWT_SECRET);
    const token = await signToken(user.id, c.env.JWT_SECRET);

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
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

export const meHandler = async (c: Context) => {
  const db = initDB(c.env.DB);

  const auth = await verifyAuth(c, c.env.JWT_SECRET);
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, auth.userId));

  if (users.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  const user = users[0];
  return c.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
};
