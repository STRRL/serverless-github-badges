# serverless-github-badges

This project is inspired by [puf17640/git-badges](https://github.com/puf17640/git-badges), but built with the serverless stack: Cloudflare Workers and Cloudflare Workers KV.

It would be cheap and easy to deploy, more important, it has better availability than the self-hosted service.

## Currently available badges

[![Visits Badge](https://badges.strrl.dev/visits/STRRL/serverless-github-badges)](https://badges.strrl.dev)

Return the badge contains the counter of certain GitHub repository.

URL:

```text
https://badges.strrl.dev/visits/${owner}/${repo}
```

Markdown:

```text
[![Visits Badge](https://badges.strrl.dev/visits/${owner}/${repo})](https://badges.strrl.dev)
```

---

[![Years Badge](https://badges.strrl.dev/years/STRRL)](https://badges.strrl.dev)

Return the badge contains the number of years you have been a GitHub member.

URL:

```text
https://badges.strrl.dev/years/${user}
```

Markdown:

```text
[![Years Badge](https://badges.strrl.dev/years/${user})](https://badges.strrl.dev)
```

---

[![Public Repos Badge](https://badges.strrl.dev/repos/STRRL)](https://badges.strrl.dev)

Return the badge contains the number of your public repository.

URL:

```text
https://badges.strrl.dev/repos/${user}
```

Markdown:

```text
[![Public Repos Badge](https://badges.strrl.dev/repos/${user})](https://badges.strrl.dev)
```

---

[![Public Gists Badge](https://badges.strrl.dev/gists/STRRL)](https://badges.strrl.dev)

Return the badge contains the number of your public gists.

URL:

```text
https://badges.strrl.dev/gists/${user}
```

Markdown:

```text
[![Public Gists Badge](https://badges.strrl.dev/gists/${user})](https://badges.strrl.dev)
```

---

[![Repo Updated Badge](https://badges.strrl.dev/updated/STRRL/serverless-github-badges)](https://badges.strrl.dev)

Return the badge contains the last updated time of this repository.

URL:

```text
https://badges.strrl.dev/updated/${owner}/${repo}
```

Markdown:

```text
[![Repo Updated Badge](https://badges.strrl.dev/updated/${owner}/${repo})](https://badges.strrl.dev)
```

---

[![Repo Created Badge](https://badges.strrl.dev/created/STRRL/serverless-github-badges)](https://badges.strrl.dev)

Return the badge contains the created time of this repository.

URL:

```text
https://badges.strrl.dev/created/${owner}/${repo}
```

Markdown:

```text
[![Repo Created Badge](https://badges.strrl.dev/created/${owner}/${repo})](https://badges.strrl.dev)
```

---

[![Contributions Badge](https://badges.strrl.dev/contributions/daily/STRRL)](https://badges.strrl.dev)

[![Contributions Badge](https://badges.strrl.dev/contributions/weekly/STRRL)](https://badges.strrl.dev)

[![Contributions Badge](https://badges.strrl.dev/contributions/monthly/STRRL)](https://badges.strrl.dev)

[![Contributions Badge](https://badges.strrl.dev/contributions/yearly/STRRL)](https://badges.strrl.dev)

[![Contributions Badge](https://badges.strrl.dev/contributions/all/STRRL)](https://badges.strrl.dev)

Return the badge contains the contributions in the certain periodicity.

Available values for `periodicity`: `all`, `daily`, `weekly`, `monthly`, `yealy`.

URL:

```text
https://badges.strrl.dev/contributions/${periodicity}/${user}
```

Markdown:

```text
[![Contributions Badge](https://badges.strrl.dev/contributions/${periodicity}/${user})](https://badges.strrl.dev)
```

---

[![Repo Created Badge](https://badges.strrl.dev/created/STRRL/serverless-github-badges)](https://badges.strrl.dev)

Return the badge contains the created time of this repository.

URL:

```text
https://badges.strrl.dev/created/${owner}/${repo}
```

Markdown:

```text
[![Repo Created Badge](https://badges.strrl.dev/created/${owner}/${repo})](https://badges.strrl.dev)
```

---

[![Commits Badge](https://badges.strrl.dev/commits/daily/STRRL)](https://badges.strrl.dev)

[![Commits Badge](https://badges.strrl.dev/commits/weekly/STRRL)](https://badges.strrl.dev)

[![Commits Badge](https://badges.strrl.dev/commits/monthly/STRRL)](https://badges.strrl.dev)

[![Commits Badge](https://badges.strrl.dev/commits/yearly/STRRL)](https://badges.strrl.dev)

[![Commits Badge](https://badges.strrl.dev/commits/all/STRRL)](https://badges.strrl.dev)

Return the badge contains the commits in the certain periodicity.

Available values for `periodicity`: `all`, `daily`, `weekly`, `monthly`, `yealy`.

URL:

```text
https://badges.strrl.dev/commits/${periodicity}/${user}
```

Markdown:

```text
[![Commits Badge](https://badges.strrl.dev/commits/${periodicity}/${user})](https://badges.strrl.dev)
```

---

[![Issues Badge](https://badges.strrl.dev/issues/daily/STRRL)](https://badges.strrl.dev)

[![Issues Badge](https://badges.strrl.dev/issues/weekly/STRRL)](https://badges.strrl.dev)

[![Issues Badge](https://badges.strrl.dev/issues/monthly/STRRL)](https://badges.strrl.dev)

[![Issues Badge](https://badges.strrl.dev/issues/yearly/STRRL)](https://badges.strrl.dev)

[![Issues Badge](https://badges.strrl.dev/issues/all/STRRL)](https://badges.strrl.dev)

Return the badge contains the created issues in the certain periodicity.

Available values for `periodicity`: `all`, `daily`, `weekly`, `monthly`, `yealy`.

URL:

```text
https://badges.strrl.dev/issues/${periodicity}/${user}
```

Markdown:

```text
[![Issues Badge](https://badges.strrl.dev/issues/${periodicity}/${user})](https://badges.strrl.dev)
```

---

[![PRs Badge](https://badges.strrl.dev/prs/daily/STRRL)](https://badges.strrl.dev)

[![PRs Badge](https://badges.strrl.dev/prs/weekly/STRRL)](https://badges.strrl.dev)

[![PRs Badge](https://badges.strrl.dev/prs/monthly/STRRL)](https://badges.strrl.dev)

[![PRs Badge](https://badges.strrl.dev/prs/yearly/STRRL)](https://badges.strrl.dev)

[![PRs Badge](https://badges.strrl.dev/prs/all/STRRL)](https://badges.strrl.dev)

Return the badge contains the created PRs in the certain periodicity.

Available values for `periodicity`: `all`, `daily`, `weekly`, `monthly`, `yealy`.

URL:

```text
https://badges.strrl.dev/prs/${periodicity}/${user}
```

Markdown:

```text
[![PRs Badge](https://badges.strrl.dev/prs/${periodicity}/${user})](https://badges.strrl.dev)
```

---

[![Issues and PRs Badge](https://badges.strrl.dev/issues-and-prs/daily/STRRL)](https://badges.strrl.dev)

[![Issues and PRs Badge](https://badges.strrl.dev/issues-and-prs/weekly/STRRL)](https://badges.strrl.dev)

[![Issues and PRs Badge](https://badges.strrl.dev/issues-and-prs/monthly/STRRL)](https://badges.strrl.dev)

[![Issues and PRs Badge](https://badges.strrl.dev/issues-and-prs/yearly/STRRL)](https://badges.strrl.dev)

[![Issues and PRs Badge](https://badges.strrl.dev/issues-and-prs/all/STRRL)](https://badges.strrl.dev)

Return the badge contains the commits in the certain periodicity.

Available values for `periodicity`: `all`, `daily`, `weekly`, `monthly`, `yealy`.

URL:

```text
https://badges.strrl.dev/issues-and-prs/${periodicity}/${user}
```

Markdown:

```text
[![Issues and PRs Badge](https://badges.strrl.dev/issues-and-prs/${periodicity}/${user})](https://badges.strrl.dev)
```
