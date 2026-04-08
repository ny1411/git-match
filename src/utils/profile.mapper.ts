import type { Profile } from '../types/profile';

export interface RecommendationUser {
  uid: string;
  fullName?: string;
  age?: number;
  role?: string;
  location?: string;
  city?: string;
  country?: string;
  aboutMe?: string;
  profileImage?: string;
  githubProfileUrl?: string;
  interests?: string[];
  goal?: string;
}

const getTrimmedText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const formatRecommendationLocation = (user: RecommendationUser) => {
  const cityCountry = [user.city, user.country]
    .map((value) => getTrimmedText(value))
    .filter((value): value is string => Boolean(value))
    .join(', ');

  return getTrimmedText(user.location) || cityCountry || 'Location unavailable';
};

const buildFallbackProfileImage = (name: string) => {
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((value) => value.charAt(0).toUpperCase())
      .join('') || 'GM';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#17324d" />
          <stop offset="100%" stop-color="#081018" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#bg)" />
      <circle cx="400" cy="340" r="150" fill="rgba(255,255,255,0.18)" />
      <path d="M200 860c26-154 147-240 300-240s274 86 300 240" fill="rgba(255,255,255,0.12)" />
      <text
        x="50%"
        y="55%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="128"
        font-weight="700"
        fill="#ffffff"
      >
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getInterests = (user: RecommendationUser) => {
  const mappedInterests =
    user.interests
      ?.map((interest) => getTrimmedText(interest))
      .filter((value): value is string => Boolean(value)) ?? [];

  if (mappedInterests.length > 0) {
    return mappedInterests;
  }

  return [user.role, user.goal]
    .map((value) => getTrimmedText(value))
    .filter((value): value is string => Boolean(value));
};

export const mapRecommendationToProfile = (user: RecommendationUser): Profile => {
  const name = getTrimmedText(user.fullName) ?? getTrimmedText(user.role) ?? 'GitMatch User';

  return {
    id: user.uid,
    name,
    age: typeof user.age === 'number' ? user.age : undefined,
    location: formatRecommendationLocation(user),
    image: getTrimmedText(user.profileImage) ?? buildFallbackProfileImage(name),
    interests: getInterests(user),
    role: getTrimmedText(user.role),
    aboutMe: getTrimmedText(user.aboutMe),
    githubProfileUrl: getTrimmedText(user.githubProfileUrl),
    goal: getTrimmedText(user.goal),
  };
};
