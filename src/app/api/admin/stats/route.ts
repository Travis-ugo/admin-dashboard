import { NextResponse } from 'next/server';
import { getKnowledgeAnalytics } from '@/lib/data-service';

import { withAdminAuth } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (request: Request, _admin: any) => {
  try {
    const analytics = await getKnowledgeAnalytics();
    return NextResponse.json(analytics.stats);
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
});
