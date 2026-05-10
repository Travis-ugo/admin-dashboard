import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/data-service';

import { withAdminAuth } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (request: Request, _admin: any) => {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});
