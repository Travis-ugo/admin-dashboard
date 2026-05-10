
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'project-x-f46f0'
  });
}

const db = admin.firestore();

async function listUsers() {
  try {
    const snapshot = await db.collection('users').limit(10).get();
    if (snapshot.empty) {
      console.log('No users found in Firestore.');
      return;
    }
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`UID: ${doc.id} | Email: ${data.email || 'N/A'} | Name: ${data.name || 'N/A'}`);
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
  }
}

listUsers();
