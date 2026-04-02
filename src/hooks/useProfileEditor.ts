import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { getUserGallery, saveUserGallery } from '../services/gallery.service';
import { getMyProfile, updateMyProfile } from '../services/profile.service';
import type { GalleryImage } from '../types/gallery';
import type { ProfileFormData, ProfileSaveStatus } from '../types/profile-form';
import {
  EMPTY_PROFILE_FORM,
  buildProfileUpdatePayload,
  calculateAge,
  extractProfileAge,
  getSelectedInterestCount,
  mapProfileToForm,
} from '../utils/profile-form.utils';
import { resolvePrimaryGalleryImage, upsertPrimaryGalleryImage } from '../utils/gallery.mapper';

interface UseProfileEditorOptions {
  authLoading: boolean;
  firebaseToken: string | null;
  userId?: string;
}

export const useProfileEditor = ({ authLoading, firebaseToken, userId }: UseProfileEditorOptions) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileFormData>(EMPTY_PROFILE_FORM);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [profileAge, setProfileAge] = useState<number | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<ProfileSaveStatus | null>(null);

  const age = useMemo(() => calculateAge(profileData.dob) ?? profileAge, [profileAge, profileData.dob]);
  const displayedProfilePicture = useMemo(
    () => resolvePrimaryGalleryImage(galleryImages) || profilePicture,
    [galleryImages, profilePicture]
  );
  const selectedInterestCount = useMemo(
    () => getSelectedInterestCount(profileData),
    [profileData]
  );
  const isInteractionDisabled = authLoading || isProfileLoading || isSaving || isPhotoUploading;

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      if (authLoading) {
        return;
      }

      setIsProfileLoading(true);
      setLoadError(null);

      try {
        const result = await getMyProfile({ firebaseToken }, controller.signal);

        if (!result.profile) {
          throw new Error(result.message || 'Failed to retrieve profile');
        }

        if (controller.signal.aborted) {
          return;
        }

        setProfileData(mapProfileToForm(result.profile));
        setProfilePicture(result.profile.profileImage?.trim() || null);
        setProfileAge(extractProfileAge(result.profile));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Failed to retrieve profile');
        setProfileData(EMPTY_PROFILE_FORM);
        setProfilePicture(null);
        setProfileAge(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsProfileLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => controller.abort();
  }, [authLoading, firebaseToken]);

  useEffect(() => {
    let isActive = true;

    const fetchGallery = async () => {
      if (authLoading) {
        return;
      }

      if (!userId) {
        setGalleryImages([]);
        return;
      }

      try {
        const savedImages = await getUserGallery(userId);
        if (isActive) {
          setGalleryImages(savedImages);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error('Failed to load gallery profile picture:', error);
        setGalleryImages([]);
      }
    };

    void fetchGallery();

    return () => {
      isActive = false;
    };
  }, [authLoading, userId]);

  const updateProfileField = useCallback(
    (field: keyof ProfileFormData, value: ProfileFormData[keyof ProfileFormData]) => {
      setSaveStatus(null);
      setProfileData((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    []
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      updateProfileField(name as keyof ProfileFormData, value);
    },
    [updateProfileField]
  );

  const handleInterestToggle = useCallback((interest: string) => {
    setSaveStatus(null);
    setProfileData((previous) => {
      const isSelected = previous.interests.includes(interest);

      return {
        ...previous,
        interests: isSelected
          ? previous.interests.filter((item) => item !== interest)
          : [...previous.interests, interest],
      };
    });
  }, []);

  const closeCropper = useCallback(() => {
    setIsCropperOpen(false);
    setSelectedPhotoFile(null);
  }, []);

  const openPhotoPicker = useCallback(() => {
    if (isInteractionDisabled) {
      return;
    }

    setSaveStatus(null);
    photoInputRef.current?.click();
  }, [isInteractionDisabled]);

  const handlePhotoSelection = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setSaveStatus({
          message: 'Failed to read the selected image.',
          error: true,
        });
        return;
      }

      setSelectedPhotoFile(reader.result);
      setIsCropperOpen(true);
    };

    reader.onerror = () => {
      setSaveStatus({
        message: 'Failed to read the selected image.',
        error: true,
      });
    };

    reader.readAsDataURL(file);
  }, []);

  const handleProfilePhotoCropComplete = useCallback(
    async (croppedImageBase64: string) => {
      if (!userId) {
        setSaveStatus({
          message: 'User not authenticated.',
          error: true,
        });
        closeCropper();
        return;
      }

      setIsPhotoUploading(true);
      setSaveStatus({
        message: 'Uploading profile photo...',
        error: false,
      });

      try {
        const updatedGallery = upsertPrimaryGalleryImage(galleryImages, croppedImageBase64);
        await saveUserGallery(userId, updatedGallery);
        setGalleryImages(updatedGallery);
        setSaveStatus({
          message: 'Profile photo updated successfully.',
          error: false,
        });
      } catch (error) {
        setSaveStatus({
          message: error instanceof Error ? error.message : 'Failed to update profile photo',
          error: true,
        });
      } finally {
        setIsPhotoUploading(false);
        closeCropper();
      }
    },
    [closeCropper, galleryImages, userId]
  );

  const handleSaveProfile = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus({
      message: 'Saving profile...',
      error: false,
    });

    try {
      const payload = buildProfileUpdatePayload(profileData);
      const result = await updateMyProfile(payload, { firebaseToken });

      if (!result.profile) {
        throw new Error(result.message || 'Failed to update profile');
      }

      setProfileData(mapProfileToForm(result.profile));
      setProfilePicture(result.profile.profileImage?.trim() || null);
      setProfileAge(extractProfileAge(result.profile));
      setLoadError(null);
      setSaveStatus({
        message: result.message || 'Profile updated successfully.',
        error: false,
      });
    } catch (error) {
      setSaveStatus({
        message: error instanceof Error ? error.message : 'Failed to update profile',
        error: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [firebaseToken, profileData]);

  return {
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
  };
};
