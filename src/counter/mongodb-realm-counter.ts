import { ICounterStore } from "./counter";
import { MongoClient } from "mongodb";

/**
 * MongoDB Counter using native MongoDB driver
 *
 * Note: This creates a new connection for each request.
 * For better performance with connection pooling, consider using
 * Durable Objects (requires Cloudflare Workers Paid plan).
 */
export class MongoDBCounter implements ICounterStore {
  private connectionString: string;
  private dbName: string;
  private collectionName: string;

  constructor(connectionString: string, dbName: string, collectionName: string) {
    this.connectionString = connectionString;
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  async increaseAndGet(identity: string): Promise<number> {
    const client = new MongoClient(this.connectionString);
    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection(this.collectionName);

      const result = await collection.findOneAndUpdate(
        { identity },
        { $inc: { count: 1 } },
        { upsert: true, returnDocument: "after" }
      );

      // MongoDB 5.x returns result.value for the updated document
      return result.value?.count || result?.count || 1;
    } finally {
      await client.close();
    }
  }

  async set(identity: string, value: number): Promise<void> {
    const client = new MongoClient(this.connectionString);
    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection(this.collectionName);

      await collection.updateOne(
        { identity },
        { $set: { count: value } },
        { upsert: true }
      );
    } finally {
      await client.close();
    }
  }

  async get(identity: string): Promise<number> {
    const client = new MongoClient(this.connectionString);
    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection(this.collectionName);

      const result = await collection.findOne({ identity });
      return result?.count || 0;
    } finally {
      await client.close();
    }
  }

  async listKeys(): Promise<string[]> {
    const client = new MongoClient(this.connectionString);
    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection(this.collectionName);

      const results = await collection.find().toArray();
      return results.map((item: any) => item.identity);
    } finally {
      await client.close();
    }
  }
}
