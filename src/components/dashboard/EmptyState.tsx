import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onBack?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  onBack,
}) => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black px-6 text-white">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
        <h2 className="mb-3 text-2xl font-bold">{title}</h2>
        <p className="mb-6 text-sm text-gray-300">{message}</p>
        <div className="flex justify-center gap-4">
          {onBack ? (
            <CustomButton onClick={onBack} className="cursor-pointer bg-white/10 text-white">
              <ArrowLeft />
            </CustomButton>
          ) : null}
          <button
            onClick={onAction}
            className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
