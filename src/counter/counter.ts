export interface ICounter {
  increaseAndGet: (identity: string) => Promise<number>;
}

export interface ICounterStore extends ICounter {
  set: (identity: string, value: number) => Promise<void>;
  get: (identity: string) => Promise<number>;
  listKeys: () => Promise<string[]>;
}