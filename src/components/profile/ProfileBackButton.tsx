import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ProfileBackButtonProps {
  onClick: () => void;
}

const ProfileBackButton: React.FC<ProfileBackButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
    >
      <ArrowLeft size={18} />
      Back to Dashboard
    </button>
  );
};

export default ProfileBackButton;
