export type Type<T = any> = new (...args: any[]) => T;

export type ValueOf<T> = T[keyof T];

export type MaybePromise<T> = T | Promise<T>;
