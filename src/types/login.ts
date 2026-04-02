export type LoginMode = 'sign-up' | 'login';

export interface LoginFormData {
  fullName: string;
  email: string;
  githubProfileUrl: string;
  password: string;
}

export interface LoginStatus {
  loading: boolean;
  error: string | null;
}
