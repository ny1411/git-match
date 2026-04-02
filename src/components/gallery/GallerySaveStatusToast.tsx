import React from 'react';
import type { GallerySaveStatus } from '../../types/gallery';

interface GallerySaveStatusToastProps {
  status: GallerySaveStatus;
}

const statusStyles: Record<GallerySaveStatus['kind'], string> = {
  info: 'border-blue-500/30 bg-blue-900/80 text-blue-200',
  success: 'border-green-500/30 bg-green-900/80 text-green-200',
  error: 'border-red-500/30 bg-red-900/80 text-red-200',
};

const GallerySaveStatusToast: React.FC<GallerySaveStatusToastProps> = ({ status }) => {
  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-lg border px-4 py-2 backdrop-blur-md ${statusStyles[status.kind]}`}
    >
      {status.message}
    </div>
  );
};

export default GallerySaveStatusToast;
