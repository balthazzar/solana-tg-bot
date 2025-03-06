import { PollingOptions } from 'grammy';
import { CacheService } from '#common/cache';
import { StartCommand, TokenCommand } from '#modules/telegram-bot';
import { BASE58_REGEX } from '#common';
import { container } from '#common/di';
import { BotManager, IBotProviderInit, ICommandInit } from '#common/bot';
import { TelegramBotProvider } from '#modules/telegram-bot/telegram-bot.provider';
import { BlockchainRpcService, SplTokenService } from '#modules/solana';

const bootstrap = async (): Promise<void> => {
  container
    .add(CacheService)
    .add(BlockchainRpcService)
    .add(SplTokenService, [BlockchainRpcService])
    .add(TelegramBotProvider, [CacheService])
    .add(StartCommand)
    .add(TokenCommand, [SplTokenService]);

  await container.performBootstrapHook();

  await BotManager.register([
    {
      provider: TelegramBotProvider,
      providerOptions: {},
      commands: [
        {
          name: 'start',
          type: 'command',
          selectors: ['start'],
          command: StartCommand,
          description: 'Start',
        },
        {
          name: 'token',
          type: 'event',
          selectors: [BASE58_REGEX],
          command: TokenCommand,
          description: 'Get token balance',
        } satisfies ICommandInit<RegExp>,
      ],
    } satisfies IBotProviderInit<TelegramBotProvider, PollingOptions>,
  ]);

  BotManager.start().then(() => {
    console.info('Bot started');
  });
};

bootstrap();
