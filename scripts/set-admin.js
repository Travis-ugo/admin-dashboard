const admin = require('firebase-admin');

// 1. IMPORTANT: Replace this with your service account json
// or set the GOOGLE_APPLICATION_CREDENTIALS environment variable
const serviceAccount = require('./service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'project-x-f46f0'
  });
}

/**
 * Sets the 'admin' custom claim for a user.
 * This claim can be checked in Firebase Auth tokens.
 * @param {string} uid The user's UID.
 */
async function setAdminRole(uid) {
  try {
    // Set custom user claims
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    // Also update the Firestore user profile for ease of access
    const db = admin.firestore();
    await db.collection('users').doc(uid).set({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`Successfully set as Superuser: ${uid}`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting superuser:', error);
    process.exit(1);
  }
}

// Get the UID from command line arguments
const uid = process.argv[2];
if (!uid) {
  console.log('Usage: node set-admin.js <UID>');
  process.exit(1);
}

setAdminRole(uid);
