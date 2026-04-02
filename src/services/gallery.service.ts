import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { GalleryImage } from '../types/gallery';
import { normalizeGalleryImages } from '../utils/gallery.mapper';

export const getUserGallery = async (userId: string): Promise<GalleryImage[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return [];
    }

    return normalizeGalleryImages(snapshot.data().gallery);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }
};

export const saveUserGallery = async (userId: string, galleryImages: GalleryImage[]) => {
  try {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      gallery: galleryImages,
    });
  } catch (error) {
    console.error('Error saving gallery:', error);
    throw error;
  }
};
