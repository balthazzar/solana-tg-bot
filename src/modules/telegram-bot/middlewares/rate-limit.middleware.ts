import { Context } from 'grammy';

export function getRateLimitKey (ctx: Context): string | undefined {
  if (ctx.hasChatType(['group', 'supergroup'])) {
    return ctx.chat.id.toString();
  }

  return ctx.from?.id.toString();
}
