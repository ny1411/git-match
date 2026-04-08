import React from 'react';
import { Heart } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import SettingsToggle from '../SettingsToggle';
import type { DeepPartial, UserSettings } from '../../../types/settings';

interface ConnectionSectionProps {
  settings: UserSettings;
  onPatch: (patch: DeepPartial<UserSettings>) => void;
}

const ConnectionSection: React.FC<ConnectionSectionProps> = ({ settings, onPatch }) => {
  return (
    <SettingsSection id="connection" title="Connection Preferences" icon={Heart}>
      <div className="mb-4 flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">Looking for</label>
        <select
          value={settings.connectionPreferences.connectionType ?? ''}
          onChange={(event) =>
            onPatch({
              connectionPreferences: {
                connectionType: (event.target.value ||
                  null) as UserSettings['connectionPreferences']['connectionType'],
              },
            })
          }
          className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white focus:border-purple-500 focus:outline-none"
        >
          <option value="">Prefer not to say</option>
          <option value="serious_relationship">Serious relationship</option>
          <option value="casual_dating">Casual dating</option>
          <option value="friendship">Friendship</option>
          <option value="open_to_anything">Open to anything</option>
        </select>
      </div>

      <SettingsToggle
        label="Show on profile"
        description="Let others know what you're looking for"
        checked={settings.connectionPreferences.showOnProfile}
        onChange={(value) => onPatch({ connectionPreferences: { showOnProfile: value } })}
      />
    </SettingsSection>
  );
};

export default ConnectionSection;
