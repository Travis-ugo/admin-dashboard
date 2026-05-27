import * as admin from 'firebase-admin';

// Initialize Firebase Admin with the project ID and credentials
if (!admin.apps.length) {
  try {
    let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountStr) {
      serviceAccountStr = serviceAccountStr.trim();
      if (serviceAccountStr.startsWith('"') && serviceAccountStr.endsWith('"')) {
        serviceAccountStr = serviceAccountStr.substring(1, serviceAccountStr.length - 1);
      } else if (serviceAccountStr.startsWith("'") && serviceAccountStr.endsWith("'")) {
        serviceAccountStr = serviceAccountStr.substring(1, serviceAccountStr.length - 1);
      }
    }

    const serviceAccount = serviceAccountStr ? JSON.parse(serviceAccountStr) : undefined;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'project-x-f46f0',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
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
