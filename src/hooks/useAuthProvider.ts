import { onIdTokenChanged, signInWithCustomToken, signOut } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import {
  fetchProfileLookup,
  githubVerificationStatusRequest,
  githubVerificationUrlRequest,
  loginRequest,
  signupRequest,
} from '../services/auth.service';
import type { AuthContextType, AuthResponse, SignupData, UserGithubProfile, UserProfile } from '../types/auth';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  evaluateProfileCompletion,
  FIREBASE_TOKEN_STORAGE_KEY,
  getErrorMessage,
  normalizeGithubProfile,
  normalizeUserProfile,
} from '../utils/auth.utils';

export const useAuthProvider = (): AuthContextType => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGithubProfileVerified, setIsGithubProfileVerified] = useState(false);
  const [userGithubProfile, setUserGithubProfile] = useState<UserGithubProfile>({
    username: null,
    profileUrl: null,
    verifiedAt: null,
  });
  const [token, setToken] = useState<string | null>(null);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const navigate = useNavigate();

  const persistFirebaseToken = useCallback((nextToken: string | null) => {
    setFirebaseToken(nextToken);

    if (nextToken) {
      localStorage.setItem(FIREBASE_TOKEN_STORAGE_KEY, nextToken);
      return;
    }

    localStorage.removeItem(FIREBASE_TOKEN_STORAGE_KEY);
  }, []);

  const persistAccessToken = useCallback((nextToken: string | null) => {
    setToken(nextToken);

    if (nextToken) {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, nextToken);
      return;
    }

    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }, []);

  const resetAuthState = useCallback(() => {
    persistAccessToken(null);
    persistFirebaseToken(null);
    setUserProfile(null);
    setIsProfileComplete(false);
    setIsAuthenticated(false);
    setIsGithubProfileVerified(false);
    setUserGithubProfile(normalizeGithubProfile());
  }, [persistAccessToken, persistFirebaseToken]);

  const signInToFirebase = useCallback(
    async (customToken?: string | null) => {
      if (!customToken) {
        persistFirebaseToken(null);
        return null;
      }

      try {
        const credential = await signInWithCustomToken(auth, customToken);
        const nextFirebaseIdToken = await credential.user.getIdToken();
        persistFirebaseToken(nextFirebaseIdToken);
        return nextFirebaseIdToken;
      } catch (error: unknown) {
        console.warn('Firebase custom-token sign-in failed:', error);
        persistFirebaseToken(null);
        return null;
      }
    },
    [persistFirebaseToken]
  );

  const syncProfileCompletion = useCallback(
    async (idToken?: string): Promise<boolean | null> => {
      if (!idToken) {
        resetAuthState();
        return null;
      }

      try {
        const result = await fetchProfileLookup(idToken);
        if (!result.success || !result.profile) {
          resetAuthState();
          return null;
        }

        const profile = result.profile;
        setIsAuthenticated(true);
        setUserProfile(normalizeUserProfile(profile));

        const complete = evaluateProfileCompletion(profile);
        setIsProfileComplete(complete);
        return complete;
      } catch (error) {
        console.error('Profile fetch failed:', error);
        resetAuthState();
        return null;
      }
    },
    [resetAuthState]
  );

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        persistFirebaseToken(null);
        return;
      }

      try {
        const nextFirebaseIdToken = await user.getIdToken();
        persistFirebaseToken(nextFirebaseIdToken);
      } catch (error: unknown) {
        console.warn('Failed to refresh Firebase ID token:', error);
      }
    });

    return unsubscribe;
  }, [persistFirebaseToken]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      const storedFirebaseToken = localStorage.getItem(FIREBASE_TOKEN_STORAGE_KEY);

      if (storedAccessToken) {
        persistAccessToken(storedAccessToken);
      }

      if (storedFirebaseToken) {
        setFirebaseToken(storedFirebaseToken);
      }

      if (!storedAccessToken) {
        resetAuthState();
        setIsLoading(false);
        return;
      }

      try {
        await syncProfileCompletion(storedAccessToken);
      } catch (error: unknown) {
        console.error('Failed to restore auth session:', error);
        resetAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrapAuth();
  }, [persistAccessToken, resetAuthState, syncProfileCompletion]);

  const githubVerificationURL = useCallback(
    async (accessToken: string): Promise<AuthResponse> => {
      try {
        const result = await githubVerificationUrlRequest(accessToken);
        if (result.success) {
          setIsGithubProfileVerified(true);
          return {
            success: true,
            authUrl: result.authUrl,
            message: 'Github profile verified.',
          };
        }

        return { success: false, message: result.message };
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Github verification failed.');
        setError(message);
        return { success: false, message };
      }
    },
    []
  );

  const githubVerificationStatus = useCallback(async (accessToken: string | null): Promise<AuthResponse> => {
    try {
      const result = await githubVerificationStatusRequest(accessToken);

      if (result.success && result.isGithubVerified) {
        setIsGithubProfileVerified(true);
        setUserGithubProfile(normalizeGithubProfile(result.githubProfile));
        return {
          success: true,
          message: 'Github profile is verified.',
        };
      }

      return result;
    } catch (error: unknown) {
      setIsGithubProfileVerified(false);
      const message = getErrorMessage(error, 'Github verification status check failed.');
      console.log('Github verification status check failed:', error);
      return { success: false, message };
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await loginRequest(email, password);
        if (!result.success || !result.token) {
          setError(result.message);
          return result;
        }

        const accessToken = result.token;
        persistAccessToken(accessToken);
        setIsAuthenticated(true);

        if (result.firebaseToken) {
          await signInToFirebase(result.firebaseToken);
        } else {
          persistFirebaseToken(null);
        }

        if (result.user) {
          setUserProfile(normalizeUserProfile(result.user));
        }

        const isComplete = await syncProfileCompletion(accessToken);
        if (isComplete === null) {
          return {
            success: false,
            message: 'Login succeeded, but your profile could not be loaded. Please try again.',
          };
        }

        navigate(isComplete ? '/dashboard' : '/onboarding');
        return { success: true, message: 'Login successful!' };
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Login failed.');
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, persistAccessToken, persistFirebaseToken, signInToFirebase, syncProfileCompletion]
  );

  const signup = useCallback(
    async (data: SignupData): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await signupRequest(data);

        if (!result.success || !result.token) {
          setError(result.message);
          return result;
        }

        if (result.success && result.token && result.firebaseToken) {
          await signInToFirebase(result.firebaseToken);
          persistAccessToken(result.token);
          setIsAuthenticated(true);
          setIsProfileComplete(false);
          setUserProfile(result.user ? normalizeUserProfile(result.user) : null);

          const githubVerificationResult = await githubVerificationURL(result.token);
          if (githubVerificationResult.success && githubVerificationResult.authUrl) {
            window.open(githubVerificationResult.authUrl, '_blank');
            return { success: true, message: 'Signup successful!' };
          }
        }

        return { success: false, message: 'Github verification failed.' };
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Signup failed.');
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [githubVerificationURL, persistAccessToken, signInToFirebase]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.warn('Firebase sign-out failed:', error);
    } finally {
      resetAuthState();
      setIsLoading(false);
    }
  }, [resetAuthState]);

  const markProfileComplete = useCallback(() => {
    setIsProfileComplete(true);
  }, []);

  return {
    userProfile,
    userGithubProfile,
    isGithubProfileVerified,
    token,
    firebaseToken,
    isAuthenticated,
    isLoading,
    error,
    isProfileComplete,
    signup,
    login,
    githubVerificationURL,
    githubVerificationStatus,
    markProfileComplete,
    logout,
  };
};
