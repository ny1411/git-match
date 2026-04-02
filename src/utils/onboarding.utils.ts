import type { OnboardingFormData, OnboardingStatus, OnboardingStep } from '../types/onboarding';

export const TOTAL_ONBOARDING_STEPS = 3;
export const GENDER_PREFERENCES = ['Male', 'Female', 'Other', 'Prefer not to say'];
export const INTERESTS_OPTIONS = [
  'Open Source',
  'Machine Learning',
  'Data Science',
  'Web Development',
  'Gaming',
  'Arts & Culture',
  'Travel',
  'Fitness',
  'Music',
  'Reading',
  'Cooking',
];
export const RELATIONSHIP_GOALS = ['Casual', 'Dating', 'Long-term relationship', 'Friendship'];

export const EMPTY_ONBOARDING_FORM: OnboardingFormData = {
  dob: '',
  geolocation: {
    city: '',
    country: '',
    lat: null,
    lng: null,
  },
  genderPreference: '',
  interests: [],
  otherInterest: '',
  relationshipGoals: '',
};

export const EMPTY_ONBOARDING_STATUS: OnboardingStatus = {
  message: '',
  error: false,
  loading: false,
};

export const getMaxAdultDobDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().slice(0, 10);
};

export const calculateAgeFromDob = (dob: string): number | null => {
  if (!dob) {
    return null;
  }

  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

export const validateOnboardingStep = (
  step: OnboardingStep,
  formData: OnboardingFormData,
  useGeo: boolean
) => {
  const age = calculateAgeFromDob(formData.dob);

  if (step === 1) {
    const hasManualLocation = Boolean(
      formData.geolocation.city.trim() && formData.geolocation.country.trim()
    );
    if (age === null || age < 18 || (!useGeo && !hasManualLocation)) {
      return 'Please enter a valid date of birth (18+) and location.';
    }
  }

  if (step === 2) {
    const hasInterests =
      formData.interests.length > 0 || formData.otherInterest.trim().length > 0;
    if (!formData.genderPreference || !hasInterests) {
      return 'Please select a gender preference and at least one interest.';
    }
  }

  if (step === 3 && !formData.relationshipGoals) {
    return 'Please select your relationship goals.';
  }

  return null;
};

export const buildOnboardingPayload = (formData: OnboardingFormData) => {
  const interests = [...formData.interests, formData.otherInterest]
    .map((interest) => interest.trim())
    .filter((interest) => Boolean(interest));

  return {
    dateOfBirth: formData.dob || null,
    geolocation: {
      city: formData.geolocation.city.trim(),
      country: formData.geolocation.country.trim(),
      lat: formData.geolocation.lat ?? null,
      lng: formData.geolocation.lng ?? null,
    },
    gender: formData.genderPreference || null,
    interest: interests.length ? interests.join(', ') : null,
    goal: formData.relationshipGoals || null,
  };
};
