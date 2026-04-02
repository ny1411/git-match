import React from 'react';
import { GithubIcon } from '../ui/GithubIcon';

const LoginHeroPanel: React.FC = () => {
  return (
    <div className="relative hidden h-full w-full md:block md:w-7/12">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1609464527830-881cc93789ef?q=80&w=2128&auto=format&fit=crop"
          alt="Developers coding"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0f0a1e]/80 via-transparent to-[#0f0a1e]/30 mix-blend-multiply" />
      </div>

      <div className="absolute top-10 right-0 left-0 z-10 flex flex-col items-center text-center">
        <div className="mb-1 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white opacity-20 blur-xl" />
            <GithubIcon className="relative z-10 h-12 w-12 text-white" />
          </div>
          <h1 className="font-pixel text-7xl tracking-widest text-white drop-shadow-lg">GIT MATCH</h1>
        </div>
        <p className="font-pixel text-xl tracking-wide text-gray-200 opacity-90 drop-shadow-md">
          Find your perfect one to commit...
        </p>
      </div>
    </div>
  );
};

export default LoginHeroPanel;
