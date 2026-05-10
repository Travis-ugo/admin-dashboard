import * as admin from 'firebase-admin';

/**
 * Resilient helper to format the private key.
 * Handles surrounding quotes, literal '\n' or '\\n' escapes, 
 * and reconstructs standard PEM boundaries even if the parser squashed or stripped backslashes.
 */
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  
  // 1. Strip any accidental leading/trailing quotes
  let formatted = key.trim().replace(/^["']|["']$/g, '');
  
  // 2. Replace escaped \n sequences with real newlines
  formatted = formatted.replace(/\\n/g, '\n');
  
  // 3. Handle cases where the parser squashed everything into a single line
  if (formatted.includes('-----BEGIN PRIVATE KEY-----') && !formatted.includes('\n')) {
    const header = '-----BEGIN PRIVATE KEY-----';
    const footer = '-----END PRIVATE KEY-----';
    
    let body = formatted
      .replace(header, '')
      .replace(footer, '')
      .trim();
      
    // Strip accidental leading/trailing 'n' characters left over from stripped backslashes
    if (body.startsWith('n')) body = body.substring(1);
    if (body.endsWith('n')) body = body.substring(0, body.length - 1);
    
    // Standard PEM body lines are 64 characters long
    const lines = [];
    for (let i = 0; i < body.length; i += 64) {
      lines.push(body.substring(i, i + 64));
    }
    
    formatted = `${header}\n${lines.join('\n')}\n${footer}`;
  }
  
  return formatted;
}

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
          privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
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
