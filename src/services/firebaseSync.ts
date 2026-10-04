import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, testFirestoreConnection } from '../lib/firebase.ts';
import {
  WebsiteSettings,
  Subject,
  Category,
  Lesson,
  LessonMaterial
} from '../types/index.ts';
import {
  initialSettings,
  initialCategories,
  initialSubjects,
  initialLessons,
  initialMaterials
} from '../../server/data.ts';

function sanitizeForFirestore<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Save settings directly to Google Cloud Firestore datastore
 */
export async function saveSettingsToFirestore(settings: WebsiteSettings): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'global');
    await setDoc(
      docRef,
      sanitizeForFirestore({
        ...settings,
        updatedAt: new Date().toISOString()
      }),
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('[Google Cloud Firestore] Failed to save settings to cloud:', error);
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
    console.warn('[Google Cloud Firestore] Error loading settings from cloud:', error);
  }
  return null;
}

/**
 * Save or update a single Category in Google Cloud Firestore
 */
export async function saveCategoryToFirestore(category: Category): Promise<boolean> {
  try {
    await setDoc(doc(db, 'categories', category.id), sanitizeForFirestore(category), { merge: true });
    return true;
  } catch (error) {
    console.warn('[Google Cloud Firestore] Failed to save category:', error);
    return false;
  }
}

export async function deleteCategoryFromFirestore(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'categories', id));
    return true;
  } catch (error) {
    console.warn('[Google Cloud Firestore] Failed to delete category:', error);
    return false;
  }
}

/**
 * Save or update a single Subject in Google Cloud Firestore
 */
export async function saveSubjectToFirestore(subject: Subject): Promise<boolean> {
  try {
    await setDoc(doc(db, 'subjects', subject.id), sanitizeForFirestore(subject), { merge: true });
    return true;
  } catch (error) {
    console.warn('[Google Cloud Firestore] Failed to save subject:', error);
    return false;
  }
}

export async function deleteSubjectFromFirestore(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'subjects', id));
    return true;
  } catch (error) {
    console.warn('[Google Cloud Firestore] Failed to delete subject:', error);
    return false;
  }
}

/**
 * Save or update a single Lesson in Google Cloud Firestore
 */
export async function saveLessonToFirestore(lesson: Lesson): Promise<boolean> {
  try {
    await setDoc(doc(db, 'lessons', lesson.id), sanitizeForFirestore(lesson), { merge: true });
    return true;
  } catch (error) {
    console.warn('[Google Cloud Firestore] Failed to save lesson:', error);
    return false;
  }
}

export async function deleteLessonFromFirestore(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'lessons', id));
    return true;
  } catch (error) {
    console.warn('[Google Cloud Firestore] Failed to delete lesson:', error);
    return false;
  }
}

/**
 * Save or update a single Material in Google Cloud Firestore
 */
export async function saveMaterialToFirestore(material: LessonMaterial): Promise<boolean> {
  try {
    await setDoc(doc(db, 'materials', material.id), sanitizeForFirestore(material), { merge: true });
    return true;
  } catch (error) {
    console.warn('[Google Cloud Firestore] Failed to save material:', error);
    return false;
  }
}

export async function deleteMaterialFromFirestore(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'materials', id));
    return true;
  } catch (error) {
    console.warn('[Google Cloud Firestore] Failed to delete material:', error);
    return false;
  }
}

/**
 * Export and sync all subjects, categories, lessons, materials, and settings to Google Cloud Firestore
 */
export async function syncAllToGoogleFirestore(
  subjects: Subject[],
  categories: Category[],
  settings: WebsiteSettings,
  lessons?: Lesson[],
  materials?: LessonMaterial[]
) {
  try {
    // 1. Save global settings
    await saveSettingsToFirestore(settings);

    // 2. Batch write categories
    const catBatch = writeBatch(db);
    categories.forEach(cat => {
      const ref = doc(db, 'categories', cat.id);
      catBatch.set(ref, sanitizeForFirestore(cat), { merge: true });
    });
    await catBatch.commit();

    // 3. Batch write subjects (chunks of 20)
    for (let i = 0; i < subjects.length; i += 20) {
      const chunk = subjects.slice(i, i + 20);
      const subBatch = writeBatch(db);
      chunk.forEach(sub => {
        const ref = doc(db, 'subjects', sub.id);
        subBatch.set(ref, sanitizeForFirestore(sub), { merge: true });
      });
      await subBatch.commit();
    }

    // 4. Batch write lessons if provided (chunks of 15)
    const lessonsToSync = lessons || initialLessons;
    for (let i = 0; i < lessonsToSync.length; i += 15) {
      const chunk = lessonsToSync.slice(i, i + 15);
      const lesBatch = writeBatch(db);
      chunk.forEach(les => {
        const ref = doc(db, 'lessons', les.id);
        lesBatch.set(ref, sanitizeForFirestore(les), { merge: true });
      });
      await lesBatch.commit();
    }

    // 5. Batch write materials if provided
    const materialsToSync = materials || initialMaterials;
    if (materialsToSync.length > 0) {
      for (let i = 0; i < materialsToSync.length; i += 20) {
        const chunk = materialsToSync.slice(i, i + 20);
        const matBatch = writeBatch(db);
        chunk.forEach(mat => {
          const ref = doc(db, 'materials', mat.id);
          matBatch.set(ref, sanitizeForFirestore(mat), { merge: true });
        });
        await matBatch.commit();
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Google Cloud Firestore] Sync error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Load all persisted data from Google Cloud Firestore, or automatically seed Firestore if empty
 */
export async function loadOrSeedGoogleFirestore(): Promise<{
  settings: WebsiteSettings | null;
  categories: Category[];
  subjects: Subject[];
  lessons: Lesson[];
  materials: LessonMaterial[];
}> {
  try {
    const [settingsSnap, catSnap, subSnap, lesSnap, matSnap] = await Promise.all([
      getDoc(doc(db, 'settings', 'global')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'subjects')),
      getDocs(collection(db, 'lessons')),
      getDocs(collection(db, 'materials'))
    ]);

    const cloudSettings = settingsSnap.exists() ? (settingsSnap.data() as WebsiteSettings) : null;
    const cloudCategories = catSnap.docs.map(d => d.data() as Category);
    const cloudSubjects = subSnap.docs.map(d => d.data() as Subject);
    const cloudLessons = lesSnap.docs.map(d => d.data() as Lesson);
    const cloudMaterials = matSnap.docs.map(d => d.data() as LessonMaterial);

    // If cloud database has not been seeded yet, seed it automatically in background so hosting never loses initial data!
    if (!cloudSettings || cloudSubjects.length === 0) {
      syncAllToGoogleFirestore(
        initialSubjects,
        initialCategories,
        initialSettings,
        initialLessons,
        initialMaterials
      ).catch(e => console.warn('[Google Cloud Firestore] Auto-seed background notice:', e));
    }

    return {
      settings: cloudSettings,
      categories: cloudCategories,
      subjects: cloudSubjects,
      lessons: cloudLessons,
      materials: cloudMaterials
    };
  } catch (error) {
    console.warn('[Google Cloud Firestore] Could not load from cloud, using bundled data:', error);
    return {
      settings: null,
      categories: [],
      subjects: [],
      lessons: [],
      materials: []
    };
  }
}

export { testFirestoreConnection };
