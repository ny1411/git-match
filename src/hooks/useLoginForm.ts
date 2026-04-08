import { useCallback, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { loginWithCredentials, signupWithProfile } from '../services/login.service';
import type { LoginFormData, LoginMode, LoginStatus } from '../types/login';
import {
  EMPTY_LOGIN_FORM,
  getLoginActionLabel,
  INITIAL_LOGIN_MODE,
  validateLoginForm,
} from '../utils/login.utils';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { signup, login } = useAuth();
  const [loginMode, setLoginMode] = useState<LoginMode>(INITIAL_LOGIN_MODE);
  const [formData, setFormData] = useState<LoginFormData>(EMPTY_LOGIN_FORM);
  const [status, setStatus] = useState<LoginStatus>({ loading: false, error: null });

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }, []);

  const setMode = useCallback((mode: LoginMode) => {
    setLoginMode(mode);
    setStatus({ loading: false, error: null });
  }, []);

  const submit = useCallback(async () => {
    const validationError = validateLoginForm(loginMode, formData);
    if (validationError) {
      setStatus({ loading: false, error: validationError });
      return;
    }

    setStatus({ loading: true, error: null });

    try {
      if (loginMode === 'login') {
        const result = await loginWithCredentials(
          { login, signup },
          formData.email.trim(),
          formData.password
        );

        if (!result.success) {
          setStatus({ loading: false, error: result.message || 'Login failed.' });
          return;
        }

        setStatus({ loading: false, error: null });
        return;
      }

      const signupResult = await signupWithProfile(
        { login, signup },
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          githubProfileUrl: formData.githubProfileUrl.trim(),
          password: formData.password,
        }
      );

      if (!signupResult.success) {
        setStatus({ loading: false, error: signupResult.message || 'Signup failed.' });
        return;
      }

      setStatus({ loading: false, error: null });
      navigate('/onboarding');
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Something went wrong.',
      });
    }
  }, [formData, login, loginMode, navigate, signup]);

  const actionLabel = getLoginActionLabel(loginMode);

  return {
    loginMode,
    formData,
    status,
    actionLabel,
    handleChange,
    setMode,
    submit,
  };
};
