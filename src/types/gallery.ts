export interface GalleryImage {
  id: string;
  src: string;
  caption: string;
  isPrimary: boolean;
}

export type StoredGalleryImage = Partial<GalleryImage> | string;

export interface GallerySaveStatus {
  kind: 'info' | 'success' | 'error';
  message: string;
}
