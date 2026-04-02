export type OnboardingStep = 1 | 2 | 3;

export interface OnboardingGeolocation {
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
}

export interface OnboardingFormData {
  dob: string;
  geolocation: OnboardingGeolocation;
  genderPreference: string;
  interests: string[];
  otherInterest: string;
  relationshipGoals: string;
}

export interface OnboardingStatus {
  message: string;
  error: boolean;
  loading: boolean;
}
