import admin from 'firebase-admin';
import * as path from 'path';
import { readFileSync } from 'fs';

try {
  // Load service account from JSON file
  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
  
  // Check if file exists
  try {
    readFileSync(serviceAccountPath);
    console.log(' Found Firebase service account file');
  } catch (error) {
    console.error(' Firebase service account file not found at:', serviceAccountPath);
    console.log(' Please download it from Firebase Console > Project Settings > Service Accounts');
    throw error;
  }

  const serviceAccountRaw = readFileSync(serviceAccountPath, 'utf8');
  let serviceAccount: any;
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } catch (parseError) {
    console.error(' Failed to parse Firebase service account JSON:', parseError);
    throw parseError;
  }

  // Initialize Firebase Admin
  if (!admin.apps || admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log(' Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error(' Failed to initialize Firebase Admin:', error);
  throw error;
}

export default admin;