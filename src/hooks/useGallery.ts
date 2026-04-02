import { useCallback, useEffect, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useDropzone } from 'react-dropzone';
import { getUserGallery, saveUserGallery } from '../services/gallery.service';
import type { GalleryImage, GallerySaveStatus } from '../types/gallery';
import {
  createGalleryImage,
  markPrimaryImage,
  MAX_GALLERY_IMAGES,
  removeGalleryImage,
  updateGalleryCaption,
} from '../utils/gallery.mapper';

const SAVE_STATUS_RESET_MS = 3000;

interface UseGalleryOptions {
  userId?: string;
  authLoading: boolean;
}

export const useGallery = ({ userId, authLoading }: UseGalleryOptions) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<GallerySaveStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  useEffect(() => {
    const loadGallery = async () => {
      if (!userId) {
        setImages([]);
        setIsGalleryLoading(false);
        return;
      }

      setIsGalleryLoading(true);

      try {
        const savedImages = await getUserGallery(userId);
        setImages(savedImages);
      } catch (error) {
        console.error('Failed to load gallery:', error);
      } finally {
        setIsGalleryLoading(false);
      }
    };

    if (!authLoading) {
      void loadGallery();
    }
  }, [authLoading, userId]);

  useEffect(() => {
    if (!saveStatus || saveStatus.kind === 'info') {
      return;
    }

    const timer = window.setTimeout(() => {
      setSaveStatus(null);
    }, SAVE_STATUS_RESET_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [saveStatus]);

  const canUpload = useMemo(() => images.length < MAX_GALLERY_IMAGES, [images.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!canUpload) {
        return;
      }

      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : null;
        setSelectedFile(result);
        setIsCropperOpen(Boolean(result));
      };
      reader.readAsDataURL(file);
    },
    [canUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: !canUpload,
  });

  const closeCropper = useCallback(() => {
    setIsCropperOpen(false);
    setSelectedFile(null);
  }, []);

  const handleCropComplete = useCallback(
    (base64: string) => {
      if (!base64) {
        closeCropper();
        return;
      }

      setImages((previousImages) => [
        ...previousImages,
        createGalleryImage(base64, previousImages.length === 0),
      ]);
      closeCropper();
    },
    [closeCropper]
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImages((previousImages) => removeGalleryImage(previousImages, id));
  }, []);

  const handleSetPrimary = useCallback((id: string) => {
    setImages((previousImages) => markPrimaryImage(previousImages, id));
  }, []);

  const handleCaptionChange = useCallback((id: string, caption: string) => {
    setImages((previousImages) => updateGalleryCaption(previousImages, id, caption));
  }, []);

  const handleReorder = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) {
      return;
    }

    setImages((previousImages) => {
      const oldIndex = previousImages.findIndex((image) => image.id === activeId);
      const newIndex = previousImages.findIndex((image) => image.id === overId);

      if (oldIndex < 0 || newIndex < 0) {
        return previousImages;
      }

      return arrayMove(previousImages, oldIndex, newIndex);
    });
  }, []);

  const handleSaveGallery = useCallback(async () => {
    if (!userId) {
      setSaveStatus({ kind: 'error', message: 'User not authenticated.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ kind: 'info', message: 'Saving...' });

    try {
      await saveUserGallery(userId, images);
      setSaveStatus({ kind: 'success', message: 'Gallery saved successfully!' });
    } catch (error) {
      console.error('Failed to save gallery:', error);
      setSaveStatus({ kind: 'error', message: 'Failed to save gallery.' });
    } finally {
      setIsSaving(false);
    }
  }, [images, userId]);

  return {
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
  };
};
