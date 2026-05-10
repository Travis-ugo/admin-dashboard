import { NextResponse } from 'next/server';
import { getImports } from '@/lib/data-service';

import { withAdminAuth } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (request: Request, _admin: any) => {
  try {
    const imports = await getImports();
    return NextResponse.json({ imports });
  } catch (error: any) {
    console.error('Error fetching imports:', error);
    return NextResponse.json({ error: 'Failed to fetch imports' }, { status: 500 });
  }
});
