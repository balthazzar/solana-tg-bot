import { Context } from 'grammy';
import { SessionData } from '../types';

export function createInitialSessionData (): SessionData {
  // Init new session here
  return {};
}

// Stores data per user.
export function getSessionKey (ctx: Context): string | undefined {
  return ctx.from?.id.toString();
}
