/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { githubRepoExisted } from "./github";
import { fetchBadgeURL } from "./badge";
import { increaseAndGet } from "./counter";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  VISITS_KV: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/visits")) {
      const githubUsername = pathname.split("/")[2];
      const githubRepoName = pathname.split("/")[3];
      const existed = await githubRepoExisted(
        env.GITHUB_APP_ID,
        env.GITHUB_APP_PRIVATE_KEY,
        githubUsername,
        githubRepoName
      );
      if (existed) {
        const count = await increaseAndGet(
          `github-repo-visit-${githubUsername}-${githubRepoName}`,
          env.VISITS_KV
        );
        return Response.redirect(fetchBadgeURL("Visits", count.toString()), 302);
      }
    }
    return new Response("Hello World!");
  },
};
