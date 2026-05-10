import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { withAdminAuth } from '@/lib/auth-middleware';

export const PATCH = withAdminAuth(async (
  request: Request,
  _admin: any,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminReply } = body;

    const feedbackRef = db.collection('feedbacks').doc(id);
    const doc = await feedbackRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (adminReply) {
      updates.admin_reply = adminReply;
      updates.user_read = false; // Mark as unread for the user
      
      // Also add to messages array for threading
      updates.messages = FieldValue.arrayUnion({
        sender: 'admin',
        text: adminReply,
        timestamp: Date.now()
      });
    }
    updates.updated_at = new Date();

    await feedbackRef.update(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
});
