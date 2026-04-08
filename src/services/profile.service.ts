import { authorizedRequest, type AuthTokenSources } from './api.service';
import type { ProfileResponse } from '../types/profile-form';

export const getMyProfile = async (
  auth: AuthTokenSources,
  signal?: AbortSignal
): Promise<ProfileResponse> =>
  authorizedRequest<ProfileResponse>('/api/profile/me', {
    method: 'GET',
    auth,
    signal,
  });

export const updateMyProfile = async (
  payload: Record<string, unknown>,
  auth: AuthTokenSources
): Promise<ProfileResponse> =>
  authorizedRequest<ProfileResponse>('/api/profile/me', {
    method: 'PUT',
    auth,
    body: JSON.stringify(payload),
  });
