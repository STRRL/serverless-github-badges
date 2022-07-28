export interface ICounter {
  increaseAndGet: (identity: string) => Promise<number>;
}
