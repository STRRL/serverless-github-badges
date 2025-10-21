import { ICounterStore } from "./counter";

/**
 * MongoDB Counter using Durable Objects for connection pooling
 *
 * This implementation uses Cloudflare Durable Objects to maintain
 * a persistent MongoDB connection, avoiding reconnection overhead.
 */
export class MongoDBCounter implements ICounterStore {
  private mongoPoolStub: DurableObjectStub;

  constructor(mongoPoolStub: DurableObjectStub) {
    this.mongoPoolStub = mongoPoolStub;
  }

  async increaseAndGet(identity: string): Promise<number> {
    const response = await this.mongoPoolStub.fetch(
      new Request("http://internal/increaseAndGet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity })
      })
    );

    const data = await response.json() as { count: number };
    return data.count;
  }

  async set(identity: string, value: number): Promise<void> {
    await this.mongoPoolStub.fetch(
      new Request("http://internal/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, value })
      })
    );
  }

  async get(identity: string): Promise<number> {
    const response = await this.mongoPoolStub.fetch(
      new Request("http://internal/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity })
      })
    );

    const data = await response.json() as { count: number };
    return data.count;
  }

  async listKeys(): Promise<string[]> {
    const response = await this.mongoPoolStub.fetch(
      new Request("http://internal/listKeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
    );

    const data = await response.json() as { keys: string[] };
    return data.keys;
  }
}
