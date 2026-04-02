import type { SignupData } from '../context/auth-context';

interface AuthActionResponse {
  success: boolean;
  message: string;
}

interface LoginServiceDependencies {
  login: (email: string, password: string) => Promise<AuthActionResponse>;
  signup: (data: SignupData) => Promise<AuthActionResponse>;
}

export const loginWithCredentials = (
  dependencies: LoginServiceDependencies,
  email: string,
  password: string
) => dependencies.login(email, password);

export const signupWithProfile = (dependencies: LoginServiceDependencies, data: SignupData) =>
  dependencies.signup(data);
