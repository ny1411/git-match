import React from 'react';
import { AlertTriangle } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import SettingsToggle from '../SettingsToggle';
import type { DeepPartial, UserSettings } from '../../../types/settings';

interface SafetySectionProps {
  settings: UserSettings;
  onPatch: (patch: DeepPartial<UserSettings>) => void;
}

const SafetySection: React.FC<SafetySectionProps> = ({ settings, onPatch }) => {
  return (
    <SettingsSection id="safety" title="Safety" icon={AlertTriangle}>
      <SettingsToggle
        label="Screenshot Protection"
        description="Prevent users from screenshotting your photos (Android only)"
        checked={settings.safety.screenshotProtection}
        onChange={(value) => onPatch({ safety: { screenshotProtection: value } })}
      />

      <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-4">
        <p className="text-sm font-medium text-white">Blocked users</p>
        <p className="mt-1 text-sm text-gray-400">
          {settings.safety.blockedUserIds.length} account
          {settings.safety.blockedUserIds.length === 1 ? '' : 's'} currently blocked.
        </p>
      </div>
    </SettingsSection>
  );
};

export default SafetySection;
