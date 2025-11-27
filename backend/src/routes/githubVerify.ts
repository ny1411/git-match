import { Router } from 'express';
import admin from '../firebase/admin.js';
import axios from 'axios';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router = Router();

// Middleware to verify Firebase ID token
const verifyToken = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Endpoint to start GitHub OAuth flow
router.get('/auth-url', verifyToken, (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({
      success: false,
      message: 'GitHub OAuth not configured on server'
    });
  }

  const redirectUri = `${process.env.BASE_URL || 'http://localhost:3000'}/api/github-verify/callback`;
  const scope = 'read:user';
  const state = req.user.uid; // Use user ID as state for security

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

  res.json({
    success: true,
    authUrl,
    message: 'Use this URL to authenticate with GitHub'
  });
});

// OAuth callback endpoint - GitHub will redirect here
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state as string;

    if (!code || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing authorization code or state'
      });
    }

    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'GitHub OAuth not configured on server'
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get access token from GitHub'
      });
    }

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const githubUser = userResponse.data;
    const githubProfileUrl = githubUser.html_url;

    // Get the user's stored GitHub profile URL
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const storedGithubUrl = userData?.githubProfileUrl;

    // Verify that the GitHub profile matches
    if (githubProfileUrl !== storedGithubUrl) {
      return res.status(400).json({
        success: false,
        message: `GitHub profile mismatch. Expected: ${storedGithubUrl}, Got: ${githubProfileUrl}`
      });
    }

    // Update user profile with verification status
    await admin.firestore().collection('users').doc(userId).update({
      isGithubVerified: true,
      githubUsername: githubUser.login,
      githubId: githubUser.id,
      githubVerifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Success page (in production, redirect to your frontend)
    res.send(`
      <html>
        <body>
          <h1>GitHub Verification Successful! ✅</h1>
          <p>Your GitHub account (${githubProfileUrl}) has been verified successfully.</p>
          <p>You can close this window and return to the app.</p>
          <script>
            // Optional: Send message to opener window and close
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_VERIFICATION_SUCCESS' }, '*');
              }
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('GitHub verification error:', error);
    
    res.send(`
      <html>
        <body>
          <h1>GitHub Verification Failed ❌</h1>
          <p>There was an error verifying your GitHub account. Please try again.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  }
});

// Endpoint to check GitHub verification status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const isVerified = userData?.isGithubVerified || false;

    res.json({
      success: true,
      isGithubVerified: isVerified,
      githubProfileUrl: userData?.githubProfileUrl,
      githubUsername: userData?.githubUsername,
      githubVerifiedAt: userData?.githubVerifiedAt
    });

  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check verification status'
    });
  }
});

// Endpoint to manually trigger verification (for testing)
router.post('/verify-manual', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { githubToken } = req.body;

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: 'GitHub token is required'
      });
    }

    // Get user info from GitHub using provided token
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const githubUser = userResponse.data;
    const githubProfileUrl = githubUser.html_url;

    // Get the user's stored GitHub profile URL
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const storedGithubUrl = userData?.githubProfileUrl;

    // Verify that the GitHub profile matches
    if (githubProfileUrl !== storedGithubUrl) {
      return res.status(400).json({
        success: false,
        message: `GitHub profile mismatch. Expected: ${storedGithubUrl}, Got: ${githubProfileUrl}`
      });
    }

    // Update user profile with verification status
    await admin.firestore().collection('users').doc(userId).update({
      isGithubVerified: true,
      githubUsername: githubUser.login,
      githubId: githubUser.id,
      githubVerifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'GitHub account verified successfully',
      githubProfileUrl,
      githubUsername: githubUser.login
    });

  } catch (error) {
    console.error('Manual GitHub verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to verify GitHub account'
    });
  }
});

export default router;