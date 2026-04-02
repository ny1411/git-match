import React from 'react';
import type { OnboardingStatus as OnboardingStatusType } from '../../types/onboarding';

interface OnboardingStatusProps {
  status: OnboardingStatusType;
}

const OnboardingStatus: React.FC<OnboardingStatusProps> = ({ status }) => {
  if (!status.message) {
    return null;
  }

  return (
    <div
      className={`mb-6 rounded-lg p-3 text-center text-sm ${
        status.error ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
      }`}
    >
      {status.message}
    </div>
  );
};

export default OnboardingStatus;
