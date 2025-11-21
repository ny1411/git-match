import { Router } from 'express';
import admin from '../firebase/admin.js';
import { SignupRequest, LoginRequest, AuthResponse, UserProfile } from '../types/user.js';

const router = Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, githubProfileUrl, password }: SignupRequest = req.body;

    // Validate required fields
    if (!fullName || !email || !githubProfileUrl || !password) {
      const response: AuthResponse = {
        success: false,
        message: 'All fields are required: fullName, email, githubProfileUrl, password'
      };
      return res.status(400).json(response);
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });

    // Create initial user profile with default values
    const userProfile: UserProfile = {
      uid: userRecord.uid,
      fullName,
      email,
      githubProfileUrl,
      role: 'Software Developer', // Default role
      location: 'Unknown', // Default location
      aboutMe: 'Passionate developer looking to connect with like-minded tech enthusiasts!', // Default about me
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set(userProfile);

    // Create custom token for client-side authentication
    const token = await admin.auth().createCustomToken(userRecord.uid);

    const response: AuthResponse = {
      success: true,
      message: 'User created successfully',
      user: userProfile,
      token
    };

    res.status(201).json(response);

  } catch (error: any) {
    console.error('Signup error:', error);

    let message = 'Failed to create user';
    if (error.code === 'auth/email-already-exists') {
      message = 'Email already exists';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters';
    }

    const response: AuthResponse = {
      success: false,
      message
    };
    res.status(400).json(response);
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      const response: AuthResponse = {
        success: false,
        message: 'Email and password are required'
      };
      return res.status(400).json(response);
    }

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Create custom token (password verification happens on frontend with Firebase Client SDK)
    const token = await admin.auth().createCustomToken(userRecord.uid);

    // Get user profile from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      const response: AuthResponse = {
        success: false,
        message: 'User profile not found'
      };
      return res.status(404).json(response);
    }

    const userProfile = userDoc.data() as UserProfile;

    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
      user: userProfile,
      token
    };

    res.json(response);

  } catch (error: any) {
    console.error('Login error:', error);

    let message = 'Login failed';
    if (error.code === 'auth/user-not-found') {
      message = 'User not found';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    }

    const response: AuthResponse = {
      success: false,
      message
    };
    res.status(401).json(response);
  }
});

export default router;