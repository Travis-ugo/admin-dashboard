
const admin = require('firebase-admin');

// Ensure you have FIREBASE_PROJECT_ID set or it defaults
const projectId = 'project-x-f46f0';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
  });
}

const db = admin.firestore();

async function testFetch() {
  try {
    const collections = ['users', 'feedbacks', 'imports', 'help_articles'];
    for (const col of collections) {
      const snapshot = await db.collection(col).limit(1).get();
      console.log(`Collection '${col}': ${snapshot.empty ? 'Empty' : 'Has data (' + snapshot.size + ' doc found)'}`);
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    if (error.message.includes('credential')) {
      console.log('Hint: You might need to run `gcloud auth application-default login` or provide a service account.');
    }
  }
}

testFetch();
