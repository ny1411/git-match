import React from 'react';
import type { LoginMode } from '../../types/login';

interface LoginModeToggleProps {
  mode: LoginMode;
  onChangeMode: (mode: LoginMode) => void;
}

const LoginModeToggle: React.FC<LoginModeToggleProps> = ({ mode, onChangeMode }) => {
  return (
    <div className="relative z-10 mx-auto mb-16 flex h-14 w-full max-w-70 rounded-full bg-white p-1 shadow-lg">
      <button
        type="button"
        onClick={() => onChangeMode('sign-up')}
        className={`w-1/2 rounded-full text-sm font-bold tracking-wide transition-colors duration-300 hover:text-gray-800 ${
          mode === 'sign-up' ? 'bg-[#8b2fc9] text-white shadow-md' : 'bg-transparent text-gray-500'
        }`}
      >
        SIGN UP
      </button>
      <button
        type="button"
        onClick={() => onChangeMode('login')}
        className={`w-1/2 rounded-full text-sm font-bold tracking-wide transition-colors duration-300 hover:text-gray-800 ${
          mode === 'login' ? 'bg-[#8b2fc9] text-white shadow-md' : 'bg-transparent text-gray-500'
        }`}
      >
        LOGIN
      </button>
    </div>
  );
};

export default LoginModeToggle;
