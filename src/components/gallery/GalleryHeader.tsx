import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface GalleryHeaderProps {
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ isSaving, onBack, onSave }) => {
  return (
    <>
      <div className="mb-6 flex w-full max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>

      <div className="mb-8 flex w-full max-w-4xl items-end justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Profile Gallery</h1>
          <p className="text-sm text-gray-400">Add up to 6 photos to showcase your personality.</p>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="rounded-full bg-linear-to-r from-purple-600 to-pink-600 px-6 py-2.5 font-bold text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  );
};

export default GalleryHeader;
