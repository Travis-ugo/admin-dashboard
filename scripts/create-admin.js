const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
// We'll try to use application default credentials or manual config if available
const projectId = 'project-x-f46f0';

if (!admin.apps.length) {
  // Try to find a service account file if it exists, otherwise use ADC
  const serviceAccountPath = path.join(__dirname, 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });
  } else {
    admin.initializeApp({
      projectId: projectId
    });
  }
}

async function createOrUpdateAdmin(email, password) {
  try {
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
      console.log(`Found existing user: ${user.uid}`);
      
      // Update password
      await admin.auth().updateUser(user.uid, {
        password: password
      });
      console.log('Updated password.');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        user = await admin.auth().createUser({
          email: email,
          password: password,
          emailVerified: true
        });
        console.log(`Created new user: ${user.uid}`);
      } else {
        throw error;
      }
    }

    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Set admin custom claim for ${email}`);

    // Update Firestore user document
    const db = admin.firestore();
    await db.collection('users').doc(user.uid).set({
      email: email,
      role: 'admin',
      isAdmin: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`Updated Firestore document for ${email}`);

    console.log('\nSuccess! You can now log in with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node create-admin.js <email> <password>');
  process.exit(1);
}

createOrUpdateAdmin(email, password);
