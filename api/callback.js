// Vercel serverless function: handles GitHub OAuth callback
// Exchanges code for token, sends to Decap CMS via postMessage
export default async function handler(req, res) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const REDIRECT_URI =
    process.env.REDIRECT_URI ||
    `https://${req.headers.host}/api/callback`;

  const { code } = req.query;

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      `<script>window.opener.postMessage({error:'Missing code'},'*');window.close();</script>`
    );
    return;
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      }
    );

    const data = await tokenResponse.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    const accessToken = data.access_token;
    const content = JSON.stringify({
      token: accessToken,
      provider: 'github',
    });
    const message = JSON.stringify(
      `authorization:github:success:${content}`
    );

    // Send token to Decap CMS immediately (no handshake needed)
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<p>Completing login...</p>
<script>
  (function() {
    // Send token immediately to opener window
    window.opener.postMessage(${message}, '*');
    // Also try the handshake method as fallback
    window.opener.postMessage('authorizing:github', '*');
    // Retry sending after a short delay
    setTimeout(function() {
      window.opener.postMessage(${message}, '*');
    }, 500);
    // Close popup after 3 seconds
    setTimeout(function() { window.close(); }, 3000);
  })();
</script>
</body>
</html>`);
  } catch (error) {
    const content = JSON.stringify({ error: error.message });
    const message = JSON.stringify(
      `authorization:github:error:${content}`
    );

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<p>Login failed: ${error.message}</p>
<script>
  (function() {
    window.opener.postMessage(${message}, '*');
    setTimeout(function() { window.close(); }, 5000);
  })();
</script>
</body>
</html>`);
  }
}
