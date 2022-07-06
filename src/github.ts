import { App } from "octokit";

export async function githubRepoExisted(
  appId: string,
  privateKey: string,
  owner: string,
  repo: string,
  installationID: number
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
    return Promise.resolve(false);
  }
}
