import { db } from '@/lib/firebase-admin';
import PrivacyClient from './PrivacyClient';

// Ensure this page runs dynamically so it fetches the latest data when someone visits
export const dynamic = 'force-dynamic';

export default async function PrivacyPolicyPage() {
  let content: string | null = null;
  
  try {
    const docSnap = await db.doc('app_settings/general').get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data && data.privacyPolicy && data.privacyPolicy.trim() !== '') {
        content = data.privacyPolicy;
      }
    }
  } catch (error) {
    console.error('Failed to fetch privacy policy from Firestore:', error);
    // If it fails, content stays null and it will fallback to default UI
  }

  return <PrivacyClient content={content} />;
}
