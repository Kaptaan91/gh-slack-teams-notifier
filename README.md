# gh-slack-teams-notifier

A lightweight, self-hosted Node.js (18+) webhook relay for GitHub events.

It listens for GitHub webhook payloads, verifies the HMAC signature with the shared secret, and forwards selected events to Slack and Microsoft Teams.

Features
- Route each GitHub repository to one or more notification channels
- Filter events per channel (pull requests, issues, releases, failed CI, etc.)
- Verify GitHub webhook signatures before processing
- Run completely self-hosted on your own infrastructure
- Zero dependencies; uses only the Node.js standard library
- Node.js 18+

Why this exists
This project is a simple, fully controlled alternative to hosted webhook notification services. You decide where each repository sends events, which events are forwarded, and how the payload is shaped before it reaches Slack or Teams.

Important note
This project has been validated with mocked webhook payloads. Real Slack and Microsoft Teams testing is recommended before production use.

Quick start
1. Clone the repo
2. Create a `.env` file with your GitHub webhook secret and target webhook URLs
3. Start the service:

```bash
npm install
npm start
```

Environment variables
- `GITHUB_WEBHOOK_SECRET`: GitHub secret used to verify `X-Hub-Signature-256`
- `SLACK_WEBHOOK_URL`: Slack incoming webhook URL
- `TEAMS_WEBHOOK_URL`: Microsoft Teams incoming webhook URL
- `PORT`: HTTP port to listen on (default: 3000)
- `REPO_CHANNELS`: optional JSON mapping of repository names to configured channels

Example
```bash
export GITHUB_WEBHOOK_SECRET=your_secret
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
export TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
export PORT=3000
npm start
```

GitHub webhook setup
1. In your GitHub repository, open Settings → Webhooks
2. Add a new webhook
3. Set the payload URL to your server URL, for example:
   `https://your-host.example.com/github-webhook`
4. Set content type to `application/json`
5. Choose the events you want to receive
6. Set the secret to the same value as `GITHUB_WEBHOOK_SECRET`

Example repository routing
You can route events by repo like this:

```json
{
  "owner/repo-a": {
    "slack": ["#repo-a-builds"],
    "teams": ["repo-a-alerts"]
  },
  "owner/repo-b": {
    "slack": ["#repo-b-prs"],
    "teams": ["repo-b-updates"]
  }
}
```

Channel filters
The service can filter by event type before sending a message:
- `pull_request`
- `issues`
- `release`
- `check_run`
- `workflow_run`

Security
- Signature verification is mandatory
- Reject requests with missing or malformed signatures
- Run behind TLS/HTTPS in production
- Use environment variables or a secure secret manager

Repository
https://github.com/Kaptaan91/gh-slack-teams-notifier

Feedback and pull requests are welcome.

License
MIT
