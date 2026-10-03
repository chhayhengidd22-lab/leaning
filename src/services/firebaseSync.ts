import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db, testFirestoreConnection } from '../lib/firebase.ts';
import { WebsiteSettings, Subject, Category } from '../types/index.ts';

const SETTINGS_DOC_PATH = 'settings/global';

/**
 * Save settings directly to Google Cloud Firestore datastore
 */
export async function saveSettingsToFirestore(settings: WebsiteSettings): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'global');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('[Google Cloud Firestore] Settings saved to cloud datastore.');
    return true;
  } catch (error) {
    console.error('[Google Cloud Firestore] Failed to save settings to cloud:', error);
    return false;
  }
}

/**
 * Load settings directly from Google Cloud Firestore datastore
 */
export async function getSettingsFromFirestore(): Promise<WebsiteSettings | null> {
  try {
    const docRef = doc(db, 'settings', 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as WebsiteSettings;
    }
  } catch (error) {
    console.warn('[Google Cloud Firestore] Error loading settings from cloud, falling back to local:', error);
  }
  return null;
}

/**
 * Export and sync all subjects and categories to Google Cloud Firestore
 */
export async function syncAllToGoogleFirestore(subjects: Subject[], categories: Category[], settings: WebsiteSettings) {
  try {
    // 1. Save global settings
    await saveSettingsToFirestore(settings);

    // 2. Batch write categories
    const catBatch = writeBatch(db);
    categories.forEach(cat => {
      const ref = doc(db, 'categories', cat.id);
      catBatch.set(ref, cat, { merge: true });
    });
    await catBatch.commit();

    // 3. Batch write subjects (chunks of 20)
    for (let i = 0; i < subjects.length; i += 20) {
      const chunk = subjects.slice(i, i + 20);
      const subBatch = writeBatch(db);
      chunk.forEach(sub => {
        const ref = doc(db, 'subjects', sub.id);
        subBatch.set(ref, sub, { merge: true });
      });
      await subBatch.commit();
    }

    console.log('[Google Cloud Firestore] All curriculum and settings successfully synced to Google Cloud!');
    return { success: true };
  } catch (err: any) {
    console.error('[Google Cloud Firestore] Sync error:', err);
    return { success: false, error: err.message };
  }
}

export { testFirestoreConnection };
