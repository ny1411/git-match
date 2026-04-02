export interface ProfileFormData {
  fullName: string;
  role: string;
  githubURL: string;
  location: string;
  about: string;
  dob: string;
  genderPreference: string;
  interests: string[];
  otherInterest: string;
  relationshipGoals: string;
}

export interface RawProfile {
  fullName?: string;
  role?: string;
  githubProfileUrl?: string;
  aboutMe?: string;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  gender?: string | null;
  goal?: string | null;
  interest?: string | null;
  profileImage?: string | null;
  age?: number | null;
  dob?: unknown;
  dateOfBirth?: unknown;
  geolocation?: {
    city?: string | null;
    country?: string | null;
  };
}

export interface ProfileResponse {
  success?: boolean;
  message?: string;
  profile?: RawProfile;
}

export interface ProfileSaveStatus {
  message: string;
  error: boolean;
}
