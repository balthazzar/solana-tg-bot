import { container } from '../di';
import { IBotProvider, IBotProviderInit } from './types';

type TOptions = any;

export class BotManager {
  static readonly #providers = new Map<IBotProvider, TOptions>();

  public static async register (providerSettings: IBotProviderInit[]): Promise<void> {
    for (const settings of providerSettings) {
      const provider = container.getInstance<IBotProvider>(settings.provider);

      await provider.registerCommands(settings.commands);

      BotManager.#providers.set(provider, settings.providerOptions);

      console.info(`Bot provider '${provider.constructor.name}' initialized`);
    }
  }

  public static async start (): Promise<void> {
    console.info('Start listening bot providers...');

    for (const [provider, options] of BotManager.#providers) {
      const name = provider.constructor.name;

      try {
        provider.startListening(options).then(() => {
          console.info(`Listener of bot provider '${name}' executed`);
        });
      } catch (e: unknown) {
        console.error(e, `Error during initializing of '${name}': ${(e as Error).message}`);
      }
    }
  }
}
