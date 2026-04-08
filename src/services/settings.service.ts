import { authorizedRequest, type AuthTokenSources } from './api.service';
import type { DeepPartial, SettingsApiResponse, UserSettings } from '../types/settings';

export const getMySettings = async (auth: AuthTokenSources) =>
  authorizedRequest<SettingsApiResponse>('/api/settings/me', {
    method: 'GET',
    auth,
  });

export const updateMySettings = async (
  patch: DeepPartial<UserSettings>,
  auth: AuthTokenSources
) =>
  authorizedRequest<SettingsApiResponse>('/api/settings/me', {
    method: 'PUT',
    auth,
    body: JSON.stringify(patch),
  });
