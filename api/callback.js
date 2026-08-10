// Vercel serverless function: handles GitHub OAuth callback
// Implements Decap CMS two-way handshake protocol
export default async function handler(req, res) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const REDIRECT_URI =
    process.env.REDIRECT_URI ||
    `https://${req.headers.host}/api/callback`;

  const { code } = req.query;

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<script>window.opener.postMessage({error:'Missing code'},'*');window.close();</script>`);
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

    // Two-way handshake protocol (required by Decap CMS)
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<p>Completing login...</p>
<script>
  (function() {
    function receiveMessage(e) {
      // Send token to opener using the origin from the handshake acknowledgment
      window.opener.postMessage(
        'authorization:github:success:${content}',
        e.origin
      );
      // Clean up
      window.removeEventListener('message', receiveMessage, false);
      setTimeout(function() { window.close(); }, 1000);
    }
    window.addEventListener('message', receiveMessage, false);
    // Initiate handshake with parent window (Decap CMS)
    window.opener.postMessage('authorizing:github', '*');
    // Timeout fallback: if no acknowledgment in 5s, try sending directly
    setTimeout(function() {
      window.opener.postMessage(
        'authorization:github:success:${content}',
        '*'
      );
      setTimeout(function() { window.close(); }, 2000);
    }, 5000);
  })();
</script>
</body>
</html>`);
  } catch (error) {
    const errorContent = JSON.stringify({ error: error.message });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<p>Login failed: ${error.message}</p>
<script>
  (function() {
    function receiveMessage(e) {
      window.opener.postMessage(
        'authorization:github:error:${errorContent}',
        e.origin
      );
      window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
    setTimeout(function() { window.close(); }, 8000);
  })();
</script>
</body>
</html>`);
  }
}
