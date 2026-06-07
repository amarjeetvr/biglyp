import { Context } from 'hono';
import { verifyToken } from './jwt';

export interface AuthContext {
  userId: string;
}

export const extractToken = (authHeader: string): string | null => {
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
};

export const verifyAuth = async (
  c: Context,
  jwtSecret: string
): Promise<{ userId: string } | null> => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return null;
  }

  const token = extractToken(authHeader);
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token, jwtSecret);
    return { userId: payload.sub };
  } catch {
    return null;
  }
};
