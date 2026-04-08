import React, { type ChangeEvent } from 'react';
import { InputField } from '../../ui/InputField';
import type { OnboardingFormData } from '../../../types/onboarding';
import { GENDER_PREFERENCES, INTERESTS_OPTIONS } from '../../../utils/onboarding.utils';

interface PreferencesStepProps {
  formData: OnboardingFormData;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onInterestToggle: (interest: string) => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({
  formData,
  onInputChange,
  onInterestToggle,
}) => {
  return (
    <div className="space-y-8">
      <h3 className="mb-6 text-xl font-semibold text-purple-300">2. Preferences & Interests</h3>

      <div className="rounded-lg border border-white/10 p-4">
        <label className="mb-3 block text-sm text-gray-300">Gender Preference</label>
        {GENDER_PREFERENCES.map((preference) => (
          <div key={preference} className="mb-2 flex items-center">
            <input
              type="radio"
              id={preference}
              name="genderPreference"
              value={preference}
              checked={formData.genderPreference === preference}
              onChange={onInputChange}
              className="form-radio h-4 w-4 border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor={preference} className="ml-3 text-sm text-white">
              {preference}
            </label>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 p-4">
        <label className="mb-3 block text-sm text-gray-300">Interests (Select all that apply)</label>
        <div className="flex flex-wrap gap-3">
          {INTERESTS_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => onInterestToggle(interest)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                formData.interests.includes(interest)
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <InputField
            label="Other Interest (Free text)"
            name="otherInterest"
            value={formData.otherInterest}
            onChange={onInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PreferencesStep;
