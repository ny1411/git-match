import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import type { DeepPartial, UserSettings } from '../../../types/settings';
import { THEME_PREFERENCES } from '../../../utils/settings.utils';

interface PreferencesSectionProps {
  settings: UserSettings;
  onPatch: (patch: DeepPartial<UserSettings>) => void;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({ settings, onPatch }) => {
  return (
    <SettingsSection id="preferences" title="App Preferences" icon={SettingsIcon}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300">Language</label>
          <select
            value={settings.preferences.language}
            onChange={(event) => onPatch({ preferences: { language: event.target.value } })}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white focus:border-purple-500"
          >
            <option value="en">English</option>
            <option value="es">Espanol</option>
            <option value="fr">Francais</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300">Theme</label>
          <div className="mt-2 flex gap-3">
            {THEME_PREFERENCES.map((theme) => (
              <button
                key={theme}
                onClick={() => onPatch({ preferences: { theme } })}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  settings.preferences.theme === theme
                    ? 'border-purple-500 bg-purple-600/30 text-purple-200'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};

export default PreferencesSection;
