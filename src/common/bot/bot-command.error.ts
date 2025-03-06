export class BotCommandError extends Error {
  constructor (msg?: string) {
    super();

    this.message = msg || 'Unexpected error occurred';
  }
}
