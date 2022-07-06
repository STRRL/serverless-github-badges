# serverless-github-badges

This project is inspired by [puf17640/git-badges](https://github.com/puf17640/git-badges), but built with the serverless stack: Cloudflare Workers and Cloudflare Workers KV.

It would be cheap and easy to deploy, more important, it has better availability than the self-hosted service.

## Currently available badges

[![Visits Badge](https://badges.strrl.dev/visits/STRRL/serverless-github-badges)](https://badges.strrl.dev)

Return the badge contains the counter of certain GitHub repository.

### Usage

URL:

```text
https://badges.strrl.dev/visits/${owner}/${repo}
```

Markdown:

```markdown
[![Visits Badge](https://badges.strrl.dev/visits/STRRL/serverless-github-badges)](https://badges.strrl.dev)
```
