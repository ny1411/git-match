import React, { type ChangeEvent } from 'react';
import { InputField } from '../ui/InputField';
import type { LoginFormData, LoginMode } from '../../types/login';

interface LoginFormProps {
  mode: LoginMode;
  formData: LoginFormData;
  loading: boolean;
  error: string | null;
  actionLabel: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  mode,
  formData,
  loading,
  error,
  actionLabel,
  onChange,
  onSubmit,
}) => {
  return (
    <div>
      <div className="mx-auto flex w-full max-w-xs flex-1 flex-col justify-center space-y-2">
        {mode === 'sign-up' ? (
          <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={onChange} />
        ) : null}
        <InputField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
        />
        {mode === 'sign-up' ? (
          <InputField
            label="Github Profile URL"
            name="githubProfileUrl"
            value={formData.githubProfileUrl}
            onChange={onChange}
          />
        ) : null}
        <InputField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={onChange}
        />
      </div>

      {error ? (
        <div className="mx-auto mt-6 w-full max-w-xs rounded-lg border border-red-500/30 bg-red-900/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-12 flex justify-center">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full max-w-[200px] rounded-full bg-linear-to-r from-[#a82ee6] to-[#7125d8] py-3 font-bold tracking-wider text-white shadow-lg shadow-purple-500/30 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'PLEASE WAIT...' : actionLabel}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
