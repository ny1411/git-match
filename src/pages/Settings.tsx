import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SettingsOverviewCard from '../components/settings/SettingsOverviewCard';
import SettingsSidebar from '../components/settings/SettingsSidebar';
import AccountSection from '../components/settings/sections/AccountSection';
import ConnectionSection from '../components/settings/sections/ConnectionSection';
import DiscoverySection from '../components/settings/sections/DiscoverySection';
import NotificationsSection from '../components/settings/sections/NotificationsSection';
import PreferencesSection from '../components/settings/sections/PreferencesSection';
import PrivacySection from '../components/settings/sections/PrivacySection';
import SafetySection from '../components/settings/sections/SafetySection';
import SnoozeSection from '../components/settings/sections/SnoozeSection';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { formatUpdatedAt } from '../utils/settings.utils';

const Settings: React.FC = () => {
  const { firebaseToken, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { settings, settingsLoading, saveStatus, loadError, patchSettings } = useSettings({
    authLoading,
    firebaseToken,
  });

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-gray-200">
        Loading settings...
      </div>
    );
  }

  const updatedAtLabel = formatUpdatedAt(settings.updatedAt);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0f] font-['Inter',sans-serif] text-gray-200">
      {saveStatus ? (
        <div className="fixed top-4 right-4 z-50 animate-pulse rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all">
          {saveStatus}
        </div>
      ) : null}

      <SettingsSidebar
        onBack={() => {
          navigate('/dashboard');
        }}
        onSelectSection={scrollToSection}
      />

      <main className="custom-scrollbar flex-1 overflow-y-auto scroll-smooth p-4 md:p-8">
        <div className="mx-auto max-w-3xl pb-24">
          <SettingsOverviewCard updatedAtLabel={updatedAtLabel} loadError={loadError} />

          <ConnectionSection settings={settings} onPatch={(patch) => void patchSettings(patch)} />
          <SnoozeSection settings={settings} onPatch={(patch) => void patchSettings(patch)} />
          <NotificationsSection settings={settings} onPatch={(patch) => void patchSettings(patch)} />
          <DiscoverySection settings={settings} onPatch={(patch) => void patchSettings(patch)} />
          <PrivacySection settings={settings} onPatch={(patch) => void patchSettings(patch)} />
          <AccountSection settings={settings} onPatch={(patch) => void patchSettings(patch)} />
          <SafetySection settings={settings} onPatch={(patch) => void patchSettings(patch)} />
          <PreferencesSection settings={settings} onPatch={(patch) => void patchSettings(patch)} />

          <div className="mt-12">
            <button
              onClick={() => void logout()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut size={20} />
              <span className="font-bold">Log Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
