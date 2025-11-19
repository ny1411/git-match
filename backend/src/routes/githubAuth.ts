import { Router } from 'express';
import { GitHubOAuth, GitHubUser } from '../utils/githubOAuth';
import admin from '../firebase/admin';

const router = Router();

// Start GitHub OAuth flow
router.get('/login', (req, res) => {
  const authUrl = GitHubOAuth.getAuthorizationUrl();
  res.json({ authUrl });
});

// Handle GitHub OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange code for access token
    const accessToken = await GitHubOAuth.getAccessToken(code);
    
    // Get user info from GitHub
    const githubUser = await GitHubOAuth.getUserInfo(accessToken);
    const email = await GitHubOAuth.getUserEmail(accessToken);

    // Create or update user in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByProviderUid('github.com', githubUser.id.toString());
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        firebaseUser = await admin.auth().createUser({
            uid: `github:${githubUser.id}`,
            email: email,
            displayName: githubUser.name || githubUser.login,
            photoURL: githubUser.avatar_url
          });
      } else {
        throw error;
      }
    }

    // Create custom token for client-side authentication
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid, {
      email: email,
      displayName: githubUser.name || githubUser.login,
      photoURL: githubUser.avatar_url,
      githubUID: githubUser.id.toString(),
      githubAccessToken: accessToken // Be careful with this in production!
    });

    // For development, redirect to a simple page with the token
    // In production, you'd redirect to your frontend app
    res.send(`
      <html>
        <body>
          <h1>Authentication Successful!</h1>
          <p>Copy this token to your frontend:</p>
          <textarea id="token" rows="4" cols="50">${customToken}</textarea>
          <button onclick="navigator.clipboard.writeText(document.getElementById('token').value)">
            Copy Token
          </button>
          <script>
            // Auto-copy for convenience
            navigator.clipboard.writeText("${customToken}");
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;