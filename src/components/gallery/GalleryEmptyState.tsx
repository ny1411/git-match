import React from 'react';

const GalleryEmptyState: React.FC = () => {
  return (
    <div className="mt-12 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      <p className="mb-4 text-gray-300">Your gallery is empty!</p>
      <p className="text-sm text-gray-500">
        Upload your best shots to get better matches. The first photo you upload will be your
        primary profile picture.
      </p>
    </div>
  );
};

export default GalleryEmptyState;
