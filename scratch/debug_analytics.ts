import { db } from '../src/lib/firebase-admin';

async function test() {
  try {
    await db.collectionGroup('notes').limit(10).orderBy('created_at', 'desc').get();
  } catch (e: any) {
    console.log('MESSAGE:', e.message);
  }
}

test();
