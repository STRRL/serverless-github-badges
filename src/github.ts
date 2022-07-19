import { App, Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import { Span } from "@cloudflare/workers-honeycomb-logger";
import Toucan from "toucan-js";
export default class GitHubClient {
  octokit: Octokit

  constructor(appId: string,
    privateKey: string,
    installationID: number,
    tracer: Span) {
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: appId,
        privateKey: privateKey,
        installationId: installationID,
      },
      request: {
        fetch: tracer.fetch.bind(tracer)
      }
    });
  }
  async countOfPublicGistsOfUser(
    user: string,
  ) {
   
    const userGetResponse = await this.octokit.rest.users.getByUsername(
      { username: user }
    )
    return userGetResponse.data.public_gists
  }

  async githubRepoExisted(
    owner: string,
    repo: string,
    installationID:string,
    sentry:Toucan,
  ): Promise<boolean> {
    try {
      const repoGetResponse = await this.octokit.rest.repos.get({
        owner: owner,
        repo: repo,
      });
      return Promise.resolve(true);
    } catch (e) {
      sentry.setExtra("owner", owner);
      sentry.setExtra("repo", repo);
      sentry.setExtra("installationID", installationID);
      sentry.captureException(e);
      return Promise.resolve(false);
    }
  }

  async howLongGithubUserCreatedInYears(
    user: string,
  ): Promise<number> {
    const userGetResponse = await this.octokit.rest.users.getByUsername({
      username: user,
    });
    const createdAt = new Date(userGetResponse.data.created_at);
    const now = new Date();
    const years = now.getFullYear() - createdAt.getFullYear();
    return Promise.resolve(years);
  }

  async countOfPublicRepositoriesOfUser(
    user: string,
    appId: string,
    privateKey: string,
    installationID: number,
  ) {
    const userGetResponse = await this.octokit.rest.users.getByUsername(
      { username: user }
    )
    return userGetResponse.data.public_repos
  }

  async timeOfRepositoryLastUpdated(
    owner: string,
    repository: string,
  ) {
    const getRepoResponse = await this.octokit.rest.repos.get({
      owner: owner,
      repo: repository,
    })
    return getRepoResponse.data.updated_at
  }


  async timeOfRepositoryCreated(
    owner: string,
    repository: string,
  ) {

    const getRepoResponse = await this.octokit.rest.repos.get({
      owner: owner,
      repo: repository,
    })
    return getRepoResponse.data.created_at
  }
  async countOfCommitsAfterDate(
    user: string,
    start: Date,
  ) {
    const q = `author:${user}+author-date:>=${start.toISOString().split('T')[0]}`
    const searchCommitsResponse = await this.octokit.rest.search.commits({ q: q })
    return searchCommitsResponse.data.total_count;
  }

  async countOfIssueOrPRsAfterDate(
    user: string,
    start: Date,
    searchTarget: 'issue' | 'pr' | 'both',
  ) {
    let q = `author:${user}+created:>=${start.toISOString().split('T')[0]}`
    switch (searchTarget) {
      case "issue":
        q += "+type:issue"
        break;
      case "pr":
        q += '+is:pr'
        break;
      case "both":
        break;
      default:
        throw new Error(`unrecognized searchTarget ${searchTarget}`)
    }

    const searchIssuesAndPRsResponse = await this.octokit.rest.search.issuesAndPullRequests({ q: q })
    return searchIssuesAndPRsResponse.data.total_count;
  }

  async countOfUserContributionsAfterDate(
    user: string,
    start: Date,
    end: Date,
    allContribution: boolean,
  ): Promise<number> {

    if (allContribution) {
      const response = await this.octokit.graphql(
        `
  query { 
    user(login: "${user}") {
      email
      contributionsCollection {
        contributionYears
      }
    }
  }
          `
      ) as any
      const years = response.user.contributionsCollection.contributionYears as Array<number>
      const results = await Promise.all(years.map(async year => {
        const yearStart = new Date(`${year}-01-01`)
        const yearEnd = new Date(`${year}-12-31`)
        return await this.countOfUserContributionsAfterDate(user, yearStart, yearEnd, false)
      }))
      const allContributions = results.reduce((prev, curr) => prev + curr, 0)
      return allContributions
    }

    const response = await this.octokit.graphql(
      `
  query { 
    user(login: "${user}") {
      email
      contributionsCollection(from: "${start.toISOString()}", to: "${end.toISOString()}") {
        startedAt
        endedAt
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
    `
    )

    const result = (response as any).user.contributionsCollection.contributionCalendar.totalContributions as number
    return result;
  }
}