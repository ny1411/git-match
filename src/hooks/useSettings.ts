import { useCallback, useEffect, useRef, useState } from 'react';
import { getMySettings, updateMySettings } from '../services/settings.service';
import type { DeepPartial, UserSettings } from '../types/settings';
import { deepMergeSettings, normalizeSettings } from '../utils/settings.utils';

interface UseSettingsOptions {
  authLoading: boolean;
  firebaseToken: string | null;
}

const SAVE_SUCCESS_RESET_MS = 2000;
const SAVE_ERROR_RESET_MS = 3000;

export const useSettings = ({ authLoading, firebaseToken }: UseSettingsOptions) => {
  const [settings, setSettings] = useState<UserSettings>(normalizeSettings());
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const statusTimerRef = useRef<number | null>(null);

  const clearStatusTimer = useCallback(() => {
    if (statusTimerRef.current !== null) {
      window.clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearStatusTimer, [clearStatusTimer]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (authLoading) {
        return;
      }

      setSettingsLoading(true);
      setLoadError(null);

      try {
        const result = await getMySettings({ firebaseToken });
        setSettings(normalizeSettings(result.settings));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to retrieve settings';
        setLoadError(message);
      } finally {
        setSettingsLoading(false);
      }
    };

    void fetchSettings();
  }, [authLoading, firebaseToken]);

  const patchSettings = useCallback(
    async (patch: DeepPartial<UserSettings>) => {
      const previousSettings = settings;
      const nextSettings = deepMergeSettings(previousSettings, patch);

      clearStatusTimer();
      setSettings(nextSettings);
      setSaveStatus('Saving...');

      try {
        const result = await updateMySettings(patch, { firebaseToken });
        setSettings(normalizeSettings(result.settings));
        setSaveStatus('Saved');
        statusTimerRef.current = window.setTimeout(() => setSaveStatus(null), SAVE_SUCCESS_RESET_MS);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update settings';
        setSettings(previousSettings);
        setSaveStatus(message);
        statusTimerRef.current = window.setTimeout(() => setSaveStatus(null), SAVE_ERROR_RESET_MS);
      }
    },
    [clearStatusTimer, firebaseToken, settings]
  );

  return {
    settings,
    settingsLoading,
    saveStatus,
    loadError,
    patchSettings,
  };
};
