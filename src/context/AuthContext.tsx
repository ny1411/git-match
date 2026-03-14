import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { auth } from '../config/firebase';
import { signInWithCustomToken } from 'firebase/auth';

// Define the shape of the context data
interface AuthContextType {
  userProfile: UserProfile | null;
  userGithubProfile: UserGithubProfile | null;
  isGithubProfileVerified: boolean | null;
  token: string | null;
  firebaseToken: string | null;
  isLoading: boolean;
  error: string | null;
  isProfileComplete: boolean;
  signup: (data: SignupData) => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  githubVerificationURL: (accessToken: string) => Promise<AuthResponse>;
  githubVerificationStatus: (accessToken: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  githubProfileUrl: string;
  role: string;
  geolocation: { city: string; country: string; lat: number; lng: number };
  aboutMe: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserGithubProfile {
  username: string | null;
  profileUrl: string | null;
  verifiedAt: Date | null;
}

interface SignupData {
  fullName: string;
  email: string;
  githubProfileUrl: string;
  password?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
  token?: string;
  firebaseToken?: string;
  authUrl?: string;
  isGithubVerified?: boolean;
  githubProfile?: UserGithubProfile;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGithubProfileVerified, setIsGithubProfileVerified] = useState(false);
  const [userGithubProfile, setUserGithubProfile] = useState<UserGithubProfile>({
    username: null,
    profileUrl: null,
    verifiedAt: null,
  });
  const [token, setToken] = useState<string | null>(null);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);

  const navigate = useNavigate();

  // Load token when app starts
  useEffect(() => {
    const firebaseToken = localStorage.getItem('firebaseToken');
    if (firebaseToken) {
      setFirebaseToken(firebaseToken);
    }
  }, []);

  const handleCheckProfileCompletion = async (idToken?: string) => {
    if (!idToken) return false;

    const response = await fetch('https://git-match-backend.onrender.com/api/profile/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${idToken}` }, // no Content-Type needed for GET
    });

    if (!response.ok) {
      console.error('Profile fetch failed:', response.status, await response.text());
      return false;
    }

    const result = await response.json();
    if (!result.success || !result.profile) return false;

    const p = result.profile;
    const locationOk = [
      p.location,
      p.city,
      p.country,
      p?.geolocation?.city,
      p?.geolocation?.country,
    ].some((v) => typeof v === 'string' && v.trim() !== '');

    const isComplete =
      ['fullName', 'githubProfileUrl', 'role', 'aboutMe'].every(
        (k) => typeof p[k] === 'string' && p[k].trim() !== ''
      ) && locationOk;

    setIsProfileComplete(isComplete);
    return isComplete;
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('https://git-match-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!result.success || !result.token) return result;

    const idToken = result.token; // use for backend APIs
    localStorage.setItem('accessToken', idToken);
    setToken(idToken);

    if (result.firebaseToken) {
      try {
        await signInWithCustomToken(auth, result.firebaseToken);
      } catch (e) {
        console.warn('Firebase custom-token sign-in failed:', e);
      }
    }

    const isComplete = await handleCheckProfileCompletion(idToken);
    navigate(isComplete ? '/dashboard' : '/onboarding');
    return { success: true, message: 'Login successful!' };
  };

  // Basic signup implementation: you might call an API then set the user
  const signup = async (data: SignupData): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call Express Backend Signup Endpoint
      const response = await fetch('https://git-match-backend.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (!result.success || !result.token) {
        setError(result.message);
        setIsLoading(true);
        return result;
      }

      if (result.success && result.token && result.firebaseToken) {
        await signInWithCustomToken(auth, result.firebaseToken);

        setToken(result.token);
        setFirebaseToken(result.firebaseToken);
        localStorage.setItem('firebaseToken', result.firebaseToken);

        setUserProfile(result.user || null); // Use the profile data returned by the backend
        setIsLoading(false);

        const githubVerificationResult = await githubVerificationURL(result.token);
        if (githubVerificationResult.success && githubVerificationResult.authUrl) {
          window.open(githubVerificationResult.authUrl, '_blank');
          return { success: true, message: 'Signup successful!' };
        }
      }
      return { success: false, message: 'Github verification failed.' };
    } catch (e: any) {
      const msg = e.message || 'Signup failed.';
      setError(msg);
      setIsLoading(false);
      return { success: false, message: msg };
    }
  };

  const githubVerificationURL = async (accessToken: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(
        'https://git-match-backend.onrender.com/api/github-verify/auth-url',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const result = await response.json();

      if (result.success) {
        setIsGithubProfileVerified(true);
        return {
          success: result.success,
          authUrl: result.authUrl,
          message: 'Github profile verified.',
        };
      }
      return { success: result.success, message: result.message };
    } catch (e: any) {
      setError(e?.message || 'Github verification failed.');
      return { success: false, message: e?.message };
    }
  };

  const githubVerificationStatus = async (accessToken: string | null): Promise<AuthResponse> => {
    try {
      const response = await fetch(
        'https://git-match-backend.onrender.com/api/github-verify/status',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const result = await response.json();

      if (result.success && result.isGithubVerified) {
        setIsGithubProfileVerified(true);
        setUserGithubProfile({
          username: result.githubProfile.username,
          profileUrl: result.githubProfile.profileUrl,
          verifiedAt: new Date(result.githubProfile.verifiedAt),
        });

        return {
          success: true,
          message: 'Github profile is verified.',
        };
      }
      return result;
    } catch (e: any) {
      setIsGithubProfileVerified(false);
      console.log('Github verification status check failed:', e);
      return { success: false, message: e?.message };
    }
  };

  // Logout implementation: clear the user
  const logout = async () => {
    setIsLoading(true);
    setUserProfile(null);
    setIsLoading(false);
  };

  const value: AuthContextType = {
    userProfile,
    userGithubProfile,
    isGithubProfileVerified,
    token,
    firebaseToken,
    isLoading,
    error,
    isProfileComplete,
    signup,
    login,
    githubVerificationURL,
    githubVerificationStatus,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
