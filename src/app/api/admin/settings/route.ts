import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { withAdminAuth } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

const SETTINGS_DOC_PATH = 'app_settings/general';

export const GET = withAdminAuth(async (request: Request, _admin: any) => {
  try {
    const docSnap = await db.doc(SETTINGS_DOC_PATH).get();
    
    if (!docSnap.exists) {
      // Return defaults if the document doesn't exist yet
      return NextResponse.json({
        privacyPolicy: '',
        termsOfService: '',
        supportEmail: 'support@zander.app'
      });
    }

    return NextResponse.json(docSnap.data());
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (request: Request, _admin: any) => {
  try {
    const body = await request.json();
    const { privacyPolicy, termsOfService, supportEmail } = body;

    // We allow empty strings, so just check for undefined
    if (privacyPolicy === undefined || termsOfService === undefined || supportEmail === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await db.doc(SETTINGS_DOC_PATH).set({
      privacyPolicy,
      termsOfService,
      supportEmail,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
});
