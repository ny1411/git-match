import type { ApiGithubProfile, ApiUserProfile, UserGithubProfile, UserProfile } from '../types/auth';

export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
export const FIREBASE_TOKEN_STORAGE_KEY = 'firebaseToken';

const toDate = (value?: string | number | Date | null): Date => (value ? new Date(value) : new Date());

const hasText = (value?: string | null) => typeof value === 'string' && value.trim() !== '';

const hasValidDate = (value?: string | number | Date | null) => {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
};

export const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const evaluateProfileCompletion = (profile?: ApiUserProfile | null) => {
  if (!profile) {
    return false;
  }

  const locationOk = [
    profile.location,
    profile.city,
    profile.country,
    profile.geolocation?.city,
    profile.geolocation?.country,
  ].some(hasText);

  return (
    hasText(profile.fullName) &&
    hasText(profile.githubProfileUrl) &&
    hasValidDate(profile.dateOfBirth ?? profile.dob) &&
    hasText(profile.gender) &&
    hasText(profile.interest) &&
    hasText(profile.goal) &&
    locationOk
  );
};

export const normalizeUserProfile = (profile?: ApiUserProfile | null): UserProfile => ({
  uid: profile?.uid ?? '',
  fullName: profile?.fullName ?? '',
  email: profile?.email ?? '',
  githubProfileUrl: profile?.githubProfileUrl ?? '',
  role: profile?.role ?? '',
  geolocation: {
    city: profile?.geolocation?.city ?? profile?.city ?? '',
    country: profile?.geolocation?.country ?? profile?.country ?? '',
    lat: profile?.geolocation?.lat ?? 0,
    lng: profile?.geolocation?.lng ?? 0,
  },
  aboutMe: profile?.aboutMe ?? '',
  createdAt: toDate(profile?.createdAt),
  updatedAt: toDate(profile?.updatedAt),
});

export const normalizeGithubProfile = (profile?: ApiGithubProfile | null): UserGithubProfile => ({
  username: profile?.username ?? null,
  profileUrl: profile?.profileUrl ?? null,
  verifiedAt: profile?.verifiedAt ? new Date(profile.verifiedAt) : null,
});
