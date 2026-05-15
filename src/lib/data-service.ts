import { db } from './firebase-admin';

/**
 * Data Service to fetch admin dashboard components.
 * Fetches real data from Firestore.
 */

export async function getUsers() {
  const snapshot = await db.collection('users').limit(200).get();
  
  // Fetch note counts in parallel for all users
  const userPromises = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const userId = doc.id;
    
    // Attempt to get note count
    let noteCount = 0;
    try {
      // Use count() for efficiency - avoids downloading all documents
      const notesSnap = await db.collection('knowledge_items').doc(userId).collection('notes').count().get();
      noteCount = notesSnap.data().count;
    } catch (e) {
      // Ignore errors (e.g. collection doesn't exist)
    }

    return { 
      id: userId, 
      email: data.email || 'No email',
      name: data.name || data.display_name || data.displayName || '',
      createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      status: 'active', // Defaulting to active as there is no status field yet
      noteCount: noteCount
    };
  });

  return Promise.all(userPromises);
}

export async function getFeedback() {
  const snapshot = await db.collection('feedbacks').orderBy('created_at', 'desc').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const createdAt = data.created_at?.toDate?.() || new Date();
    return { 
      id: doc.id, 
      user_id: data.user_id,
      user_name: data.user_name || 'Anonymous User',
      user_email: data.user_email || 'No email provided',
      content: data.content || '',
      type: data.type || 'general',
      status: data.status || 'New',
      time: createdAt.toLocaleString(),
      created_at: createdAt.toISOString(),
      messages: data.messages || []
    };
  });
}

export async function getHelpArticles() {
  const snapshot = await db.collection('help_articles').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      created_at: data.created_at?.toDate?.()?.toISOString() || null,
      updated_at: data.updated_at?.toDate?.()?.toISOString() || null,
    };
  });
}

export async function getFaqs() {
  const snapshot = await db.collection('faqs').orderBy('order', 'asc').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      created_at: data.created_at?.toDate?.()?.toISOString() || null,
      updated_at: data.updated_at?.toDate?.()?.toISOString() || null,
    };
  });
}

export async function getFaq(id: string) {
  const doc = await db.collection('faqs').doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return { 
    id: doc.id, 
    ...data,
    created_at: data?.created_at?.toDate?.()?.toISOString() || null,
    updated_at: data?.updated_at?.toDate?.()?.toISOString() || null,
  };
}

export async function getKnowledgeAnalytics() {
  let recentNotes: any[] = [];
  let recentImports: any[] = [];
  const stats = {
    totalUsers: 0,
    totalNotes: 0,
    totalImports: 0,
    unreadFeedback: 0
  };

  // 1. Fetch Recent Notes (Collection Group)
  try {
    const notesSnapshot = await db.collectionGroup('notes')
      .orderBy('created_at', 'desc')
      .limit(10)
      .get();
    
    recentNotes = notesSnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.created_at?.toDate?.() || new Date();
      return { 
        id: doc.id, 
        title: data.title || 'Untitled Note',
        source: data.source || 'mobile',
        node: data.node_id || 'primary',
        status: 'Synced',
        time: createdAt.toLocaleString(),
        created_at: createdAt.toISOString()
      };
    });
  } catch (error: any) {
    console.warn('[DataService] Recent notes fetch failed (index likely missing):', error.message);
  }

  // 2. Fetch Recent Imports
  try {
    const importsSnapshot = await db.collection('imports')
      .orderBy('created_at', 'desc')
      .limit(5)
      .get();
    
    recentImports = importsSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        userId: data.user_id,
        itemsCreated: data.items_created || 0,
        type: data.type || 'os_notes',
        created_at: data.created_at?.toDate?.()?.toISOString() || null,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || null,
      };
    });
  } catch (error: any) {
    console.warn('[DataService] Recent imports fetch failed:', error.message);
  }

  // 3. Fetch Global Stats using optimized count()
  try {
    // Each count() is independent to be resilient
    try {
      const usersSnap = await db.collection('users').count().get();
      stats.totalUsers = usersSnap.data().count;
    } catch (e: any) { console.warn('Users count failed:', e.message); }

    try {
      const importsSnap = await db.collection('imports').count().get();
      stats.totalImports = importsSnap.data().count;
    } catch (e: any) { console.warn('Imports count failed:', e.message); }

    try {
      const totalNotesSnap = await db.collectionGroup('notes').count().get();
      stats.totalNotes = totalNotesSnap.data().count;
    } catch (e: any) { console.warn('Total notes count failed:', e.message); }

    try {
      const unreadSnap = await db.collection('feedbacks').where('status', 'in', ['New', 'user_replied']).count().get();
      stats.unreadFeedback = unreadSnap.data().count;
    } catch (e: any) { console.warn('Unread feedback count failed:', e.message); }
  } catch (error: any) {
    console.warn('[DataService] Stats aggregation failed:', error.message);
  }

  return {
    recentNotes,
    recentImports,
    stats
  };
}

export async function getImports() {
  const snapshot = await db.collection('imports').orderBy('created_at', 'desc').limit(50).get();
  
  // 1. Extract unique user IDs
  const userIds = Array.from(new Set(snapshot.docs.map(doc => doc.data().user_id).filter(Boolean))) as string[];
  
  // 2. Fetch user documents in parallel
  const userMap: { [key: string]: { name: string; email: string } } = {};
  if (userIds.length > 0) {
    const userDocs = await Promise.all(
      userIds.map(uid => db.collection('users').doc(uid).get())
    );
    userDocs.forEach(doc => {
      if (doc.exists) {
        const data = doc.data() || {};
        userMap[doc.id] = {
          name: data.name || data.display_name || data.displayName || 'Unknown User',
          email: data.email || 'No email'
        };
      } else {
        userMap[doc.id] = {
          name: 'Unknown User',
          email: 'No email'
        };
      }
    });
  }

  // 3. Map imports and attach user info
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const userId = data.user_id || '';
    const userInfo = userMap[userId] || { name: 'Unknown User', email: 'No email' };
    
    // Map provider names cleanly
    const providerMap: { [key: string]: string } = {
      'os_notes': 'Apple Notes',
      'google_keep': 'Google Keep',
      'chatgpt': 'ChatGPT Export',
      'claude': 'Claude Export',
      'gemini': 'Gemini Export'
    };
    const provider = providerMap[data.type] || data.type || 'Unknown Source';

    return {
      id: doc.id,
      userId: userId,
      userName: userInfo.name,
      userEmail: userInfo.email,
      status: data.status || 'Pending',
      createdAt: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString(),
      type: data.type || 'os_notes',
      provider: provider,
      itemCount: data.items_created !== undefined ? data.items_created : (data.itemCount || 0),
    };
  });
}
