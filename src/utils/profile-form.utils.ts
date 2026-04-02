import type { ProfileFormData, RawProfile } from '../types/profile-form';

type FirestoreTimestampLike = {
  seconds?: number;
  _seconds?: number;
  toDate?: () => Date;
};

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

export const EMPTY_PROFILE_FORM: ProfileFormData = {
  fullName: '',
  role: '',
  githubURL: '',
  location: '',
  about: '',
  dob: '',
  genderPreference: '',
  interests: [],
  otherInterest: '',
  relationshipGoals: '',
};

const trimText = (value?: string | null) => value?.trim() ?? '';

const normalizeDateValue = (value: unknown): string => {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }

  if (typeof value === 'object') {
    const timestamp = value as FirestoreTimestampLike;

    if (typeof timestamp.toDate === 'function') {
      return normalizeDateValue(timestamp.toDate());
    }

    const seconds =
      typeof timestamp.seconds === 'number'
        ? timestamp.seconds
        : typeof timestamp._seconds === 'number'
          ? timestamp._seconds
          : null;

    if (seconds !== null) {
      return normalizeDateValue(new Date(seconds * 1000));
    }
  }

  return '';
};

const formatLocation = (profile?: RawProfile | null) =>
  trimText(profile?.location) ||
  [profile?.geolocation?.city ?? profile?.city, profile?.geolocation?.country ?? profile?.country]
    .map((value) => trimText(value))
    .filter((value): value is string => Boolean(value))
    .join(', ');

export const splitCommaSeparatedValues = (value?: string | null) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is string => Boolean(item));

export const normalizeInterests = (interests?: string[]) =>
  Array.from(
    new Set(
      (interests ?? [])
        .map((interest) => interest.trim())
        .filter((interest): interest is string => Boolean(interest))
    )
  );

const splitInterestSelections = (interests: string[]) => {
  const normalized = normalizeInterests(interests);
  const predefinedInterests = normalized.filter((interest) => INTERESTS_OPTIONS.includes(interest));
  const customInterests = normalized.filter((interest) => !INTERESTS_OPTIONS.includes(interest));

  return {
    predefinedInterests,
    otherInterest: customInterests.join(', '),
  };
};

export const mapProfileToForm = (profile?: RawProfile | null): ProfileFormData => {
  const normalizedInterestValues = normalizeInterests(splitCommaSeparatedValues(profile?.interest));
  const { predefinedInterests, otherInterest } = splitInterestSelections(normalizedInterestValues);

  return {
    fullName: trimText(profile?.fullName),
    role: trimText(profile?.role),
    githubURL: trimText(profile?.githubProfileUrl),
    location: formatLocation(profile),
    about: trimText(profile?.aboutMe),
    dob: normalizeDateValue(profile?.dateOfBirth ?? profile?.dob),
    genderPreference: trimText(profile?.gender),
    interests: predefinedInterests,
    otherInterest,
    relationshipGoals: trimText(profile?.goal),
  };
};

export const extractProfileAge = (profile?: RawProfile | null) =>
  typeof profile?.age === 'number' && Number.isFinite(profile.age) ? profile.age : null;

export const calculateAge = (dobString: string): number | null => {
  if (!dobString) {
    return null;
  }

  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

export const getSelectedInterestCount = (profileData: ProfileFormData) =>
  profileData.interests.length +
  splitCommaSeparatedValues(profileData.otherInterest)
    .map((interest) => interest.trim())
    .filter(Boolean).length;

export const buildProfileUpdatePayload = (profileData: ProfileFormData): Record<string, unknown> => {
  const allInterests = normalizeInterests([
    ...profileData.interests,
    ...splitCommaSeparatedValues(profileData.otherInterest),
  ]);
  const trimmedLocation = profileData.location.trim();
  const trimmedDob = profileData.dob.trim();
  const trimmedGender = profileData.genderPreference.trim();
  const trimmedGoal = profileData.relationshipGoals.trim();

  const payload: Record<string, unknown> = {
    fullName: profileData.fullName.trim(),
    role: profileData.role.trim(),
    aboutMe: profileData.about.trim(),
    githubProfileUrl: profileData.githubURL.trim(),
    location: trimmedLocation || null,
    gender: trimmedGender || null,
    interest: allInterests.length > 0 ? allInterests.join(', ') : null,
    goal: trimmedGoal || null,
  };

  if (trimmedDob) {
    payload.dateOfBirth = trimmedDob;
  }

  if (!trimmedLocation) {
    payload.city = null;
    payload.country = null;
  }

  return payload;
};
