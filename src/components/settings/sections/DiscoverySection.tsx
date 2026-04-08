import React from 'react';
import { Compass } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import SettingsToggle from '../SettingsToggle';
import type { DeepPartial, UserSettings } from '../../../types/settings';
import { parseNullableNumber } from '../../../utils/settings.utils';

interface DiscoverySectionProps {
  settings: UserSettings;
  onPatch: (patch: DeepPartial<UserSettings>) => void;
}

const DiscoverySection: React.FC<DiscoverySectionProps> = ({ settings, onPatch }) => {
  return (
    <SettingsSection id="discovery" title="Discovery Filters" icon={Compass}>
      <div className="mb-6">
        <div className="mb-2 flex justify-between">
          <label className="text-sm font-medium text-white">Maximum Distance</label>
          <span className="text-sm font-bold text-purple-400">
            {settings.discoveryFilters.distanceKm === null
              ? 'Any distance'
              : `${settings.discoveryFilters.distanceKm} km`}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={settings.discoveryFilters.distanceKm ?? 100}
          onChange={(event) =>
            onPatch({
              discoveryFilters: { distanceKm: Number(event.target.value) },
            })
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-purple-500"
        />
        <button
          type="button"
          onClick={() => onPatch({ discoveryFilters: { distanceKm: null } })}
          className="mt-3 text-sm font-medium text-purple-300 transition-colors hover:text-purple-200"
        >
          Remove distance limit
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-300">Min Age</label>
          <input
            type="number"
            min="18"
            max={settings.discoveryFilters.ageMax ?? 100}
            value={settings.discoveryFilters.ageMin ?? ''}
            placeholder="Any"
            onChange={(event) =>
              onPatch({
                discoveryFilters: {
                  ageMin: parseNullableNumber(event.target.value),
                },
              })
            }
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-300">Max Age</label>
          <input
            type="number"
            min={settings.discoveryFilters.ageMin ?? 18}
            max="100"
            value={settings.discoveryFilters.ageMax ?? ''}
            placeholder="Any"
            onChange={(event) =>
              onPatch({
                discoveryFilters: {
                  ageMax: parseNullableNumber(event.target.value),
                },
              })
            }
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white"
          />
        </div>
      </div>

      <SettingsToggle
        label="Verified profiles only"
        checked={settings.discoveryFilters.verifiedOnly}
        onChange={(value) => onPatch({ discoveryFilters: { verifiedOnly: value } })}
      />
      <SettingsToggle
        label="Recently active users"
        checked={settings.discoveryFilters.recentlyActiveOnly}
        onChange={(value) => onPatch({ discoveryFilters: { recentlyActiveOnly: value } })}
      />
    </SettingsSection>
  );
};

export default DiscoverySection;
