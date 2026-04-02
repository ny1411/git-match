import React, { type ChangeEvent } from 'react';
import { InputField } from '../ui/InputField';
import type { ProfileFormData, ProfileSaveStatus } from '../../types/profile-form';
import {
  GENDER_PREFERENCES,
  INTERESTS_OPTIONS,
  RELATIONSHIP_GOALS,
} from '../../utils/profile-form.utils';
import { LoadErrorMessage, SaveStatusMessage } from './ProfileStatusMessage';

interface ProfileDetailsPanelProps {
  profileData: ProfileFormData;
  age: number | null;
  selectedInterestCount: number;
  isProfileLoading: boolean;
  isSaving: boolean;
  isPhotoUploading: boolean;
  loadError: string | null;
  saveStatus: ProfileSaveStatus | null;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggleInterest: (interest: string) => void;
  onSetGenderPreference: (value: string) => void;
  onSetRelationshipGoal: (value: string) => void;
  onSave: () => void;
}

const ProfileDetailsPanel: React.FC<ProfileDetailsPanelProps> = ({
  profileData,
  age,
  selectedInterestCount,
  isProfileLoading,
  isSaving,
  isPhotoUploading,
  loadError,
  saveStatus,
  onInputChange,
  onToggleInterest,
  onSetGenderPreference,
  onSetRelationshipGoal,
  onSave,
}) => {
  const isDisabled = isProfileLoading || isSaving || isPhotoUploading;

  return (
    <div className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl lg:col-span-7 lg:p-10">
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Profile Details</h2>
          <p className="mt-1 text-sm text-gray-400">Configure how you appear to other developers.</p>
        </div>
        {isProfileLoading ? (
          <p className="animate-pulse text-sm font-medium text-fuchsia-400">Loading...</p>
        ) : null}
      </div>

      {loadError ? <LoadErrorMessage message={loadError} /> : null}
      {saveStatus ? <SaveStatusMessage status={saveStatus} /> : null}

      <div
        className={`space-y-6 transition-opacity ${
          isDisabled ? 'pointer-events-none opacity-60' : 'opacity-100'
        }`}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputField onChange={onInputChange} name="fullName" label="Full Name" value={profileData.fullName} />
          <InputField
            onChange={onInputChange}
            name="age"
            label="Age"
            value={age === null ? '' : String(age)}
            disabled
            readOnly
            type="number"
          />
          <div className="md:col-span-2">
            <InputField
              onChange={onInputChange}
              name="role"
              label="Role / Area of Interest"
              value={profileData.role}
            />
          </div>
          <div className="md:col-span-2">
            <InputField
              onChange={onInputChange}
              name="githubURL"
              label="Github Profile Link"
              value={profileData.githubURL}
            />
          </div>
          <InputField onChange={onInputChange} name="location" label="Location" value={profileData.location} />
          <InputField
            onChange={onInputChange}
            name="dob"
            label="Date of Birth"
            value={profileData.dob}
            type="date"
          />
          <div className="md:col-span-2">
            <InputField onChange={onInputChange} name="about" label="About me" value={profileData.about} />
          </div>
        </div>

        <hr className="my-6 border-white/10" />

        <div>
          <label className="mb-3 block text-sm font-medium text-gray-300">I am looking for</label>
          <div className="flex flex-wrap gap-3">
            {GENDER_PREFERENCES.map((preference) => {
              const isSelected = profileData.genderPreference === preference;
              return (
                <button
                  key={preference}
                  type="button"
                  onClick={() => onSetGenderPreference(preference)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-fuchsia-500 bg-fuchsia-600 text-white shadow-md'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  {preference}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-gray-300">Tech & Hobbies</label>
            <span className="text-xs font-medium text-purple-300">{selectedInterestCount} selected</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {INTERESTS_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => onToggleInterest(interest)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  profileData.interests.includes(interest)
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white/5 text-gray-300 hover:bg-white/15'
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
              value={profileData.otherInterest}
              onChange={onInputChange}
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-gray-300">Relationship Goals</label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {RELATIONSHIP_GOALS.map((goal) => {
              const isSelected = profileData.relationshipGoals === goal;
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => onSetRelationshipGoal(goal)}
                  className={`rounded-2xl border-2 p-5 text-left transition-all ${
                    isSelected
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-white shadow-[0_0_20px_rgba(217,70,239,0.15)]'
                      : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span
                    className={`block text-base font-semibold ${isSelected ? 'text-fuchsia-300' : 'text-white'}`}
                  >
                    {goal}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex justify-end pt-6">
          <button
            type="button"
            onClick={onSave}
            disabled={isDisabled}
            className={`w-full rounded-full bg-linear-to-r from-purple-600 to-fuchsia-500 px-10 py-4 font-bold tracking-wider text-white shadow-lg shadow-purple-500/30 transition-all sm:w-auto ${
              isDisabled
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer hover:scale-[1.02] hover:shadow-fuchsia-500/40'
            }`}
          >
            {isSaving ? 'SAVING PROFILE...' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailsPanel;
