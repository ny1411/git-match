import React from 'react';
import type { ProfileSaveStatus } from '../../types/profile-form';

interface ProfileStatusMessageProps {
  message: string;
  error?: boolean;
}

const ProfileStatusMessage: React.FC<ProfileStatusMessageProps> = ({ message, error = false }) => {
  return (
    <div
      className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
        error
          ? 'border-red-500/20 bg-red-500/10 text-red-200'
          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
      }`}
    >
      {message}
    </div>
  );
};

export const LoadErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <ProfileStatusMessage message={message} error />
);

export const SaveStatusMessage: React.FC<{ status: ProfileSaveStatus }> = ({ status }) => (
  <ProfileStatusMessage message={status.message} error={status.error} />
);
