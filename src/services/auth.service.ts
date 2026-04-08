import type { AuthResponse, ApiUserProfile, SignupData } from '../types/auth';

const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL ?? '';

export interface ProfileLookupResponse {
  success: boolean;
  message?: string;
  profile?: ApiUserProfile | null;
}

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const fetchProfileLookup = async (accessToken: string): Promise<ProfileLookupResponse> => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/profile/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await parseJsonSafely<ProfileLookupResponse>(response);

  if (!response.ok) {
    throw new Error(result?.message || 'Failed to retrieve profile');
  }

  if (!result) {
    throw new Error('Invalid profile response from server');
  }

  return result;
};

export const loginRequest = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await parseJsonSafely<AuthResponse>(response);
  return result ?? { success: false, message: 'Login failed.' };
};

export const signupRequest = async (data: SignupData): Promise<AuthResponse> => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await parseJsonSafely<AuthResponse>(response);
  return result ?? { success: false, message: 'Signup failed.' };
};

export const githubVerificationUrlRequest = async (accessToken: string): Promise<AuthResponse> => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/github-verify/auth-url`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await parseJsonSafely<AuthResponse>(response);
  return result ?? { success: false, message: 'Github verification failed.' };
};

export const githubVerificationStatusRequest = async (
  accessToken: string | null
): Promise<AuthResponse> => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/github-verify/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await parseJsonSafely<AuthResponse>(response);
  return result ?? { success: false, message: 'Github verification status check failed.' };
};
