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
):Promise<number>{
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
    return Promise.resolve(0);
  }
}