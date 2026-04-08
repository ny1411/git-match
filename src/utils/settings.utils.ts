import {
  AlertTriangle,
  Bell,
  Clock,
  Compass,
  Heart,
  Settings as SettingsIcon,
  Shield,
  UserCog,
} from 'lucide-react';
import type { DeepPartial, ThemePreference, UserSettings } from '../types/settings';

export const DEFAULT_SETTINGS: UserSettings = {
  connectionPreferences: {
    connectionType: null,
    showOnProfile: false,
  },
  snoozeMode: {
    enabled: false,
    duration: '24h',
    customEndDate: null,
    allowExistingMatchesToMessage: false,
    hideFromDiscovery: false,
  },
  notifications: {
    newMessages: false,
    newMatches: false,
    likes: false,
    matchSuggestions: false,
    appAnnouncements: false,
    globalMute: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
  },
  discoveryFilters: {
    ageMin: null,
    ageMax: null,
    distanceKm: null,
    verifiedOnly: false,
    recentlyActiveOnly: false,
  },
  privacy: {
    showOnlineStatus: false,
    showLastActive: false,
    profileVisibility: 'everyone',
  },
  accountControls: {
    deactivateAccount: false,
    deleteAccountRequested: false,
  },
  safety: {
    blockedUserIds: [],
    screenshotProtection: false,
  },
  preferences: {
    language: 'en',
    theme: 'system',
  },
  createdAt: '',
  updatedAt: '',
};

export const THEME_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system'];

export const SETTINGS_SIDEBAR_LINKS = [
  { id: 'connection', label: 'Connection', icon: Heart },
  { id: 'snooze', label: 'Snooze Mode', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'discovery', label: 'Discovery', icon: Compass },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'account', label: 'Account', icon: UserCog },
  { id: 'safety', label: 'Safety', icon: AlertTriangle },
  { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
];

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const deepMergeSettings = <T extends object>(target: T, patch: DeepPartial<T>): T => {
  const merged = { ...target };

  for (const [key, value] of Object.entries(patch as object)) {
    if (value === undefined) {
      continue;
    }

    const typedKey = key as keyof T;
    const currentValue = merged[typedKey];

    if (isPlainObject(currentValue) && isPlainObject(value)) {
      merged[typedKey] = deepMergeSettings(
        currentValue as Record<string, unknown>,
        value as DeepPartial<Record<string, unknown>>
      ) as T[keyof T];
      continue;
    }

    merged[typedKey] = (Array.isArray(value) ? [...value] : value) as T[keyof T];
  }

  return merged;
};

export const normalizeSettings = (incoming?: DeepPartial<UserSettings> | null): UserSettings =>
  deepMergeSettings(DEFAULT_SETTINGS, incoming ?? {});

export const parseNullableNumber = (value: string): number | null => {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const toDateTimeLocalValue = (isoDate: string | null): string => {
  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export const formatUpdatedAt = (updatedAt: string): string | null => {
  if (!updatedAt) {
    return null;
  }

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
