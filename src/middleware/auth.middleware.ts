import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import { config } from '../config';

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.split(' ')[1];
    const secret = new TextEncoder().encode(config.jwt.secret);

    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.sub) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Set user ID in context for use in controllers
    c.set('userId', payload.sub);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
}; 