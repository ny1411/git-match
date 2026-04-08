import type { LoginFormData, LoginMode } from '../types/login';

export const INITIAL_LOGIN_MODE: LoginMode = 'sign-up';

export const EMPTY_LOGIN_FORM: LoginFormData = {
  fullName: '',
  email: '',
  githubProfileUrl: '',
  password: '',
};

export const getLoginActionLabel = (mode: LoginMode) => (mode === 'sign-up' ? 'SIGN UP' : 'LOGIN');

export const validateLoginForm = (mode: LoginMode, formData: LoginFormData) => {
  if (!formData.email.trim() || !formData.password.trim()) {
    return 'Email and password are required.';
  }

  if (mode === 'sign-up') {
    if (!formData.fullName.trim()) {
      return 'Full name is required.';
    }

    if (!formData.githubProfileUrl.trim()) {
      return 'Github profile URL is required.';
    }
  }

  return null;
};
