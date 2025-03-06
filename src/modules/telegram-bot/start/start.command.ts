import { BotError, Context } from 'grammy';
import { ICommand } from '#common/bot';

export class StartCommand implements ICommand<Context> {
  public async run (context: Context): Promise<void> {
    await context.reply('_Type solana wallet address to get balance\\._', {
      parse_mode: 'MarkdownV2',
    });
  }

  public async onError (cause: BotError): Promise<any> {
    throw cause.error;
  }
}
