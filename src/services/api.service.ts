import { auth } from '../config/firebase';

const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL ?? '';

export interface AuthTokenSources {
  token?: string | null;
  firebaseToken?: string | null;
}

interface ApiResponseEnvelope {
  success?: boolean;
  message?: string;
}

interface AuthorizedRequestOptions extends Omit<RequestInit, 'headers'> {
  auth?: AuthTokenSources;
  headers?: HeadersInit;
}

const AUTH_TOKEN_STORAGE_KEYS = ['accessToken', 'firebaseToken'] as const;

const resolveApiUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${BACKEND_BASE_URL}${path}`;
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const getAuthToken = async (sources: AuthTokenSources = {}): Promise<string | null> => {
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.warn('Failed to read Firebase ID token, falling back to stored auth token.', error);
    }
  }

  return (
    sources.token ??
    sources.firebaseToken ??
    AUTH_TOKEN_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) ??
    null
  );
};

export const authorizedRequest = async <TResponse extends ApiResponseEnvelope>(
  path: string,
  options: AuthorizedRequestOptions = {}
): Promise<TResponse> => {
  const { auth: authSources, headers, body, ...requestInit } = options;
  const authToken = await getAuthToken(authSources);

  if (!authToken) {
    throw new Error('Please log in again to continue.');
  }

  const requestHeaders = new Headers(headers);
  requestHeaders.set('Authorization', `Bearer ${authToken}`);

  if (body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(resolveApiUrl(path), {
    ...requestInit,
    body,
    headers: requestHeaders,
  });

  const result = await parseJsonSafely<TResponse>(response);

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || `Request failed with status ${response.status}`);
  }

  if (result) {
    return result;
  }

  return { success: true } as TResponse;
};
