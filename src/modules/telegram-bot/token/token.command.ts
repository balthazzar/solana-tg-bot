import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { BotError } from 'grammy';
import { BotCommandError, ICommand } from '#common/bot';
import { SplTokenService } from '#modules/solana';
import { BotContext } from '../types';

export class TokenCommand implements ICommand<BotContext> {
  readonly #splTokenService: SplTokenService;

  constructor (
    splTokenService: SplTokenService,
  ) {
    this.#splTokenService = splTokenService;
  }

  public async run (context: BotContext): Promise<void> {
    const responseMessage = await context.reply('_Processing\\.\\.\\._', {
      parse_mode: 'MarkdownV2',
      reply_parameters: {
        message_id: context.msg.message_id,
      },
    });

    context.session.lastResponseData = {
      chatId: responseMessage.chat.id,
      messageId: responseMessage.message_id,
    };

    const wallet = new PublicKey(context.msg.text);

    const balance = await this.#splTokenService.getBalance(wallet);

    if (isNaN(balance)) {
      throw new BotCommandError('Wallet balance not found');
    }

    const formattedResponse: string =
      `Wallet balance ${balance / LAMPORTS_PER_SOL} SOL`;

    await context.api.editMessageText(
      responseMessage.chat.id,
      responseMessage.message_id,
      formattedResponse,
      {
        parse_mode: 'MarkdownV2',
        link_preview_options: {
          is_disabled: true,
        },
      },
    );
  }

  public async onError ({ error, ctx }: BotError<BotContext>): Promise<void> {
    const messageTemplate = (msg: string = 'Unexpected error occurred'): string =>
      `${msg}\\.\n\`Comeback later\\.\``;

    let message = messageTemplate();
    if (error instanceof BotCommandError) {
      message = messageTemplate(error.message);
    } else {
      console.error(error, 'Unexpected error during command performing: ');
    }

    const { chatId, messageId } = ctx.session.lastResponseData;

    if (chatId && messageId) {
      await ctx.api.editMessageText(chatId, messageId, message, {
        parse_mode: 'MarkdownV2',
      });
    } else {
      await ctx.reply(message, {
        parse_mode: 'MarkdownV2',
      });
    }
  }
}
