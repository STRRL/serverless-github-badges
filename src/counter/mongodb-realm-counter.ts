import { ICounter } from "./counter";

import * as Realm from "realm-web";

type Document = globalThis.Realm.Services.MongoDB.Document;

interface VisitsCounter extends Document {
  count: number;
}

export class MongoDBCounter implements ICounter {
  // private mongoServiceName: string;
  private mongoRealmAppID: string;
  private apiKey: string;

  constructor(mongoRealmAppID: string, apiKey: string) {
    this.mongoRealmAppID = mongoRealmAppID;
    this.apiKey = apiKey;
  }

  async increaseAndGet(identity: string): Promise<number> {
    const collectionClient = await this.fetchClientWithCollection();
    const result = await collectionClient.findOneAndUpdate(
      { identity: identity },
      { $inc: { count: 1 } },
      { upsert: true, returnNewDocument: true }
    )
    return result!.count
  }

  private async fetchClientWithCollection(): Promise<globalThis.Realm.Services.MongoDB.MongoDBCollection<VisitsCounter>> {
    const App = new Realm.App(this.mongoRealmAppID);
    const credentials = Realm.Credentials.apiKey(this.apiKey);
    const user = await App.logIn(credentials);
    const client = user.mongoClient('serverless-github-badges');
    const collection = client.db("serverless-github-badges").collection<VisitsCounter>("visits-counter")
    return collection
  }
}
