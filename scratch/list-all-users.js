
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'project-x-f46f0'
  });
}

async function listAllUsers() {
  try {
    console.log('--- Firebase Auth Users ---');
    const authResult = await admin.auth().listUsers(10);
    authResult.users.forEach(user => {
      console.log(`UID: ${user.uid} | Email: ${user.email} | Claims: ${JSON.stringify(user.customClaims || {})}`);
    });

    console.log('\n--- Firestore User Documents ---');
    const db = admin.firestore();
    const snapshot = await db.collection('users').get();
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`UID: ${doc.id} | Email: ${data.email} | Role: ${data.role || 'none'}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAllUsers();
