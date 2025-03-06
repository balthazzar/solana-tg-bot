import { createClient, RedisClientType } from 'redis';
import { IOnAppBootstrap } from '#common/di/types';

export class CacheService implements IOnAppBootstrap {
  #provider: RedisClientType;

  public get provider (): RedisClientType {
    return this.#provider;
  }

  public async hasKey (key: string): Promise<boolean> {
    const value = await this.#provider.exists(key);

    return !!value;
  }

  public async delete (key: string): Promise<void> {
    await this.#provider.del(key);
  }

  public async set (key: string, value: string): Promise<void> {
    await this.#provider.set(key, value);
  }

  public async get (key: string): Promise<string> {
    return this.#provider.get(key);
  }

  public async onAppBootstrap (): Promise<void> {
    this.#provider = createClient();

    await this.#provider.connect();
  }
}
