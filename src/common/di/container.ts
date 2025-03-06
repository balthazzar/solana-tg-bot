import { Type } from '#common/types';

export class Container {
  readonly #storage = new Map<Type, { instance: any; deps?: Type[] }>();

  public add (target: Type, deps?: Type[]): this {
    if (!target) {
      throw new Error('Provider target is null or undefined');
    }

    if (this.#storage.has(target)) {
      throw new Error(`Provider instance '${target.name}' already registered`);
    }

    this.#storage.set(target, { instance: null, deps });

    return this;
  }

  public getInstance<T = any> (Key: Type<T>): T {
    if (!this.#storage.has(Key)) {
      throw new Error(`Unknown instance provider '${Key.name}'`);
    }

    const instanceData = this.#storage.get(Key);

    // Lazy deep initialization
    if (!instanceData.instance) {
      const targetArgs = new Set([]);

      if (instanceData.deps?.length) {
        for (const dep of instanceData.deps) {
          const innerInstanceData = this.getInstance(dep);

          // Persist singletone
          targetArgs.add(innerInstanceData);
        }
      }

      instanceData.instance = new Key(...targetArgs);
    }

    return instanceData.instance;
  }

  public async performBootstrapHook (): Promise<void> {
    for (const target of this.#storage.keys()) {
      if (typeof target.prototype['onAppBootstrap'] === 'function') {
        const instance = this.getInstance(target);
        await instance.onAppBootstrap();
      }
    }
  }
}

export const container = new Container();
