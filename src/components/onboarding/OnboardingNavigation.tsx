import React from 'react';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  totalSteps,
  loading,
  onBack,
  onNext,
  onSubmit,
}) => {
  return (
    <div className="mt-12 flex justify-between border-t border-white/10 pt-6">
      {currentStep > 1 ? (
        <button
          onClick={onBack}
          className="rounded-full bg-white/10 px-6 py-2 font-medium text-white transition-colors hover:bg-white/20"
          disabled={loading}
        >
          Back
        </button>
      ) : (
        <div className="w-20" />
      )}

      {currentStep < totalSteps ? (
        <button
          onClick={onNext}
          className="rounded-full bg-linear-to-r from-purple-600 to-pink-600 px-8 py-3 font-bold text-white shadow-lg shadow-purple-900/50 transition-all hover:scale-[1.03]"
          disabled={loading}
        >
          Save and Continue
        </button>
      ) : (
        <button
          onClick={onSubmit}
          className="rounded-full bg-linear-to-r from-green-600 to-teal-500 px-8 py-3 font-bold text-white shadow-lg shadow-green-900/50 transition-all hover:scale-[1.03]"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Profile'}
        </button>
      )}
    </div>
  );
};

export default OnboardingNavigation;
