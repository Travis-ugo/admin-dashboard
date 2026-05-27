import { db } from '../src/lib/firebase-admin';

async function testFetch() {
  console.log('Fetching system_documentation/detailed_documentation...');
  try {
    const doc = await db.collection('system_documentation').doc('detailed_documentation').get();
    if (doc.exists) {
      console.log('SUCCESS: Document found!');
      console.log('Title:', doc.data()?.title);
      console.log('Content length:', doc.data()?.content?.length);
    } else {
      console.log('FAILURE: Document not found in Firestore.');
    }
  } catch (error: any) {
    console.error('Fetch Error:', error.message);
  }
}

testFetch();
