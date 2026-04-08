import React from 'react';
import { ChevronRight, UserCog } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import SettingsToggle from '../SettingsToggle';
import type { DeepPartial, UserSettings } from '../../../types/settings';

interface AccountSectionProps {
  settings: UserSettings;
  onPatch: (patch: DeepPartial<UserSettings>) => void;
}

const AccountSection: React.FC<AccountSectionProps> = ({ settings, onPatch }) => {
  return (
    <SettingsSection id="account" title="Account" icon={UserCog}>
      <SettingsToggle
        label="Deactivate Account"
        description="Temporarily disable your account while keeping your data."
        checked={settings.accountControls.deactivateAccount}
        onChange={(value) => onPatch({ accountControls: { deactivateAccount: value } })}
      />
      <SettingsToggle
        label="Request Account Deletion"
        description="Marks your account for the backend delete flow."
        checked={settings.accountControls.deleteAccountRequested}
        onChange={(value) => onPatch({ accountControls: { deleteAccountRequested: value } })}
      />

      <button className="mt-2 flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 text-left transition-colors hover:bg-white/10">
        <span className="text-sm font-medium text-white">Change Password</span>
        <ChevronRight size={16} className="text-gray-400" />
      </button>
    </SettingsSection>
  );
};

export default AccountSection;
