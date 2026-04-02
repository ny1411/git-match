import type { GalleryImage, StoredGalleryImage } from '../types/gallery';

export const MAX_GALLERY_IMAGES = 6;

export const createGalleryImageId = () => Math.random().toString(36).slice(2, 11);

const hasValue = <T>(value: T | null | undefined): value is T => value !== null && value !== undefined;

export const normalizeGalleryImages = (gallery: unknown): GalleryImage[] => {
  if (!Array.isArray(gallery)) {
    return [];
  }

  const normalized = gallery
    .map((rawImage): GalleryImage | null => {
      const image = rawImage as StoredGalleryImage;

      if (typeof image === 'string') {
        const src = image.trim();
        return src
          ? {
              id: createGalleryImageId(),
              src,
              caption: '',
              isPrimary: false,
            }
          : null;
      }

      if (!image || typeof image !== 'object') {
        return null;
      }

      const src = image.src?.trim();
      if (!src) {
        return null;
      }

      return {
        id: image.id?.trim() || createGalleryImageId(),
        src,
        caption: image.caption?.trim() || '',
        isPrimary: Boolean(image.isPrimary),
      };
    })
    .filter(hasValue);

  if (normalized.length === 0) {
    return normalized;
  }

  if (normalized.some((image) => image.isPrimary)) {
    return normalized;
  }

  return normalized.map((image, index) => ({
    ...image,
    isPrimary: index === 0,
  }));
};

export const createGalleryImage = (src: string, isPrimary = false): GalleryImage => ({
  id: createGalleryImageId(),
  src,
  caption: '',
  isPrimary,
});

export const markPrimaryImage = (images: GalleryImage[], id: string) =>
  images.map((image) => ({
    ...image,
    isPrimary: image.id === id,
  }));

export const removeGalleryImage = (images: GalleryImage[], id: string) => {
  const removedImage = images.find((image) => image.id === id);
  const nextImages = images.filter((image) => image.id !== id);

  if (nextImages.length === 0) {
    return nextImages;
  }

  if (removedImage?.isPrimary) {
    return nextImages.map((image, index) => ({
      ...image,
      isPrimary: index === 0,
    }));
  }

  return nextImages;
};

export const updateGalleryCaption = (images: GalleryImage[], id: string, caption: string) =>
  images.map((image) => (image.id === id ? { ...image, caption } : image));

export const resolvePrimaryGalleryImage = (images: GalleryImage[]): string | null => {
  const primaryImage = images.find((image) => image.isPrimary);
  return primaryImage?.src || images[0]?.src || null;
};

export const upsertPrimaryGalleryImage = (images: GalleryImage[], src: string): GalleryImage[] => {
  if (!images.length) {
    return [
      {
        id: createGalleryImageId(),
        src,
        caption: '',
        isPrimary: true,
      },
    ];
  }

  const primaryIndex = images.findIndex((image) => image.isPrimary);
  const targetIndex = primaryIndex >= 0 ? primaryIndex : 0;

  return images.map((image, index) => ({
    ...image,
    src: index === targetIndex ? src : image.src,
    isPrimary: index === targetIndex,
  }));
};
