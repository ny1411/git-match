import React from 'react';
import { Bell } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import SettingsToggle from '../SettingsToggle';
import type { DeepPartial, UserSettings } from '../../../types/settings';

interface NotificationsSectionProps {
  settings: UserSettings;
  onPatch: (patch: DeepPartial<UserSettings>) => void;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({ settings, onPatch }) => {
  return (
    <SettingsSection id="notifications" title="Notifications" icon={Bell}>
      <SettingsToggle
        label="Global Mute"
        description="Pause all push notifications"
        checked={settings.notifications.globalMute}
        onChange={(value) => onPatch({ notifications: { globalMute: value } })}
      />

      <div
        className={`transition-opacity ${
          settings.notifications.globalMute ? 'pointer-events-none opacity-50' : 'opacity-100'
        }`}
      >
        <SettingsToggle
          label="New Messages"
          checked={settings.notifications.newMessages}
          onChange={(value) => onPatch({ notifications: { newMessages: value } })}
        />
        <SettingsToggle
          label="New Matches"
          checked={settings.notifications.newMatches}
          onChange={(value) => onPatch({ notifications: { newMatches: value } })}
        />
        <SettingsToggle
          label="Likes"
          checked={settings.notifications.likes}
          onChange={(value) => onPatch({ notifications: { likes: value } })}
        />
        <SettingsToggle
          label="Match Suggestions"
          checked={settings.notifications.matchSuggestions}
          onChange={(value) => onPatch({ notifications: { matchSuggestions: value } })}
        />
        <SettingsToggle
          label="App Announcements"
          checked={settings.notifications.appAnnouncements}
          onChange={(value) => onPatch({ notifications: { appAnnouncements: value } })}
        />
        <SettingsToggle
          label="Quiet Hours"
          description="Mute notifications during specific hours"
          checked={settings.notifications.quietHours.enabled}
          onChange={(value) => onPatch({ notifications: { quietHours: { enabled: value } } })}
        />

        {settings.notifications.quietHours.enabled ? (
          <div className="mt-2 grid gap-4 rounded-xl border border-white/5 bg-black/30 p-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-300">Start time</label>
              <input
                type="time"
                value={settings.notifications.quietHours.start}
                onChange={(event) =>
                  onPatch({
                    notifications: {
                      quietHours: { start: event.target.value },
                    },
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">End time</label>
              <input
                type="time"
                value={settings.notifications.quietHours.end}
                onChange={(event) =>
                  onPatch({
                    notifications: {
                      quietHours: { end: event.target.value },
                    },
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        ) : null}
      </div>
    </SettingsSection>
  );
};

export default NotificationsSection;
