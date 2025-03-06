import process from 'process';

export class ConfigService {
  private readonly _config: Record<string, any> = {};

  constructor () {
    Object.assign(this._config, process.env);
  }

  public get<V = any> (key: string, defaultValue?: any): V {
    return this._config[key] ?? defaultValue;
  }

  public getOrThrow<V = string> (key: string): V {
    const value = this._config[key];

    if (typeof value === 'undefined') {
      throw new Error(`Environment variable '${key}' is undefined`);
    }

    return value;
  }
}

export const config = new ConfigService();
