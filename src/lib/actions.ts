"use server";

import * as admin from 'firebase-admin';
import { db } from './firebase-admin';
import { revalidatePath } from 'next/cache';

export async function updateFeedbackStatus(id: string, status: string) {
  try {
    await db.collection('feedbacks').doc(id).update({
      status: status,
      updated_at: new Date(),
    });
    revalidatePath('/dashboard/feedback');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating feedback status:', error);
    return { success: false, error: error.message };
  }
}

export async function addFeedbackReply(id: string, reply: { text: string; sender: string }) {
  try {
    const feedbackRef = db.collection('feedbacks').doc(id);
    
    await feedbackRef.update({
      replies: admin.firestore.FieldValue.arrayUnion({
        ...reply,
        time: new Date(),
      }),
      status: 'In Progress'
    });
    
    revalidatePath('/dashboard/feedback');
    return { success: true };
  } catch (error: any) {
    console.error('Error adding feedback reply:', error);
    return { success: false, error: error.message };
  }
}

export async function saveFaq(id: string | null, data: any) {
  try {
    if (id) {
      await db.collection('faqs').doc(id).update({
        ...data,
        updated_at: new Date(),
      });
    } else {
      await db.collection('faqs').add({
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
    revalidatePath('/dashboard/support');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving FAQ:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteFaq(id: string) {
  try {
    await db.collection('faqs').doc(id).delete();
    revalidatePath('/dashboard/support');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return { success: false, error: error.message };
  }
}
