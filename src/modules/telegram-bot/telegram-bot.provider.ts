import process from 'node:process';
import {
  Bot,
  Composer,
  FilterQuery,
  GrammyError,
  HttpError,
  NextFunction,
  PollingOptions,
  session,
} from 'grammy';
import { BotCommand } from 'grammy/types';
import { limit } from '@grammyjs/ratelimiter';
import { CacheService, TTL } from '#common/cache';
import { config } from '#common';
import { container } from '#common/di';
import { IBotProvider, ICommand, ICommandInit } from '#common/bot';
import { createInitialSessionData, getRateLimitKey, getSessionKey } from './middlewares';
import { CacheAdapter } from './';
import { BotContext, SessionData } from './types';

export class TelegramBotProvider implements IBotProvider<PollingOptions> {
  readonly #commands = new Set<FilterQuery>();

  readonly #client: Bot<BotContext>;

  constructor (cacheService: CacheService) {
    const apiKey = config.getOrThrow('TELEGRAM_API_KEY');

    this.#client = new Bot(apiKey);

    this.#client.catch((err) => {
      const ctx = err.ctx;

      console.error(`Error while handling update ${ctx.update.update_id}:`);

      const e = err.error;

      if (e instanceof GrammyError) {
        console.error(e.description, 'Error in request:');
      } else if (e instanceof HttpError) {
        console.error(e, 'Could not contact Telegram:');
      } else {
        console.error(e, 'Unknown error:');
      }
    });

    const cacheAdapter = new CacheAdapter<SessionData>(cacheService);

    this.#client.use(
      session({
        initial: createInitialSessionData,
        getSessionKey,
        storage: cacheAdapter,
      }),
    );
    this.#client.use(
      limit({
        storageClient: cacheAdapter,
        keyGenerator: getRateLimitKey,
      }),
    );

  }

  public async startListening (providerOptions: PollingOptions): Promise<void> {
    // Graceful shutdown events
    process.once('SIGINT', () => this.#gracefulStop());
    process.once('SIGTERM', () => this.#gracefulStop());

    this.#client
      .start(providerOptions)
      .then(() => console.info('Telegram bot successfully started up'));
  }

  public async registerCommands (commandsInit: ICommandInit<FilterQuery>[]): Promise<void> {
    const slashCommands: BotCommand[] = [];

    for (const { selectors, command, type, description, name } of commandsInit) {
      const composer = new Composer<BotContext>();

      for (const selector of this.#commands) {
        if (selectors.includes(selector)) {
          throw new Error(`Duplicated selector ${name}->'${selector}' in bot provider '${this.constructor.name}'.`);
        }
      }

      const commandInstance = container.getInstance<ICommand>(command);

      const handler = async (ctx: BotContext, next: NextFunction): Promise<void> => {
        const consoleData = {
          userId: ctx.from.id,
          username: ctx.from.username,
          command: command.name,
          msgId: ctx.msgId,
          content: ctx.msg.text,
        };
        console.info(consoleData, 'New input interaction found:');

        const wrappedRun = performance.timerify(() => commandInstance.run(ctx));
        await wrappedRun();

        await next();

        console.debug(consoleData, 'Input interaction done:');
      };

      switch (type) {
        case 'event': {
          composer.hears(selectors, handler);
          break;
        }
        case 'command': {
          composer.command(selectors, handler);

          const mappedCommands: BotCommand[] = selectors.map((s) => ({ command: s, description }));
          slashCommands.push(...mappedCommands);

          break;
        }
        default:
          throw new Error(`Unknown command type '${type}'`);
      }

      // Error wrapper in command pipeline
      this.#client.errorBoundary(async (botError, next) => {
        await commandInstance.onError(botError).catch((e) => console.error(e, 'Unhandled command error'));

        botError.ctx.session.lastResponseData = null;

        await next();
      }, composer);

      for (const selector of selectors) {
        this.#commands.add(selector);
      }
    }

    if (slashCommands.length) {
      await this.#client.api.setMyCommands(slashCommands);
    }
  }

  async #gracefulStop (): Promise<void> {
    await this.#client.stop();
  }
}
