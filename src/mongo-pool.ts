import { MongoClient, Db } from "mongodb";

/**
 * MongoDB Connection Pool using Durable Objects
 *
 * This Durable Object maintains a persistent MongoDB connection
 * that is reused across multiple requests, avoiding the overhead
 * of establishing a new connection for each request.
 */
export class MongoDBConnectionPool {
  private state: DurableObjectState;
  private env: any;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  /**
   * Get or create MongoDB client connection
   */
  private async getClient(): Promise<MongoClient> {
    if (!this.client) {
      console.log("Creating new MongoDB connection...");

      const connectionString = this.env.MONGODB_CONNECTION_STRING;
      if (!connectionString) {
        throw new Error("MONGODB_CONNECTION_STRING environment variable is not set");
      }

      this.client = new MongoClient(connectionString);
      await this.client.connect();
      console.log("MongoDB connected successfully");
    }
    return this.client;
  }

  /**
   * Get MongoDB database instance
   */
  private async getDb(): Promise<Db> {
    if (!this.db) {
      const client = await this.getClient();
      this.db = client.db(this.env.MONGODB_DB_NAME);
    }
    return this.db;
  }

  /**
   * Handle requests to the Durable Object
   */
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Parse the operation from the URL
      const operation = pathname.split("/").pop();

      switch (operation) {
        case "increaseAndGet":
          return await this.handleIncreaseAndGet(request);
        case "set":
          return await this.handleSet(request);
        case "get":
          return await this.handleGet(request);
        case "listKeys":
          return await this.handleListKeys(request);
        default:
          return new Response("Unknown operation", { status: 400 });
      }
    } catch (error) {
      console.error("MongoDB operation error:", error);
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  private async handleIncreaseAndGet(request: Request): Promise<Response> {
    const { identity } = await request.json();
    const db = await this.getDb();
    const collection = db.collection(this.env.MONGODB_COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { identity },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    return new Response(JSON.stringify({ count: result?.count || 1 }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  private async handleSet(request: Request): Promise<Response> {
    const { identity, value } = await request.json();
    const db = await this.getDb();
    const collection = db.collection(this.env.MONGODB_COLLECTION_NAME);

    await collection.updateOne(
      { identity },
      { $set: { count: value } },
      { upsert: true }
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  private async handleGet(request: Request): Promise<Response> {
    const { identity } = await request.json();
    const db = await this.getDb();
    const collection = db.collection(this.env.MONGODB_COLLECTION_NAME);

    const result = await collection.findOne({ identity });

    return new Response(JSON.stringify({ count: result?.count || 0 }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  private async handleListKeys(request: Request): Promise<Response> {
    const db = await this.getDb();
    const collection = db.collection(this.env.MONGODB_COLLECTION_NAME);

    const results = await collection.find().toArray();
    const keys = results.map((item: any) => item.identity);

    return new Response(JSON.stringify({ keys }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
