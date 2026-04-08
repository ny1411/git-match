export type ConnectionType =
  | 'serious_relationship'
  | 'casual_dating'
  | 'friendship'
  | 'open_to_anything'
  | null;

export type SnoozeDuration = '24h' | '72h' | '1w' | 'custom';
export type ProfileVisibility = 'everyone' | 'matches_only';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserSettings {
  connectionPreferences: {
    connectionType: ConnectionType;
    showOnProfile: boolean;
  };
  snoozeMode: {
    enabled: boolean;
    duration: SnoozeDuration;
    customEndDate: string | null;
    allowExistingMatchesToMessage: boolean;
    hideFromDiscovery: boolean;
  };
  notifications: {
    newMessages: boolean;
    newMatches: boolean;
    likes: boolean;
    matchSuggestions: boolean;
    appAnnouncements: boolean;
    globalMute: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  discoveryFilters: {
    ageMin: number | null;
    ageMax: number | null;
    distanceKm: number | null;
    verifiedOnly: boolean;
    recentlyActiveOnly: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastActive: boolean;
    profileVisibility: ProfileVisibility;
  };
  accountControls: {
    deactivateAccount: boolean;
    deleteAccountRequested: boolean;
  };
  safety: {
    blockedUserIds: string[];
    screenshotProtection: boolean;
  };
  preferences: {
    language: string;
    theme: ThemePreference;
  };
  createdAt: string;
  updatedAt: string;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export interface SettingsApiResponse {
  success?: boolean;
  message?: string;
  settings?: DeepPartial<UserSettings>;
}
