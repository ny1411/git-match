import { type FC } from 'react';
import GalleryEmptyState from '../components/gallery/GalleryEmptyState';
import GalleryGrid from '../components/gallery/GalleryGrid';
import GalleryHeader from '../components/gallery/GalleryHeader';
import GallerySaveStatusToast from '../components/gallery/GallerySaveStatusToast';
import BgGradient from '../components/ui/BgGradient';
import { CropperModal } from '../components/ui/CropperModal';
import { useAuth } from '../hooks/useAuth';
import { useGallery } from '../hooks/useGallery';
import { useNavigate } from 'react-router-dom';

const Gallery: FC = () => {
  const navigate = useNavigate();
  const { userProfile, isLoading: authLoading } = useAuth();

  const {
    images,
    isGalleryLoading,
    isSaving,
    saveStatus,
    selectedFile,
    isCropperOpen,
    canUpload,
    getRootProps,
    getInputProps,
    closeCropper,
    handleCropComplete,
    handleSaveGallery,
    handleRemoveImage,
    handleSetPrimary,
    handleCaptionChange,
    handleReorder,
  } = useGallery({
    userId: userProfile?.uid,
    authLoading,
  });

  if (authLoading || isGalleryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#100f17] text-sm text-gray-300">
        Loading gallery...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      <BgGradient />

      {isCropperOpen && selectedFile ? (
        <CropperModal
          imageSrc={selectedFile}
          onCancel={closeCropper}
          onCropComplete={handleCropComplete}
        />
      ) : null}

      <main className="relative z-10 container mx-auto flex flex-col items-center px-4 py-12">
        <GalleryHeader
          isSaving={isSaving}
          onBack={() => {
            navigate('/dashboard');
          }}
          onSave={() => {
            void handleSaveGallery();
          }}
        />

        {saveStatus ? <GallerySaveStatusToast status={saveStatus} /> : null}

        <GalleryGrid
          images={images}
          canUpload={canUpload}
          onReorder={handleReorder}
          onRemoveImage={handleRemoveImage}
          onSetPrimary={handleSetPrimary}
          onCaptionChange={handleCaptionChange}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
        />

        {images.length === 0 ? <GalleryEmptyState /> : null}
      </main>
    </div>
  );
};

export default Gallery;
