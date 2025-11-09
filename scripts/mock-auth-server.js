// Simple mock auth server exposing /users/login and /users/userdetails
// Sets a `jsession` cookie on successful login so clients can fetch user details.
const http = require('http');
const crypto = require('crypto');
const port = process.env.PORT || 4000;

const sessions = new Map(); // sessionId -> user

function setCorsHeaders(res) {
  // Allow the Next dev/prod server at localhost:3001 to interact with this mock
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/users/login') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      setCorsHeaders(res);
      try {
        const json = JSON.parse(body);
        const { email, password } = json || {};
        // Accept one test credential for demonstration
        if (email === 'user@example.com' && password === 'password') {
          const sessionId = crypto.randomBytes(16).toString('hex');
          sessions.set(sessionId, { email });
          // Set cookie (HttpOnly for realism)
          const cookie = `jsession=${sessionId}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`;
          res.setHeader('Set-Cookie', cookie);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'ok', user: { email } }));
        } else {
          res.writeHead(401, { 'Content-Type': 'text/plain' });
          res.end('Invalid credentials');
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad JSON');
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/users/userdetails') {
    setCorsHeaders(res);
    const cookieHeader = req.headers['cookie'] || '';
    const match = cookieHeader.match(/jsession=([0-9a-f]+)/);
    if (!match) {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('Not authenticated');
      return;
    }
    const sessionId = match[1];
    const user = sessions.get(sessionId);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('Invalid session');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user, meta: { sessionId } }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(port, () => console.log(`Mock auth server listening on http://localhost:${port}`));
