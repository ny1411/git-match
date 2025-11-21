import admin from '../firebase/admin.js';

export class StorageService {
  // Convert base64 to buffer and upload to Firebase Storage
  static async uploadBase64Image(base64String: string, userId: string, fileName: string = 'profile.jpg'): Promise<string> {
    try {
      const bucket = admin.storage().bucket();
      
      // Extract base64 data (remove data:image/...;base64, prefix)
      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
      }
      
      const imageBuffer = Buffer.from(matches[2], 'base64');
      const filePath = `profile-images/${userId}/${fileName}`;
      const file = bucket.file(filePath);
      
      // Upload the file
      await file.save(imageBuffer, {
        metadata: {
          contentType: matches[1],
          metadata: {
            firebaseStorageDownloadTokens: userId,
          }
        },
        public: true
      });
      
      // Generate public URL
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${userId}`;
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Delete existing profile image
  static async deleteProfileImage(userId: string): Promise<void> {
    try {
      const bucket = admin.storage().bucket();
      const filePath = `profile-images/${userId}/`;
      const [files] = await bucket.getFiles({ prefix: filePath });
      
      await Promise.all(files.map(file => file.delete()));
    } catch (error) {
      console.error('Error deleting profile image:', error);
      throw new Error('Failed to delete profile image');
    }
  }
}