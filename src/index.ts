/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import GitHubClient from "./github";
import { fetchBadgeURL } from "./badge";
import { ICounter, ICounterStore } from "./counter/counter";
import { MongoDBCounter } from "./counter/mongodb-realm-counter";
import Toucan from "toucan-js";
import { buildNoCacheResponseAsProxy } from "./no-cache-proxy";
import { Router, Request as RouterRequest } from "itty-router";
import {
  RequestTracer,
  wrapModule,
} from "@cloudflare/workers-honeycomb-logger";

export interface Env {
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_APP_DEFAULT_INSTALLATION_ID: string;
  SENTRY_DSN: string;
  HONEYCOMB_API_KEY: string;
  HONEYCOMB_DATASET: string;
  MONGODB_URL: string;
  MONGODB_DB_NAME: string;
  MONGODB_COLLECTION_NAME: string;
}

const router = Router();
router.get(
  "/visits/:owner/:repo",
  async (
    request: RouterRequest,
    env: Env,
    sentry,
    githubClient: GitHubClient,
    visitCounter: ICounter
  ) => {
    const githubUsername = request.params!.owner;
    const githubRepoName = request.params!.repo;
    const existed = await githubClient.githubRepoExisted(
      githubUsername,
      githubRepoName,
      env.GITHUB_APP_DEFAULT_INSTALLATION_ID,
      sentry
    );
    if (existed) {
      const count = await visitCounter.increaseAndGet(
        `github-repo-visit-${githubUsername}-${githubRepoName}`
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
  }
);

router.get(
  "/years/:user",
  async (
    request: RouterRequest,
    _env,
    _sentry,
    githubClient: GitHubClient,
    _visitCounter: ICounter
  ) => {
    const createdInYears = await githubClient.howLongGithubUserCreatedInYears(
      request.params!.user
    );
    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL("Years", createdInYears.toString(), query)
    );
  }
);

router.get("/repos/:owner", async (request, env, sentry, githubClient) => {
  const count = await githubClient.countOfPublicRepositoriesOfUser(
    request.params!.owner,
    env.GITHUB_APP_ID,
    env.GITHUB_APP_PRIVATE_KEY,
    parseInt(env.GITHUB_APP_DEFAULT_INSTALLATION_ID)
  );
  let query = "";
  if (request.url.includes("?")) {
    query = request.url.substring(request.url.indexOf("?"));
  }
  return await buildNoCacheResponseAsProxy(
    fetchBadgeURL("Repos", count.toString(), query)
  );
});

router.get(
  "/gists/:owner",
  async (request: RouterRequest, env, sentry, githubClient: GitHubClient) => {
    const count = await githubClient.countOfPublicGistsOfUser(
      request.params!.owner
    );
    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL("Gists", count.toString(), query)
    );
  }
);

router.get(
  "/updated/:owner/:repo",
  async (request: RouterRequest, env, sentry, githubClient: GitHubClient) => {
    const updated = await githubClient.timeOfRepositoryLastUpdated(
      request.params!.owner,
      request.params!.repo
    );
    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL("Updated", updated.toString(), query)
    );
  }
);

router.get(
  "/created/:owner/:repo",
  async (request: RouterRequest, env, sentry, githubClient: GitHubClient) => {
    const created = await githubClient.timeOfRepositoryCreated(
      request.params!.owner,
      request.params!.repo
    );
    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL("Created", created.toString(), query)
    );
  }
);

router.get(
  "/commits/:periodicity/:user",
  async (request: RouterRequest, env, sentry, githubClient: GitHubClient) => {
    const now = new Date();
    let start = now;
    switch (request.params!.periodicity) {
      case "all":
        start = new Date("1970-01-01");
        break;
      case "daily":
        start.setDate(now.getDate() - 1);
        break;
      case "weekly":
        start.setDate(now.getDate() - 7);
        break;
      case "monthly":
        start.setDate(now.getDate() - 30);
        break;
      case "yearly":
        start.setDate(now.getDate() - 365);
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }
    const commits = await githubClient.countOfCommitsAfterDate(
      request.params!.user,
      start
    );

    let title = "";
    switch (request.params!.periodicity) {
      case "all":
        title = "All commits";
        break;
      case "daily":
        title = "Commits today";
        break;
      case "weekly":
        title = "Commits this week";
        break;
      case "monthly":
        title = "Commits this month";
        break;
      case "yearly":
        title = "Commits this year";
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }

    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL(title, commits.toString(), query)
    );
  }
);

router.get(
  "/contributions/:periodicity/:user",
  async (request: RouterRequest, env, sentry, githubClient: GitHubClient) => {
    const tracer = (request as any).tracer as RequestTracer;
    const now = new Date();
    let start = now;
    switch (request.params!.periodicity) {
      case "all":
        start = new Date("1970-01-01");
        break;
      case "daily":
        start.setDate(now.getDate() - 1);
        break;
      case "weekly":
        start.setDate(now.getDate() - 7);
        break;
      case "monthly":
        start.setDate(now.getDate() - 30);
        break;
      case "yearly":
        start.setDate(now.getDate() - 365);
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }
    const commits = await githubClient.countOfUserContributionsAfterDate(
      request.params!.user,
      start,
      new Date(),
      request.params!.periodicity == "all"
    );

    let title = "";
    switch (request.params!.periodicity) {
      case "all":
        title = "All contributions";
        break;
      case "daily":
        title = "Contributions today";
        break;
      case "weekly":
        title = "Contributions this week";
        break;
      case "monthly":
        title = "Contributions this month";
        break;
      case "yearly":
        title = "Contributions this year";
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }

    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL(title, commits.toString(), query)
    );
  }
);

router.get(
  "/issues/:periodicity/:user",
  async (request: RouterRequest, env, sentry, githubClient: GitHubClient) => {
    const now = new Date();
    let start = now;
    switch (request.params!.periodicity) {
      case "all":
        start = new Date("1970-01-01");
        break;
      case "daily":
        start.setDate(now.getDate() - 1);
        break;
      case "weekly":
        start.setDate(now.getDate() - 7);
        break;
      case "monthly":
        start.setDate(now.getDate() - 30);
        break;
      case "yearly":
        start.setDate(now.getDate() - 365);
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }
    const commits = await githubClient.countOfIssueOrPRsAfterDate(
      request.params!.user,
      start,
      "issue"
    );

    let title = "";
    switch (request.params!.periodicity) {
      case "all":
        title = "All issues";
        break;
      case "daily":
        title = "Issues today";
        break;
      case "weekly":
        title = "Issues this week";
        break;
      case "monthly":
        title = "Issues this month";
        break;
      case "yearly":
        title = "Issues this year";
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }

    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL(title, commits.toString(), query)
    );
  }
);

router.get(
  "/prs/:periodicity/:user",
  async (request: RouterRequest, env, sentry, githubClient: GitHubClient) => {
    const now = new Date();
    let start = now;
    switch (request.params!.periodicity) {
      case "all":
        start = new Date("1970-01-01");
        break;
      case "daily":
        start.setDate(now.getDate() - 1);
        break;
      case "weekly":
        start.setDate(now.getDate() - 7);
        break;
      case "monthly":
        start.setDate(now.getDate() - 30);
        break;
      case "yearly":
        start.setDate(now.getDate() - 365);
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }
    const commits = await githubClient.countOfIssueOrPRsAfterDate(
      request.params!.user,
      start,
      "pr"
    );

    let title = "";
    switch (request.params!.periodicity) {
      case "all":
        title = "All PRs";
        break;
      case "daily":
        title = "PRs today";
        break;
      case "weekly":
        title = "PRs this week";
        break;
      case "monthly":
        title = "PRs this month";
        break;
      case "yearly":
        title = "PRs this year";
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }

    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL(title, commits.toString(), query)
    );
  }
);

router.get(
  "/issues-and-prs/:periodicity/:user",
  async (request: RouterRequest, env, sentry, githubClient: GitHubClient) => {
    const now = new Date();
    let start = now;
    switch (request.params!.periodicity) {
      case "all":
        start = new Date("1970-01-01");
        break;
      case "daily":
        start.setDate(now.getDate() - 1);
        break;
      case "weekly":
        start.setDate(now.getDate() - 7);
        break;
      case "monthly":
        start.setDate(now.getDate() - 30);
        break;
      case "yearly":
        start.setDate(now.getDate() - 365);
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }
    const commits = await githubClient.countOfIssueOrPRsAfterDate(
      request.params!.user,
      start,
      "both"
    );

    let title = "";
    switch (request.params!.periodicity) {
      case "all":
        title = "All issue and PRs";
        break;
      case "daily":
        title = "Issue and PRs today";
        break;
      case "weekly":
        title = "Issue and PRs this week";
        break;
      case "monthly":
        title = "Issue and PRs this month";
        break;
      case "yearly":
        title = "Issue and PRs this year";
        break;
      default:
        throw new Error(
          `unrecognized periodicity: ${request.params!.periodicity}`
        );
    }

    let query = "";
    if (request.url.includes("?")) {
      query = request.url.substring(request.url.indexOf("?"));
    }
    return await buildNoCacheResponseAsProxy(
      fetchBadgeURL(title, commits.toString(), query)
    );
  }
);

router.get("/", async () => {
  return Response.redirect(
    "https://github.com/STRRL/serverless-github-badges",
    302
  );
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

const worker = {
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
      tracesSampleRate: 1.0,
    });
    const githubClient = new GitHubClient(
      env.GITHUB_APP_ID,
      env.GITHUB_APP_PRIVATE_KEY,
      parseInt(env.GITHUB_APP_DEFAULT_INSTALLATION_ID),
      request.tracer
    );

    const visitsCounter = new MongoDBCounter(
      env.MONGODB_URL,
      env.MONGODB_DB_NAME,
      env.MONGODB_COLLECTION_NAME
    );

    try {
      const responseFromRouter = (await router.handle(
        request,
        env,
        sentry,
        githubClient,
        visitsCounter
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

const hcConfig = {
  // it would be override with env HONEYCOMB_API_KEY and HONEYCOMB_DATASET
  // see the **LAST SENTENCE** of section: https://github.com/cloudflare/workers-honeycomb-logger#module-syntax-configuration
  apiKey: "",
  dataset: "",
  sampleRates: {
    "1xx": 1,
    "2xx": 1,
    "3xx": 1,
    "4xx": 1,
    "5xx": 1,
    exception: 1,
  },
  sendTraceContext: true,
};

export default wrapModule(hcConfig, worker);
