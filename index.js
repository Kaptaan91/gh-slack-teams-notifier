const http = require('http');
const crypto = require('crypto');

const port = Number(process.env.PORT || 3000);
const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || '';
const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL || '';

function verifyGitHubSignature(payload, signature) {
  if (!secret) {
    return false;
  }

  if (!signature || typeof signature !== 'string') {
    return false;
  }

  const expected = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function sendToSlack(eventName, payload) {
  if (!slackWebhookUrl) {
    return;
  }

  const body = JSON.stringify({
    text: `GitHub event: ${eventName}\nRepository: ${payload.repository?.full_name || 'unknown'}\nAction: ${payload.action || 'event'}`
  });

  const request = http.request(
    new URL(slackWebhookUrl),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    },
    (response) => {
      response.resume();
    }
  );

  request.on('error', () => {});
  request.write(body);
  request.end();
}

function sendToTeams(eventName, payload) {
  if (!teamsWebhookUrl) {
    return;
  }

  const body = JSON.stringify({
    text: `GitHub event: ${eventName}\nRepository: ${payload.repository?.full_name || 'unknown'}\nAction: ${payload.action || 'event'}`
  });

  const request = http.request(
    new URL(teamsWebhookUrl),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    },
    (response) => {
      response.resume();
    }
  );

  request.on('error', () => {});
  request.write(body);
  request.end();
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/github-webhook') {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    const signature = req.headers['x-hub-signature-256'];

    if (!verifyGitHubSignature(body, signature)) {
      res.statusCode = 401;
      res.end('Invalid signature');
      return;
    }

    let payload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      res.statusCode = 400;
      res.end('Invalid JSON');
      return;
    }

    const eventName = req.headers['x-github-event'] || 'unknown';

    if (slackWebhookUrl) {
      sendToSlack(eventName, payload);
    }

    if (teamsWebhookUrl) {
      sendToTeams(eventName, payload);
    }

    res.statusCode = 200;
    res.end('OK');
  });
});

server.listen(port, () => {
  console.log(`gh-slack-teams-notifier listening on port ${port}`);
});
