/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { countOfCommitsAfterDate, countOfPublicGistsOfUser, countOfPublicRepositoriesOfUser, githubRepoExisted, howLongGithubUserCreatedInYears, timeOfRepositoryCreated, timeOfRepositoryLastUpdated } from "./github";
import { fetchBadgeURL } from "./badge";
import { increaseAndGet } from "./counter";
import Toucan from "toucan-js";
import { buildNoCacheResponseAsProxy } from "./no-cache-proxy";
import { Router } from "itty-router";

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  VISITS_KV: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;

  // There are several required secret environment variables, replace with wrangler secrets put <secret-name> before deploy your own service.
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_APP_DEFAULT_INSTALLATION_ID: string;
  SENTRY_DSN: string;
}

const router = Router();
router.get("/visits/:owner/:repo", async (request, env, sentry) => {
  const githubUsername = request.params!.owner;
  const githubRepoName = request.params!.repo;
  const existed = await githubRepoExisted(
    env.GITHUB_APP_ID,
    env.GITHUB_APP_PRIVATE_KEY,
    githubUsername,
    githubRepoName,
    parseInt(env.GITHUB_APP_DEFAULT_INSTALLATION_ID),
    sentry
  );
  if (existed) {
    const count = await increaseAndGet(
      `github-repo-visit-${githubUsername}-${githubRepoName}`,
      env.VISITS_KV
    );
    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL("Visits", count.toString(), query)
    );
  }
  return new Response(
    `No Permission to Access GitHub Repository: ${githubUsername}/${githubRepoName}. Please Make Sure It Exists, and Installed the Github App “Serverless Github Badges” for the Private Repository.`
  );
});

router.get("/years/:user", async (request, env, sentry) => {
  const createdInYears = await howLongGithubUserCreatedInYears(
    request.params!.user,
    env.GITHUB_APP_ID,
    env.GITHUB_APP_PRIVATE_KEY,
    parseInt(env.GITHUB_APP_DEFAULT_INSTALLATION_ID),
    sentry
  );
  let query = "";
  if (request.url.includes("?")) {
    query = request.url.substring(request.url.indexOf("?"));
  }
  return await buildNoCacheResponseAsProxy(
    fetchBadgeURL("Years", createdInYears.toString(), query)
  );
});

router.get("/repos/:owner", async (request, env, sentry) => {
  const count = await countOfPublicRepositoriesOfUser(
    request.params!.owner,
    env.GITHUB_APP_ID,
    env.GITHUB_APP_PRIVATE_KEY,
    parseInt(env.GITHUB_APP_DEFAULT_INSTALLATION_ID),
    sentry
  )
  let query = "";
  if (request.url.includes("?")) {
    query = request.url.substring(request.url.indexOf("?"));
  }
  return await buildNoCacheResponseAsProxy(
    fetchBadgeURL("Repos", count.toString(), query)
  );
});

router.get("/gists/:owner", async (request, env, sentry) => {
  const count = await countOfPublicGistsOfUser(
    request.params!.owner,
    env.GITHUB_APP_ID,
    env.GITHUB_APP_PRIVATE_KEY,
    parseInt(env.GITHUB_APP_DEFAULT_INSTALLATION_ID),
    sentry
  )
  let query = "";
  if (request.url.includes("?")) {
    query = request.url.substring(request.url.indexOf("?"));
  }
  return await buildNoCacheResponseAsProxy(
    fetchBadgeURL("Gists", count.toString(), query)
  );
})

router.get("/updated/:owner/:repo", async (request, env, sentry) => {
  const updated = await timeOfRepositoryLastUpdated(
    request.params!.owner,
    request.params!.repo,
    env.GITHUB_APP_ID,
    env.GITHUB_APP_PRIVATE_KEY,
    parseInt(env.GITHUB_APP_DEFAULT_INSTALLATION_ID),
    sentry
  )
  let query = "";
  if (request.url.includes("?")) {
    query = request.url.substring(request.url.indexOf("?"));
  }
  return await buildNoCacheResponseAsProxy(
    fetchBadgeURL("Updated", updated.toString(), query)
  );
})

router.get("/created/:owner/:repo", async (request, env, sentry) => {
  const created = await timeOfRepositoryCreated(
    request.params!.owner,
    request.params!.repo,
    env.GITHUB_APP_ID,
    env.GITHUB_APP_PRIVATE_KEY,
    parseInt(env.GITHUB_APP_DEFAULT_INSTALLATION_ID),
    sentry
  )
  let query = "";
  if (request.url.includes("?")) {
    query = request.url.substring(request.url.indexOf("?"));
  }
  return await buildNoCacheResponseAsProxy(
    fetchBadgeURL("Created", created.toString(), query)
  );
})

router.get('/commits/:periodicity/:user', async (request, env, sentry) => {
  const now = new Date()
  let start = now;
  switch (request.params!.periodicity) {
    case 'all':
      start = new Date('1970-01-01');
    case 'daily':
      start.setDate(now.getDate() - 1)
      break;
    case 'weekly':
      start.setDate(now.getDate() - 7)
      break;
    case 'monthly':
      start.setDate(now.getDate() - 30)
      break;
    case 'yearly':
      start.setDate(now.getDate() - 365)
      break;
    default:
      throw new Error(`unrecognized periodicity: ${request.params!.periodicity}`)
  }
  const commits = await countOfCommitsAfterDate(
    request.params!.user,
    start,
    env.GITHUB_APP_ID,
    env.GITHUB_APP_PRIVATE_KEY,
    parseInt(env.GITHUB_APP_DEFAULT_INSTALLATION_ID),
    sentry
  )

  let title = ''
  switch (request.params!.periodicity) {
    case 'all':
      title = 'All commits'
      break;
    case 'daily':
      title = 'Commits today'
      break;
    case 'weekly':
      title = 'Commits this week'
      break;
    case 'monthly':
      title = 'Commits this month'
      break;
    case 'yearly':
      title = 'Commits this year'
      break;
    default:
      throw new Error(`unrecognized periodicity: ${request.params!.periodicity}`)
  }

  let query = "";
  if (request.url.includes("?")) {
    query = request.url.substring(request.url.indexOf("?"));
  }
  return await buildNoCacheResponseAsProxy(
    fetchBadgeURL(title, commits.toString(), query)
  );
})

router.get("/", async () => {
  return Response.redirect("https://github.com/STRRL/serverless-github-badges", 302)
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      context: ctx, // Includes 'waitUntil', which is essential for Sentry logs to be delivered. Modules workers do not include 'request' in context -- you'll need to set it separately.
      request, // request is not included in 'context', so we set it here.
      allowedHeaders: ["user-agent"],
      allowedSearchParams: /(.*)/,
    });
    try {
      const responseFromRouter = (await router.handle(
        request,
        env,
        sentry
      )) as Response;
      return responseFromRouter;
    } catch (err) {
      sentry.captureException(err);
      console.log(err);
      return new Response("Something went wrong", {
        status: 500,
        statusText: "Internal Server Error",
      });
    }
  },
};
