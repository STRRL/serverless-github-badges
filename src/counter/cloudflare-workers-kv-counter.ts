import { ICounter } from "./counter";

export interface CounterModel {
  count: number;
}

export class CloudflareWorkersKVCounter implements ICounter {
  async increaseAndGet(identity: string): Promise<number> {
    let value = ((await this.kv.get(identity, {
      type: "json",
    })) as CounterModel) || {
      count: 0,
    };
    value.count += 1;
    await this.kv.put(identity, JSON.stringify(value));
    return Promise.resolve(value.count as number);
  }
  constructor(kv: KVNamespace) {
    this.kv = kv;
  }
  private kv: KVNamespace;
}
