import { db } from '../src/lib/firebase-admin';

async function checkConnection() {
  console.log('Checking Firebase connection...');
  try {
    const collections = await db.listCollections();
    console.log('Successfully connected to Firestore!');
    console.log('Collections:', collections.map((c: any) => c.id));
    
    if (collections.length === 0) {
      console.log('Warning: No collections found. The database might be empty or the project might be wrong.');
    }
  } catch (error: any) {
    console.error('Firebase Connection Error:', error.message);
  }
}

checkConnection();
