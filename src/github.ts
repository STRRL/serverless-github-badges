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