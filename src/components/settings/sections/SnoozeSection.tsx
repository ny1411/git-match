import React from 'react';
import { Clock } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import SettingsToggle from '../SettingsToggle';
import type { DeepPartial, SnoozeDuration, UserSettings } from '../../../types/settings';
import { toDateTimeLocalValue } from '../../../utils/settings.utils';

interface SnoozeSectionProps {
  settings: UserSettings;
  onPatch: (patch: DeepPartial<UserSettings>) => void;
}

const SnoozeSection: React.FC<SnoozeSectionProps> = ({ settings, onPatch }) => {
  return (
    <SettingsSection id="snooze" title="Snooze Mode" icon={Clock}>
      <SettingsToggle
        label="Enable Snooze Mode"
        description="Temporarily hide your profile from new people"
        checked={settings.snoozeMode.enabled}
        onChange={(value) => onPatch({ snoozeMode: { enabled: value } })}
      />

      {settings.snoozeMode.enabled ? (
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-white/5 bg-black/30 p-4">
          <div>
            <label className="text-sm font-medium text-gray-300">Duration</label>
            <select
              value={settings.snoozeMode.duration}
              onChange={(event) =>
                onPatch({
                  snoozeMode: {
                    duration: event.target.value as SnoozeDuration,
                    customEndDate:
                      event.target.value === 'custom' ? settings.snoozeMode.customEndDate : null,
                  },
                })
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="24h">24 hours</option>
              <option value="72h">72 hours</option>
              <option value="1w">1 week</option>
              <option value="custom">Custom end time</option>
            </select>
          </div>

          {settings.snoozeMode.duration === 'custom' ? (
            <div>
              <label className="text-sm font-medium text-gray-300">Custom end date</label>
              <input
                type="datetime-local"
                value={toDateTimeLocalValue(settings.snoozeMode.customEndDate)}
                onChange={(event) =>
                  onPatch({
                    snoozeMode: {
                      customEndDate: event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null,
                    },
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          ) : null}

          <SettingsToggle
            label="Allow existing matches to message"
            checked={settings.snoozeMode.allowExistingMatchesToMessage}
            onChange={(value) =>
              onPatch({ snoozeMode: { allowExistingMatchesToMessage: value } })
            }
          />

          <SettingsToggle
            label="Hide from discovery"
            checked={settings.snoozeMode.hideFromDiscovery}
            onChange={(value) => onPatch({ snoozeMode: { hideFromDiscovery: value } })}
          />
        </div>
      ) : null}
    </SettingsSection>
  );
};

export default SnoozeSection;
