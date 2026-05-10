import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { withAdminAuth } from '@/lib/auth-middleware';

export const GET = withAdminAuth(async (request: Request, _admin: any) => {
  const results = {
    firebase: { status: 'unknown', error: null as string | null },
    collections: {
      users: { status: 'unknown', count: 0, error: null as string | null },
      feedbacks: { status: 'unknown', count: 0, error: null as string | null },
      help_articles: { status: 'unknown', count: 0, error: null as string | null },
    }
  };

  const hasCreds = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || 
                   (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) ||
                   process.env.FIREBASE_PROJECT_ID;

  if (!hasCreds) {
    results.firebase.status = 'mock_mode';
    results.firebase.error = 'No Firebase credentials found in environment.';
    return NextResponse.json(results);
  }

  try {
    await db.listCollections();
    results.firebase.status = 'connected';
    
    const collectionsToTest = ['users', 'feedbacks', 'help_articles'] as const;
    
    for (const colName of collectionsToTest) {
      try {
        await db.collection(colName).limit(1).get();
        results.collections[colName].status = 'reachable';
      } catch (err: any) {
        results.collections[colName].status = 'error';
        results.collections[colName].error = err.message;
      }
    }
  } catch (err: any) {
    results.firebase.status = 'failed';
    results.firebase.error = err.message;
  }

  return NextResponse.json(results);
});
