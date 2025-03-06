import { RedisType } from '@grammyjs/ratelimiter/out/typesAndDefaults';
import { StorageAdapter } from 'grammy';
import { CacheService } from '#common/cache';

export class CacheAdapter<T> implements StorageAdapter<T>, RedisType {
  readonly #cacheService: CacheService;

  constructor (instance: CacheService) {
    if (instance) {
      this.#cacheService = instance;
    } else {
      throw new Error('You should pass cache service instance to constructor.');
    }
  }

  public incr (key: string): Promise<number> {
    return this.#cacheService.provider.incr(key);
  }

  public async pexpire (key: string, milliseconds: number): Promise<number> {
    const result = await this.#cacheService.provider.pExpire(key, milliseconds);

    return +result;
  }

  public async read (key: string): Promise<T> {
    const session = await this.#cacheService.get(key);
    if (session === null || session === undefined) {
      return undefined;
    }

    return JSON.parse(session) as unknown as T;
  }

  public async write (key: string, value: T): Promise<void> {
    await this.#cacheService.set(key, JSON.stringify(value));
  }

  public async delete (key: string): Promise<void> {
    await this.#cacheService.delete(key);
  }
}
