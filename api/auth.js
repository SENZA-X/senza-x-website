// Vercel serverless function: redirects to GitHub OAuth authorization page
export default function handler(req, res) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const REDIRECT_URI =
    process.env.REDIRECT_URI ||
    `https://${req.headers.host}/api/callback`;

  if (!CLIENT_ID) {
    res.status(500).send('GITHUB_CLIENT_ID environment variable is not set');
    return;
  }

  const authURL =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=repo,user&state=${Math.random().toString(36).slice(2)}`;

  res.writeHead(302, { Location: authURL });
  res.end();
}
