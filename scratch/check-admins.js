
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'project-x-f46f0'
  });
}

const db = admin.firestore();

async function checkAdmins() {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'admin').get();
    if (snapshot.empty) {
      console.log('No users with "role: admin" found in Firestore.');
    } else {
      console.log('Users with "role: admin" in Firestore:');
      snapshot.forEach(doc => {
        console.log(`- ${doc.data().email || doc.id}`);
      });
    }
  } catch (error) {
    console.error('Error checking admins:', error.message);
  }
}

checkAdmins();
