
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'project-x-f46f0'
  });
}

async function setAdminByEmail(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    
    console.log(`Found user: ${email} (UID: ${uid})`);
    
    // Set custom user claims
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    
    // Update Firestore for visibility in the app
    const db = admin.firestore();
    await db.collection('users').doc(uid).set({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`Successfully set ${email} as admin.`);
    
    // Verify
    const updatedUser = await admin.auth().getUser(uid);
    console.log('Current custom claims:', updatedUser.customClaims);
    
  } catch (error) {
    console.error('Error setting admin:', error.message);
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node set-admin-email.js <email>');
  process.exit(1);
}

setAdminByEmail(email);
