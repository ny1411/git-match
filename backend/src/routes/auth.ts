import { Router } from 'express';
import admin from '../firebase/admin';

const router = Router();

// Generate custom token for GitHub OAuth flow
router.post('/github/custom-token', async (req, res) => {
  try {
    const { githubUID, email, displayName, photoURL } = req.body;

    if (!githubUID) {
      return res.status(400).json({ error: 'GitHub UID is required' });
    }

    // Create a custom token using GitHub UID
    const customToken = await admin.auth().createCustomToken(githubUID.toString(), {
      email,
      displayName,
      photoURL,
      githubUID: githubUID.toString()
    });

    res.json({ customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).json({ error: 'Failed to create authentication token' });
  }
});

// Verify Firebase ID token
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({ 
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      githubUID: decodedToken.githubUID
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
});

export default router;