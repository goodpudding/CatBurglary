import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type {
  ApiErrorResponse,
  InitResponse,
  ProfileResponse,
  RunCompleteRequest,
  RunCompleteResponse,
  SelectCatRequest,
  SelectCatResponse,
  UnlockCatRequest,
  UnlockCatResponse,
  BuyCosmeticRequest,
  BuyCosmeticResponse,
  EquipCosmeticRequest,
  EquipCosmeticResponse,
  ShopResponse,
} from '../../shared/api.js';
import { buyCosmetic, buildShopView, equipCosmetic } from '../core/cosmeticStore.js';
import {
  addBankedCoins,
  clampBankedAmount,
  getPlayerProfile,
  resolveUserId,
  selectCat,
  unlockCat,
} from '../core/playerStore.js';

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

api.get('/profile', async (c) => {
  const userId = resolveUserId();
  if (!userId) {
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Log in to Reddit to save coins' },
      401,
    );
  }

  try {
    const profile = await getPlayerProfile(userId);
    return c.json<ProfileResponse>({ type: 'profile', profile });
  } catch (error) {
    console.error('API profile error:', error);
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Failed to load profile' },
      500,
    );
  }
});

api.post('/run-complete', async (c) => {
  const userId = resolveUserId();
  if (!userId) {
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Log in to Reddit to save coins' },
      401,
    );
  }

  try {
    const body = (await c.req.json()) as RunCompleteRequest;
    const bankedThisRun = clampBankedAmount(body.bankedThisRun);
    const profile =
      bankedThisRun > 0
        ? await addBankedCoins(userId, bankedThisRun)
        : await getPlayerProfile(userId);

    return c.json<RunCompleteResponse>({
      type: 'run-complete',
      bankedThisRun,
      profile,
    });
  } catch (error) {
    console.error('API run-complete error:', error);
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Failed to save run' },
      500,
    );
  }
});

api.post('/select-cat', async (c) => {
  const userId = resolveUserId();
  if (!userId) {
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Log in to Reddit to save your cat' },
      401,
    );
  }

  try {
    const body = (await c.req.json()) as SelectCatRequest;
    const profile = await selectCat(userId, body.catId);
    return c.json<SelectCatResponse>({ type: 'select-cat', profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to select cat';
    const status = message === 'Cat not owned' ? 403 : 400;
    console.error('API select-cat error:', error);
    return c.json<ApiErrorResponse>({ status: 'error', message }, status);
  }
});

api.post('/unlock-cat', async (c) => {
  const userId = resolveUserId();
  if (!userId) {
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Log in to Reddit to unlock cats' },
      401,
    );
  }

  try {
    const body = (await c.req.json()) as UnlockCatRequest;
    const profile = await unlockCat(userId, body.catId);
    return c.json<UnlockCatResponse>({ type: 'unlock-cat', profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unlock cat';
    const status = message === 'Not enough coins' ? 402 : 400;
    console.error('API unlock-cat error:', error);
    return c.json<ApiErrorResponse>({ status: 'error', message }, status);
  }
});

api.get('/shop', async (c) => {
  const userId = resolveUserId();
  if (!userId) {
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Log in to Reddit to use the shop' },
      401,
    );
  }

  try {
    const profile = await getPlayerProfile(userId);
    return c.json<ShopResponse>({
      type: 'shop',
      coins: profile.coins,
      items: buildShopView(profile),
    });
  } catch (error) {
    console.error('API shop error:', error);
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Failed to load shop' },
      500,
    );
  }
});

api.post('/shop/buy', async (c) => {
  const userId = resolveUserId();
  if (!userId) {
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Log in to Reddit to buy cosmetics' },
      401,
    );
  }

  try {
    const body = (await c.req.json()) as BuyCosmeticRequest;
    const profile = await buyCosmetic(userId, body.cosmeticId);
    return c.json<BuyCosmeticResponse>({ type: 'buy-cosmetic', profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to buy cosmetic';
    const status = message === 'Not enough coins' ? 402 : 400;
    console.error('API shop/buy error:', error);
    return c.json<ApiErrorResponse>({ status: 'error', message }, status);
  }
});

api.post('/shop/equip', async (c) => {
  const userId = resolveUserId();
  if (!userId) {
    return c.json<ApiErrorResponse>(
      { status: 'error', message: 'Log in to Reddit to equip cosmetics' },
      401,
    );
  }

  try {
    const body = (await c.req.json()) as EquipCosmeticRequest;
    const profile = await equipCosmetic(userId, body.slot, body.cosmeticId);
    return c.json<EquipCosmeticResponse>({ type: 'equip-cosmetic', profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to equip cosmetic';
    const status = message === 'Cosmetic not owned' ? 403 : 400;
    console.error('API shop/equip error:', error);
    return c.json<ApiErrorResponse>({ status: 'error', message }, status);
  }
});
