import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <>
      <p className="mb-8 text-center text-gray-400">
        Step {currentStep} of {totalSteps}
      </p>
      <div className="mb-10 h-2 w-full rounded-full bg-gray-700">
        <div
          className="h-2 rounded-full bg-purple-500 transition-all duration-500"
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
          }}
        />
      </div>
    </>
  );
};

export default OnboardingProgress;
