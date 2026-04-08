import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { submitOnboardingProfile, reverseGeocodeCoordinates } from '../services/onboarding.service';
import type { OnboardingFormData, OnboardingStep, OnboardingStatus } from '../types/onboarding';
import {
  EMPTY_ONBOARDING_FORM,
  EMPTY_ONBOARDING_STATUS,
  TOTAL_ONBOARDING_STEPS,
  buildOnboardingPayload,
  calculateAgeFromDob,
  validateOnboardingStep,
} from '../utils/onboarding.utils';

interface UseOnboardingOptions {
  firebaseToken: string | null;
  userId?: string;
}

const getIdleStatus = (): OnboardingStatus => ({ ...EMPTY_ONBOARDING_STATUS });

export const useOnboarding = ({ firebaseToken, userId }: UseOnboardingOptions) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [formData, setFormData] = useState<OnboardingFormData>(EMPTY_ONBOARDING_FORM);
  const [status, setStatus] = useState<OnboardingStatus>(EMPTY_ONBOARDING_STATUS);
  const [useGeo, setUseGeo] = useState(false);

  const age = useMemo(() => calculateAgeFromDob(formData.dob), [formData.dob]);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }, []);

  const handleGeoChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      geolocation: {
        ...previous.geolocation,
        [name]: value,
      },
    }));
  }, []);

  const handleInterestChange = useCallback((interest: string) => {
    setFormData((previous) => {
      const isSelected = previous.interests.includes(interest);
      return {
        ...previous,
        interests: isSelected
          ? previous.interests.filter((item) => item !== interest)
          : [...previous.interests, interest],
      };
    });
  }, []);

  const setManualLocationEntry = useCallback(() => {
    setUseGeo(false);
    setStatus(getIdleStatus());
  }, []);

  const captureCurrentLocation = useCallback(() => {
    setStatus({
      message: 'Fetching location...',
      error: false,
      loading: true,
    });

    if (!navigator.geolocation) {
      setUseGeo(false);
      setStatus({
        loading: false,
        error: true,
        message: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        void reverseGeocodeCoordinates(latitude, longitude)
          .then(({ city, country }) => {
            setFormData((previous) => ({
              ...previous,
              geolocation: {
                city: city || previous.geolocation.city,
                country: country || previous.geolocation.country,
                lat: latitude,
                lng: longitude,
              },
            }));
            setUseGeo(true);
            setStatus({
              loading: false,
              error: false,
              message: city || country ? 'Location captured.' : 'Coordinates captured. Verify city/country.',
            });
          })
          .catch(() => {
            setFormData((previous) => ({
              ...previous,
              geolocation: {
                ...previous.geolocation,
                lat: latitude,
                lng: longitude,
              },
            }));
            setUseGeo(true);
            setStatus({
              loading: false,
              error: false,
              message: 'Coordinates captured. Please complete city/country manually.',
            });
          });
      },
      () => {
        setUseGeo(false);
        setStatus({
          loading: false,
          error: true,
          message: 'Geolocation denied or unavailable. Please enter location manually.',
        });
      }
    );
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((previous) => (Math.max(1, previous - 1) as OnboardingStep));
    setStatus(getIdleStatus());
  }, []);

  const goToNextStep = useCallback(() => {
    const validationError = validateOnboardingStep(currentStep, formData, useGeo);

    if (validationError) {
      setStatus({
        loading: false,
        error: true,
        message: validationError,
      });
      return false;
    }

    setStatus(getIdleStatus());
    setCurrentStep((previous) => Math.min(previous + 1, TOTAL_ONBOARDING_STEPS) as OnboardingStep);
    return true;
  }, [currentStep, formData, useGeo]);

  const submitProfile = useCallback(async () => {
    const validationError = validateOnboardingStep(3, formData, useGeo);
    if (validationError) {
      setStatus({
        loading: false,
        error: true,
        message: validationError,
      });
      return false;
    }

    if (!userId) {
      setStatus({
        loading: false,
        error: true,
        message: 'User not authenticated. Please log in again.',
      });
      return false;
    }

    setStatus({
      message: 'Submitting profile...',
      loading: true,
      error: false,
    });

    try {
      const payload = buildOnboardingPayload(formData);
      await submitOnboardingProfile(payload, { firebaseToken });
      setStatus({
        loading: false,
        error: false,
        message: 'Profile setup complete! Redirecting...',
      });
      return true;
    } catch (error) {
      setStatus({
        loading: false,
        error: true,
        message: error instanceof Error ? error.message : 'Submission failed.',
      });
      return false;
    }
  }, [firebaseToken, formData, useGeo, userId]);

  return {
    currentStep,
    formData,
    status,
    age,
    useGeo,
    handleInputChange,
    handleGeoChange,
    handleInterestChange,
    setManualLocationEntry,
    captureCurrentLocation,
    goToPreviousStep,
    goToNextStep,
    submitProfile,
  };
};
