import { ICounterStore } from "./counter";

export interface CounterModel {
  count: number;
}

export class CloudflareWorkersKVCounter implements ICounterStore {

  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

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

  async set(identity: string, value: number) {
    await this.kv.put(identity, JSON.stringify(value));
  };

  async get(identity: string) {
    let value = ((await this.kv.get(identity, {
      type: "json",
    })) as CounterModel) || {
      count: 0,
    };
    return value.count
  };
  async listKeys(): Promise<string[]> {
    const listResult = await this.kv.list();
    return listResult.keys.map(item => item.name)
  }

}
