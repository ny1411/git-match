export interface SignupRequest {
  fullName: string;
  email: string;
  githubProfileUrl: string;
  password: string;
  // No optional fields for signup - they'll be added in profile later
}
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface UserProfile {
    uid: string;
    
    // Basic Info
    fullName: string;
    email: string;
    
    // Profile Details
    age?: number;
    role: string;
    // Location can be derived from city + country
    location?: string | null;
    city?: string | null;
    country?: string | null;
    // New frontend fields
    geolocation?: {
      lat?: number | null;
      lng?: number | null;
    } | null;
    gender?: string | null;
    genderPreference?: string | null;
    interests?: string[] | null;
    otherInterest?: string | null;
    relationshipGoals?: string | null;
    interest?: string | null; // legacy: comma-separated list
    goal?: string | null; // legacy
    aboutMe: string;
    dateOfBirth?: string;
    
    // GitHub
    githubProfileUrl: string;
    
    // Image
    profileImage?: string; // Firebase Storage URL
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UpdateProfileRequest {
    fullName?: string;
    age?: number;
    role?: string;
    // Allow updating individual location parts or the full location
    location?: string | null;
    city?: string | null;
    country?: string | null;
    gender?: string | null;
    // New frontend-friendly fields
    dob?: string | Date | null;
    geolocation?: { lat?: number | null; lng?: number | null } | null;
    genderPreference?: string | null;
    interests?: string[] | null;
    otherInterest?: string | null;
    relationshipGoals?: string | null;

    interest?: string | null; // legacy: comma-separated
    goal?: string | null;
    aboutMe?: string;
    dateOfBirth?: string;
    githubProfileUrl?: string;
    profileImage?: string; // base64 string for updates
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    user?: UserProfile;
    token?: string;
  }
  
  export interface ProfileResponse {
    success: boolean;
    message: string;
    profile?: UserProfile;
  }