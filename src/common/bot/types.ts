import { Type } from '#common/types';

export interface ICommand<ctx extends Record<any, any> = Record<any, any>> {
  run(ctx?: ctx): Promise<any>;

  onError(cause: unknown): Promise<any>;
}

export interface ICommandInit<Selector extends string | RegExp = string | RegExp> {
  name: string;

  type: 'command' | 'event';

  selectors: Selector[];

  description?: string;

  command: Type<ICommand>;
}

export interface IBotProvider<Options = any> {
  startListening(providerOptions: Options): Promise<void>;

  registerCommands(commands: ICommandInit[]): Promise<void>;
}

export interface IBotProviderInit<Provider extends IBotProvider = IBotProvider, Options = any> {
  provider: Type<Provider>;

  providerOptions?: Options;

  commands: ICommandInit[];
}
