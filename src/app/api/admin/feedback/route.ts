import { NextResponse } from 'next/server';
import { getFeedback } from '@/lib/data-service';

import { withAdminAuth } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (request: Request, _admin: any) => {
  try {
    const feedback = await getFeedback();
    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
});
