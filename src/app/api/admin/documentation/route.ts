import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { withAdminAuth } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

const DOC_PATH = 'system_documentation/detailed_documentation';

export const GET = withAdminAuth(async (request: Request, _admin: any) => {
  try {
    const docSnap = await db.doc(DOC_PATH).get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Documentation not found' }, { status: 404 });
    }

    return NextResponse.json(docSnap.data());
  } catch (error: any) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json({ error: 'Failed to fetch documentation' }, { status: 500 });
  }
});
