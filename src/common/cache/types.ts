import { CacheService } from './cache.service';

export interface ICacheable {
  get cacheService(): CacheService;
}

export type CacheDecorator<TThis, TArgs extends any[], TReturn, F extends (...args: TArgs) => Promise<TReturn>> = (
  target: F,
  context: ClassMethodDecoratorContext<TThis, F>,
) => F;
