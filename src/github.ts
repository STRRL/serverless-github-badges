import { App } from "octokit";
import Toucan from "toucan-js";

export async function githubRepoExisted(
  appId: string,
  privateKey: string,
  owner: string,
  repo: string,
  installationID: number,
  sentry: Toucan
): Promise<boolean> {
  const app = new App({
    appId: appId,
    privateKey: privateKey,
  });
  const octokit = await await app.getInstallationOctokit(installationID);
  try {
    const repoGetResponse = await octokit.rest.repos.get({
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

export async function howLongGithubUserCreatedInYears(
  user: string,
  appId: string,
  privateKey: string,
  installationID: number,
  sentry: Toucan
): Promise<number> {
  const app = new App({
    appId: appId,
    privateKey: privateKey,
  });
  const octokit = await await app.getInstallationOctokit(installationID);
  try {
    const userGetResponse = await octokit.rest.users.getByUsername({
      username: user,
    });
    const createdAt = new Date(userGetResponse.data.created_at);
    const now = new Date();
    const years = now.getFullYear() - createdAt.getFullYear();
    return Promise.resolve(years);
  } catch (e) {
    sentry.setExtra("user", user);
    sentry.setExtra("installationID", installationID);
    sentry.captureException(e);
    throw e;
  }
}

export async function countOfPublicRepositoriesOfUser(
  user: string,
  appId: string,
  privateKey: string,
  installationID: number,
  sentry: Toucan
) {
  try {
    const app = new App({
      appId: appId,
      privateKey: privateKey,
    });
    const octokit = await await app.getInstallationOctokit(installationID);
    const userGetResponse = await octokit.rest.users.getByUsername(
      { username: user }
    )
    return userGetResponse.data.public_repos
  } catch (e) {
    sentry.setExtra("user", user);
    sentry.setExtra("installationID", installationID);
    sentry.captureException(e);
    throw e;
  }
}

export async function countOfPublicGistsOfUser(
  user: string,
  appId: string,
  privateKey: string,
  installationID: number,
  sentry: Toucan
) {
  try {
    const app = new App({
      appId: appId,
      privateKey: privateKey,
    });
    const octokit = await await app.getInstallationOctokit(installationID);
    const userGetResponse = await octokit.rest.users.getByUsername(
      { username: user }
    )
    return userGetResponse.data.public_gists
  } catch (e) {
    sentry.setExtra("user", user);
    sentry.setExtra("installationID", installationID);
    sentry.captureException(e);
    throw e;
  }
}

export async function timeOfRepositoryLastUpdated(
  owner: string,
  repository: string,
  appId: string,
  privateKey: string,
  installationID: number,
  sentry: Toucan
) {
  try {
    const app = new App({
      appId: appId,
      privateKey: privateKey,
    });
    const octokit = await await app.getInstallationOctokit(installationID);
    const getRepoResponse = octokit.rest.repos.get({
      owner: owner,
      repo: repository,
    })
    return (await getRepoResponse).data.updated_at
  } catch (e) {
    sentry.setExtra("owner", owner);
    sentry.setExtra("repository", repository);
    sentry.setExtra("installationID", installationID);
    sentry.captureException(e);
    throw e;
  }
}
export async function timeOfRepositoryCreated(
  owner: string,
  repository: string,
  appId: string,
  privateKey: string,
  installationID: number,
  sentry: Toucan
) {
  try {
    const app = new App({
      appId: appId,
      privateKey: privateKey,
    });
    const octokit = await await app.getInstallationOctokit(installationID);
    const getRepoResponse = octokit.rest.repos.get({
      owner: owner,
      repo: repository,
    })
    return (await getRepoResponse).data.created_at
  } catch (e) {
    sentry.setExtra("owner", owner);
    sentry.setExtra("repository", repository);
    sentry.setExtra("installationID", installationID);
    sentry.captureException(e);
    throw e;
  }
}

export async function countOfCommitsAfterDate(
  user: string,
  start: Date,
  appId: string,
  privateKey: string,
  installationID: number,
  sentry: Toucan
) {
  try {
    const app = new App({
      appId: appId,
      privateKey: privateKey,
    });
    const octokit = await app.getInstallationOctokit(installationID);
    const q = `author:${user}+author-date:>=${start.toISOString().split('T')[0]}`
    const searchCommitsResponse = await octokit.rest.search.commits({ q: q })
    return searchCommitsResponse.data.total_count;
  } catch (e) {
    sentry.setExtra("owner", user);
    sentry.setExtra("start", start);
    sentry.setExtra("installationID", installationID);
    sentry.captureException(e);
    throw e;
  }
}

export async function countOfIssueOrPRsAfterDate(
  user: string,
  start: Date,
  searchTarget: 'issue' | 'pr' | 'both',
  appId: string,
  privateKey: string,
  installationID: number,
  sentry: Toucan
) {
  try {
    const app = new App({
      appId: appId,
      privateKey: privateKey,
    });
    const octokit = await app.getInstallationOctokit(installationID);
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

    const searchIssuesAndPRsResponse = await octokit.rest.search.issuesAndPullRequests({ q: q })
    console.log(JSON.stringify(searchIssuesAndPRsResponse))
    return searchIssuesAndPRsResponse.data.total_count;
  } catch (e) {
    sentry.setExtra("owner", user);
    sentry.setExtra("start", start);
    sentry.setExtra("installationID", installationID);
    sentry.captureException(e);
    throw e;
  }
}

export async function countOfUserContributionsAfterDate(
  user: string,
  start: Date,
  end: Date,
  allContribution: boolean,
  appId: string,
  privateKey: string,
  installationID: number,
  sentry: Toucan
): Promise<number> {
  try {
    const app = new App({
      appId: appId,
      privateKey: privateKey,
    });

    const octokit = await app.getInstallationOctokit(installationID);

    if (allContribution) {
      const response = await octokit.graphql(
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
      const results = await Promise.all(years.map(year => {
        const yearStart = new Date(`${year}-01-01`)
        const yearEnd = new Date(`${year}-12-31`)
        return countOfUserContributionsAfterDate(user, yearStart, yearEnd, false, appId, privateKey, installationID, sentry)
      }))
      const allContributions = results.reduce((prev, curr) => prev + curr, 0)
      return allContributions
    }

    const response = await octokit.graphql(
      `
query { 
  user(login: "${user}") {
    email
    createdAt
    contributionsCollection(from: "${start.toISOString()}", to: "${end.toISOString()}") {
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
  } catch (e) {
    sentry.setExtra("owner", user);
    sentry.setExtra("start", start);
    sentry.setExtra("installationID", installationID);
    sentry.captureException(e);
    throw e;
  }
}