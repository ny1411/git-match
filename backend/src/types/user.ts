export interface SignupRequest {
    fullName: string;
    email: string;
    githubProfileUrl: string;
    password: string;
    role: string;
    location: string;
    aboutMe: string;
    age?: number;
    dateOfBirth?: string;
    profileImage?: string; // base64 string for signup
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
    location: string;
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
    location?: string;
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