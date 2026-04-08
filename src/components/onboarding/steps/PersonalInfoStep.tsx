import React, { type ChangeEvent } from 'react';
import { InputField } from '../../ui/InputField';
import type { OnboardingFormData } from '../../../types/onboarding';

interface PersonalInfoStepProps {
  formData: OnboardingFormData;
  useGeo: boolean;
  loading: boolean;
  maxDobDate: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onGeoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUseCurrentLocation: () => void;
  onManualLocation: () => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  useGeo,
  loading,
  maxDobDate,
  onInputChange,
  onGeoChange,
  onUseCurrentLocation,
  onManualLocation,
}) => {
  return (
    <div className="space-y-8">
      <h3 className="mb-6 text-xl font-semibold text-purple-300">1. Personal Information</h3>

      <InputField
        label="Date Of Birth (Must be 18+)"
        name="dob"
        type="date"
        value={formData.dob}
        onChange={onInputChange}
        max={maxDobDate}
      />

      <h4 className="border-t border-white/10 pt-4 text-lg font-medium text-white">Geolocation</h4>

      <div className="flex flex-col gap-4 md:flex-row">
        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={loading || useGeo}
          className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
            useGeo
              ? 'bg-green-600/50 text-white'
              : 'bg-purple-600/80 text-white hover:bg-purple-700/80'
          } ${loading ? 'cursor-wait' : ''}`}
        >
          {loading ? 'Fetching...' : useGeo ? 'Location Captured' : 'Use Current Location'}
        </button>
        <button
          type="button"
          onClick={onManualLocation}
          className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
            !useGeo ? 'bg-gray-600/50 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Enter Manually
        </button>
      </div>

      <InputField
        label="City / Region"
        name="city"
        value={formData.geolocation.city}
        onChange={onGeoChange}
        disabled={useGeo}
      />
      <InputField
        label="Country"
        name="country"
        value={formData.geolocation.country}
        onChange={onGeoChange}
        disabled={useGeo}
      />
    </div>
  );
};

export default PersonalInfoStep;
