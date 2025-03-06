import { Context, SessionFlavor } from 'grammy';

export interface SessionData {
  lastResponseData?: {
    messageId: number;
    chatId: number;
  };
}

export type BotContext = Context & SessionFlavor<SessionData>;
