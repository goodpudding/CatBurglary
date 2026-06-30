import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type { ApiErrorResponse, InitResponse } from '../../shared/api';

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400,
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    return c.json<InitResponse>({
      type: 'init',
      postId,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error('API init error:', error);
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Initialization failed' },
      400,
    );
  }
});
