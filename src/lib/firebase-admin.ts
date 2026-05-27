import * as admin from 'firebase-admin';

// Initialize Firebase Admin with the project ID and credentials
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : undefined;

    if (serviceAccount || process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'project-x-f46f0',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // For local development, it can fall back to environment defaults if using ADC
      admin.initializeApp({
        projectId: 'project-x-f46f0',
      });
    }
    console.log('Firebase Admin initialized for project: project-x-f46f0');
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
