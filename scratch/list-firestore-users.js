
const admin = require('firebase-admin');

// Explicitly set the project ID and ensure we are not using a quota project that is different
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'project-x-f46f0'
  });
}

const db = admin.firestore();

async function listFirestoreUsers() {
  try {
    console.log('--- Firestore User Documents (Project: project-x-f46f0) ---');
    const snapshot = await db.collection('users').get();
    if (snapshot.empty) {
      console.log('No users found.');
    }
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`UID: ${doc.id} | Email: ${data.email || 'N/A'} | Role: ${data.role || 'none'}`);
    });
  } catch (error) {
    console.error('Error fetching Firestore users:', error.message);
  }
}

listFirestoreUsers();
