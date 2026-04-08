import React from 'react';

interface SettingsOverviewCardProps {
  updatedAtLabel: string | null;
  loadError: string | null;
}

const SettingsOverviewCard: React.FC<SettingsOverviewCardProps> = ({ updatedAtLabel, loadError }) => {
  return (
    <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Your account settings</h2>
          <p className="text-sm text-gray-400">
            These preferences are synced with your profile on the backend.
          </p>
        </div>
        {updatedAtLabel ? (
          <p className="text-xs font-medium tracking-[0.2em] text-gray-500 uppercase">
            Updated {updatedAtLabel}
          </p>
        ) : null}
      </div>

      {loadError ? (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}
    </div>
  );
};

export default SettingsOverviewCard;
