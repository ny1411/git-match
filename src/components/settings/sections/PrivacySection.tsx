import React from 'react';
import { Shield } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import SettingsToggle from '../SettingsToggle';
import type { DeepPartial, ProfileVisibility, UserSettings } from '../../../types/settings';

interface PrivacySectionProps {
  settings: UserSettings;
  onPatch: (patch: DeepPartial<UserSettings>) => void;
}

const PrivacySection: React.FC<PrivacySectionProps> = ({ settings, onPatch }) => {
  return (
    <SettingsSection id="privacy" title="Privacy & Visibility" icon={Shield}>
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-300">Profile Visibility</label>
        <select
          value={settings.privacy.profileVisibility}
          onChange={(event) =>
            onPatch({
              privacy: {
                profileVisibility: event.target.value as ProfileVisibility,
              },
            })
          }
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white focus:border-purple-500 focus:outline-none"
        >
          <option value="everyone">Everyone</option>
          <option value="matches_only">Matches only</option>
        </select>
      </div>

      <SettingsToggle
        label="Show Online Status"
        checked={settings.privacy.showOnlineStatus}
        onChange={(value) => onPatch({ privacy: { showOnlineStatus: value } })}
      />
      <SettingsToggle
        label="Show Last Active"
        checked={settings.privacy.showLastActive}
        onChange={(value) => onPatch({ privacy: { showLastActive: value } })}
      />
    </SettingsSection>
  );
};

export default PrivacySection;
