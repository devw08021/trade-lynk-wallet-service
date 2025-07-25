import { Context, Next } from 'hono';
import { ZodError } from 'zod';

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);

    if (error instanceof ZodError) {
      return c.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        400
      );
    }

    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
        },
        500
      );
    }

    return c.json(
      {
        error: 'Internal server error',
      },
      500
    );
  }
}; 