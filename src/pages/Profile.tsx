import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileBackButton from '../components/profile/ProfileBackButton';
import ProfileDetailsPanel from '../components/profile/ProfileDetailsPanel';
import ProfilePhotoPanel from '../components/profile/ProfilePhotoPanel';
import BgGradient from '../components/ui/BgGradient';
import { CropperModal } from '../components/ui/CropperModal';
import { useAuth } from '../hooks/useAuth';
import { useProfileEditor } from '../hooks/useProfileEditor';

const Profile: FC = () => {
  const navigate = useNavigate();
  const { firebaseToken, userProfile, isLoading: authLoading } = useAuth();
  const {
    photoInputRef,
    profileData,
    displayedProfilePicture,
    age,
    isProfileLoading,
    isSaving,
    isPhotoUploading,
    selectedPhotoFile,
    isCropperOpen,
    loadError,
    saveStatus,
    selectedInterestCount,
    isInteractionDisabled,
    updateProfileField,
    handleInputChange,
    handleInterestToggle,
    openPhotoPicker,
    handlePhotoSelection,
    closeCropper,
    handleProfilePhotoCropComplete,
    handleSaveProfile,
  } = useProfileEditor({
    authLoading,
    firebaseToken,
    userId: userProfile?.uid,
  });

  return (
    <div className="relative isolate min-h-dvh w-full overflow-x-clip bg-[#05010b] text-white">
      <BgGradient />

      {isCropperOpen && selectedPhotoFile ? (
        <CropperModal
          imageSrc={selectedPhotoFile}
          onCancel={closeCropper}
          onCropComplete={(croppedImageBase64) => {
            void handleProfilePhotoCropComplete(croppedImageBase64);
          }}
        />
      ) : null}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelection}
          className="hidden"
        />

        <ProfileBackButton
          onClick={() => {
            navigate('/dashboard');
          }}
        />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <ProfilePhotoPanel
            imageSrc={displayedProfilePicture}
            fullName={profileData.fullName}
            age={age}
            role={profileData.role}
            isPhotoUploading={isPhotoUploading}
            disabled={isInteractionDisabled}
            onPickPhoto={openPhotoPicker}
          />
          <ProfileDetailsPanel
            profileData={profileData}
            age={age}
            selectedInterestCount={selectedInterestCount}
            isProfileLoading={isProfileLoading}
            isSaving={isSaving}
            isPhotoUploading={isPhotoUploading}
            loadError={loadError}
            saveStatus={saveStatus}
            onInputChange={handleInputChange}
            onToggleInterest={handleInterestToggle}
            onSetGenderPreference={(value) => {
              updateProfileField('genderPreference', value);
            }}
            onSetRelationshipGoal={(value) => {
              updateProfileField('relationshipGoals', value);
            }}
            onSave={() => {
              void handleSaveProfile();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
