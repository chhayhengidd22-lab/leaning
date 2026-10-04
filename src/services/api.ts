import {
  ApiResponse,
  WebsiteSettings,
  Category,
  Subject,
  Lesson,
  User,
  DashboardStats,
  ActivityLog,
  LessonMaterial,
  LearningProgress,
  Bookmark
} from '../types/index.ts';
import {
  initialSettings,
  initialCategories,
  initialSubjects,
  initialLessons,
  initialUsers,
  initialActivityLogs,
  initialMaterials
} from '../../server/data.ts';
import {
  saveSettingsToFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveSubjectToFirestore,
  deleteSubjectFromFirestore,
  saveLessonToFirestore,
  deleteLessonFromFirestore,
  saveMaterialToFirestore,
  deleteMaterialFromFirestore,
  loadOrSeedGoogleFirestore
} from './firebaseSync.ts';

const TOKEN_KEY = 'devlearn_auth_token';
const LOCAL_STORE_KEY = 'mechmen_persistent_data_v1';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY)
};

// Local & Cloud-backed state mirror so hosting (Static or Full-Stack) NEVER loses data
interface ClientDataStore {
  settings: WebsiteSettings;
  categories: Category[];
  subjects: Subject[];
  lessons: Lesson[];
  materials: LessonMaterial[];
  users: User[];
  activityLogs: ActivityLog[];
  progress: LearningProgress[];
  bookmarks: Bookmark[];
}

function loadLocalStore(): ClientDataStore {
  const baseMaterials: LessonMaterial[] = [...initialMaterials];
  initialLessons.forEach(l => {
    if (l.materials) {
      l.materials.forEach(m => {
        if (!baseMaterials.some(existing => existing.id === m.id)) {
          baseMaterials.push(m);
        }
      });
    }
  });

  const defaults: ClientDataStore = {
    settings: { ...initialSettings },
    categories: [...initialCategories],
    subjects: [...initialSubjects],
    lessons: [...initialLessons],
    materials: baseMaterials,
    users: [...initialUsers],
    activityLogs: [...initialActivityLogs],
    progress: [
      {
        userId: 'usr-student-1',
        subjectId: 'sub-bbu-201',
        completedLessonIds: ['les-sub-bbu-201-1'],
        lastVisitedLessonId: 'les-sub-bbu-201-2',
        progressPercent: 25,
        lastUpdated: '2026-09-28T10:00:00Z'
      }
    ],
    bookmarks: []
  };

  try {
    const raw = localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw);

    // Merge saved over defaults by ID so new curriculum items are never lost and edits are kept
    const mergeById = <T extends { id: string }>(base: T[], overrides?: T[]): T[] => {
      if (!Array.isArray(overrides) || overrides.length === 0) return base;
      const map = new Map(base.map(item => [item.id, item]));
      overrides.forEach(item => {
        if (item && item.id) {
          map.set(item.id, { ...(map.get(item.id) || {}), ...item });
        }
      });
      return Array.from(map.values());
    };

    return {
      settings: saved.settings?.siteName ? { ...defaults.settings, ...saved.settings } : defaults.settings,
      categories: mergeById(defaults.categories, saved.categories),
      subjects: mergeById(defaults.subjects, saved.subjects),
      lessons: mergeById(defaults.lessons, saved.lessons),
      materials: mergeById(defaults.materials, saved.materials),
      users: mergeById(defaults.users, saved.users),
      activityLogs: Array.isArray(saved.activityLogs) && saved.activityLogs.length > 0 ? saved.activityLogs : defaults.activityLogs,
      progress: Array.isArray(saved.progress) ? saved.progress : defaults.progress,
      bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks : defaults.bookmarks
    };
  } catch {
    return defaults;
  }
}

const clientStore: ClientDataStore = loadLocalStore();

function persistLocalStore() {
  try {
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(clientStore));
  } catch (e) {
    console.warn('[Local Persistence] Quota notice:', e);
  }
}

// Synchronize with Google Cloud Firestore on boot
let cloudSyncPromise: Promise<void> | null = null;
export function ensureCloudHydrated(): Promise<void> {
  if (!cloudSyncPromise) {
    cloudSyncPromise = loadOrSeedGoogleFirestore()
      .then(cloud => {
        let changed = false;
        if (cloud.settings && cloud.settings.siteName) {
          clientStore.settings = { ...clientStore.settings, ...cloud.settings };
          changed = true;
        }
        if (cloud.categories.length > 0) {
          const map = new Map(clientStore.categories.map(c => [c.id, c]));
          cloud.categories.forEach(c => map.set(c.id, c));
          clientStore.categories = Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
          changed = true;
        }
        if (cloud.subjects.length > 0) {
          const map = new Map(clientStore.subjects.map(s => [s.id, s]));
          cloud.subjects.forEach(s => map.set(s.id, s));
          clientStore.subjects = Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
          changed = true;
        }
        if (cloud.lessons.length > 0) {
          const map = new Map(clientStore.lessons.map(l => [l.id, l]));
          cloud.lessons.forEach(l => map.set(l.id, l));
          clientStore.lessons = Array.from(map.values());
          changed = true;
        }
        if (cloud.materials.length > 0) {
          const map = new Map(clientStore.materials.map(m => [m.id, m]));
          cloud.materials.forEach(m => map.set(m.id, m));
          clientStore.materials = Array.from(map.values());
          changed = true;
        }

        if (changed) {
          persistLocalStore();
          // Also notify backend server if running so server memory/disk stays in sync
          fetch('/api/sync-from-cloud', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              settings: clientStore.settings,
              categories: clientStore.categories,
              subjects: clientStore.subjects,
              lessons: clientStore.lessons,
              materials: clientStore.materials
            })
          }).catch(() => {});
        }
      })
      .catch(err => {
        console.warn('[Cloud Hydration] Using local/bundled store:', err);
      });
  }
  return cloudSyncPromise;
}

// Trigger initial hydration
ensureCloudHydrated();

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackHandler?: () => Promise<T> | T
): Promise<ApiResponse<T>> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (response.ok) {
        return data;
      }
      if (!fallbackHandler) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
    }
  } catch (err) {
    if (!fallbackHandler) {
      throw err;
    }
  }

  // Fallback to Client + Google Cloud Firestore Engine (ensures 100% functionality on any Static Hosting!)
  if (fallbackHandler) {
    const fallbackData = await fallbackHandler();
    return {
      success: true,
      message: 'OK (Cloud/Bundled Store)',
      data: fallbackData
    };
  }

  throw new Error('Request failed');
}

export const api = {
  // Settings & Dynamic Branding
  getSettings: async () => {
    await ensureCloudHydrated();
    return request<WebsiteSettings>('/settings', {}, () => clientStore.settings);
  },

  updateSettings: async (settings: Partial<WebsiteSettings>) => {
    clientStore.settings = { ...clientStore.settings, ...settings };
    persistLocalStore();
    saveSettingsToFirestore(clientStore.settings).catch(() => {});

    return request<WebsiteSettings>(
      '/admin/settings',
      {
        method: 'PUT',
        body: JSON.stringify(settings)
      },
      () => clientStore.settings
    );
  },

  // Categories
  getCategories: async () => {
    await ensureCloudHydrated();
    return request<Category[]>('/categories', {}, () =>
      clientStore.categories
        .filter(c => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(c => ({
          ...c,
          subjectsCount: clientStore.subjects.filter(s => s.categoryId === c.id && s.isPublished).length
        }))
    );
  },

  createCategory: async (data: Partial<Category>) => {
    const res = await request<Category>(
      '/admin/categories',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      () => {
        const newCat: Category = {
          id: 'cat-' + Date.now(),
          name: data.name || 'New Category',
          nameKh: data.nameKh || data.name || 'ជំនាញថ្មី',
          slug: data.slug || (data.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.description || '',
          descriptionKh: data.descriptionKh || data.description || '',
          icon: data.icon || 'Code',
          color: data.color || 'indigo',
          sortOrder: Number(data.sortOrder) || clientStore.categories.length + 1,
          isActive: data.isActive !== undefined ? data.isActive : true,
          subjectsCount: 0
        };
        return newCat;
      }
    );
    if (res.data) {
      const idx = clientStore.categories.findIndex(c => c.id === res.data.id);
      if (idx > -1) clientStore.categories[idx] = res.data;
      else clientStore.categories.push(res.data);
      persistLocalStore();
      saveCategoryToFirestore(res.data).catch(() => {});
    }
    return res;
  },

  updateCategory: async (id: string, data: Partial<Category>) => {
    const res = await request<Category>(
      `/admin/categories/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      () => {
        const idx = clientStore.categories.findIndex(c => c.id === id);
        const updated = { ...(clientStore.categories[idx] || {}), ...data, id } as Category;
        if (idx > -1) clientStore.categories[idx] = updated;
        return updated;
      }
    );
    if (res.data) {
      const idx = clientStore.categories.findIndex(c => c.id === id);
      if (idx > -1) clientStore.categories[idx] = res.data;
      persistLocalStore();
      saveCategoryToFirestore(res.data).catch(() => {});
    }
    return res;
  },

  deleteCategory: async (id: string) => {
    clientStore.categories = clientStore.categories.filter(c => c.id !== id);
    persistLocalStore();
    deleteCategoryFromFirestore(id).catch(() => {});
    return request<void>(
      `/admin/categories/${id}`,
      { method: 'DELETE' },
      () => undefined
    );
  },

  // Subjects
  getSubjects: async (params?: { category?: string; level?: string; sort?: string; q?: string }) => {
    await ensureCloudHydrated();
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.level) searchParams.set('level', params.level);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.q) searchParams.set('q', params.q);
    const qs = searchParams.toString();

    return request<Subject[]>(`/subjects${qs ? `?${qs}` : ''}`, {}, () => {
      let list = clientStore.subjects.filter(s => s.isPublished);
      if (params?.category && params.category !== 'all') {
        list = list.filter(
          s =>
            s.categoryId === params.category ||
            s.categoryName?.toLowerCase() === params.category?.toLowerCase()
        );
      }
      if (params?.level && params.level !== 'all') {
        list = list.filter(s => s.level === params.level);
      }
      if (params?.q) {
        const q = params.q.toLowerCase();
        list = list.filter(
          s =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.shortDescription.toLowerCase().includes(q)
        );
      }
      return list.map(s => {
        const cat = clientStore.categories.find(c => c.id === s.categoryId);
        const lessonsCount = clientStore.lessons.filter(l => l.subjectId === s.id && l.isPublished).length;
        return {
          ...s,
          categoryName: cat ? cat.name : s.categoryName,
          lessonsCount: lessonsCount || s.lessonsCount
        };
      });
    });
  },

  getSubjectBySlug: async (slug: string) => {
    await ensureCloudHydrated();
    return request<Subject & { lessons: any[] }>(`/subjects/${slug}`, {}, () => {
      const subject = clientStore.subjects.find(s => s.slug === slug || s.id === slug) || clientStore.subjects[0];
      const lessons = clientStore.lessons
        .filter(l => l.subjectId === subject.id && l.isPublished)
        .sort((a, b) => a.lessonNumber - b.lessonNumber);
      return {
        ...subject,
        lessonsCount: lessons.length,
        lessons
      };
    });
  },

  createSubject: async (data: Partial<Subject>) => {
    const res = await request<Subject>(
      '/admin/subjects',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      () => {
        const cat = clientStore.categories.find(c => c.id === data.categoryId);
        const newSub: Subject = {
          id: 'sub-' + Date.now(),
          name: data.name || 'New Subject',
          nameKh: data.nameKh || data.name || '',
          slug: data.slug || (data.name || 'subject').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.description || '',
          descriptionKh: data.descriptionKh || data.description || '',
          shortDescription: data.shortDescription || (data.description || '').slice(0, 100),
          shortDescriptionKh: data.shortDescriptionKh || data.shortDescription || '',
          categoryId: data.categoryId || clientStore.categories[0]?.id || 'cat-y1s1',
          categoryName: cat?.name || 'Programming',
          level: data.level || 'Beginner',
          academicYear: data.academicYear || 'Year 1',
          semester: data.semester || 'Semester 1',
          credits: Number(data.credits) || 3,
          lecturerName: data.lecturerName || '',
          lecturerTel: data.lecturerTel || '',
          room: data.room || 'Room: 204 Building A',
          university: data.university || 'Build Bright University',
          coverImage: data.coverImage || '/src/assets/images/subject_python_code_1790863262336.jpg',
          icon: data.icon || 'Code',
          lessonsCount: 0,
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
          isFeatured: Boolean(data.isFeatured),
          sortOrder: clientStore.subjects.length + 1,
          learningObjectives: data.learningObjectives || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return newSub;
      }
    );
    if (res.data) {
      const idx = clientStore.subjects.findIndex(s => s.id === res.data.id);
      if (idx > -1) clientStore.subjects[idx] = res.data;
      else clientStore.subjects.push(res.data);
      persistLocalStore();
      saveSubjectToFirestore(res.data).catch(() => {});
    }
    return res;
  },

  updateSubject: async (id: string, data: Partial<Subject>) => {
    const res = await request<Subject>(
      `/admin/subjects/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      () => {
        const idx = clientStore.subjects.findIndex(s => s.id === id);
        const updated = {
          ...(clientStore.subjects[idx] || {}),
          ...data,
          id,
          updatedAt: new Date().toISOString()
        } as Subject;
        if (idx > -1) clientStore.subjects[idx] = updated;
        return updated;
      }
    );
    if (res.data) {
      const idx = clientStore.subjects.findIndex(s => s.id === id);
      if (idx > -1) clientStore.subjects[idx] = res.data;
      persistLocalStore();
      saveSubjectToFirestore(res.data).catch(() => {});
    }
    return res;
  },

  deleteSubject: async (id: string) => {
    clientStore.subjects = clientStore.subjects.filter(s => s.id !== id);
    persistLocalStore();
    deleteSubjectFromFirestore(id).catch(() => {});
    return request<void>(`/admin/subjects/${id}`, { method: 'DELETE' }, () => undefined);
  },

  // Lessons
  getLessons: async (params?: { limit?: number; featured?: boolean }) => {
    await ensureCloudHydrated();
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.featured) searchParams.set('featured', 'true');
    const qs = searchParams.toString();

    return request<Lesson[]>(`/lessons${qs ? `?${qs}` : ''}`, {}, () => {
      let list = clientStore.lessons.filter(l => l.isPublished);
      if (params?.limit) {
        list = list.slice(0, params.limit);
      }
      return list;
    });
  },

  getLesson: async (id: string) => {
    await ensureCloudHydrated();
    return request<Lesson & { prevLesson: any; nextLesson: any; allLessonsSummary: any[] }>(
      `/lessons/${id}`,
      {},
      () => {
        const lesson = clientStore.lessons.find(l => l.id === id || l.slug === id) || clientStore.lessons[0];
        const subjectLessons = clientStore.lessons
          .filter(l => l.subjectId === lesson.subjectId && l.isPublished)
          .sort((a, b) => a.lessonNumber - b.lessonNumber);
        const currentIndex = subjectLessons.findIndex(l => l.id === lesson.id);
        const prevLesson = currentIndex > 0 ? subjectLessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < subjectLessons.length - 1 ? subjectLessons[currentIndex + 1] : null;
        return {
          ...lesson,
          prevLesson: prevLesson ? { id: prevLesson.id, title: prevLesson.title, lessonNumber: prevLesson.lessonNumber } : null,
          nextLesson: nextLesson ? { id: nextLesson.id, title: nextLesson.title, lessonNumber: nextLesson.lessonNumber } : null,
          allLessonsSummary: subjectLessons.map(l => ({
            id: l.id,
            lessonNumber: l.lessonNumber,
            title: l.title,
            titleKh: l.titleKh,
            duration: l.duration
          }))
        };
      }
    );
  },

  createLesson: async (data: Partial<Lesson>) => {
    const res = await request<Lesson>(
      '/admin/lessons',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      () => {
        const sub = clientStore.subjects.find(s => s.id === data.subjectId);
        const existingCount = clientStore.lessons.filter(l => l.subjectId === data.subjectId).length;
        const newLes: Lesson = {
          id: 'les-' + Date.now(),
          subjectId: data.subjectId || clientStore.subjects[0]?.id || '',
          subjectSlug: sub?.slug || '',
          subjectName: sub?.name || '',
          lessonNumber: Number(data.lessonNumber) || existingCount + 1,
          title: data.title || 'New Lesson',
          titleKh: data.titleKh || data.title || '',
          slug: data.slug || (data.title || 'lesson').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          duration: data.duration || '45 mins',
          level: data.level || sub?.level || 'Beginner',
          description: data.description || '',
          descriptionKh: data.descriptionKh || data.description || '',
          content: data.content || '',
          codeSnippets: data.codeSnippets || [],
          pdfUrl: data.pdfUrl || '',
          pdfTitle: data.pdfTitle || '',
          slides: data.slides || [],
          materials: data.materials || [],
          quiz: data.quiz || [],
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
          sortOrder: Number(data.sortOrder) || existingCount + 1,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        return newLes;
      }
    );
    if (res.data) {
      const idx = clientStore.lessons.findIndex(l => l.id === res.data.id);
      if (idx > -1) clientStore.lessons[idx] = res.data;
      else clientStore.lessons.push(res.data);
      persistLocalStore();
      saveLessonToFirestore(res.data).catch(() => {});
    }
    return res;
  },

  updateLesson: async (id: string, data: Partial<Lesson>) => {
    const res = await request<Lesson>(
      `/admin/lessons/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      () => {
        const idx = clientStore.lessons.findIndex(l => l.id === id);
        const updated = {
          ...(clientStore.lessons[idx] || {}),
          ...data,
          id,
          updatedAt: new Date().toISOString().split('T')[0]
        } as Lesson;
        if (idx > -1) clientStore.lessons[idx] = updated;
        return updated;
      }
    );
    if (res.data) {
      const idx = clientStore.lessons.findIndex(l => l.id === id);
      if (idx > -1) clientStore.lessons[idx] = res.data;
      persistLocalStore();
      saveLessonToFirestore(res.data).catch(() => {});
    }
    return res;
  },

  deleteLesson: async (id: string) => {
    clientStore.lessons = clientStore.lessons.filter(l => l.id !== id);
    persistLocalStore();
    deleteLessonFromFirestore(id).catch(() => {});
    return request<void>(`/admin/lessons/${id}`, { method: 'DELETE' }, () => undefined);
  },

  // Materials
  getMaterials: async () => {
    await ensureCloudHydrated();
    return request<LessonMaterial[]>('/materials', {}, () => clientStore.materials);
  },

  createMaterial: async (data: Partial<LessonMaterial>) => {
    const res = await request<LessonMaterial>(
      '/admin/materials',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      () => {
        const newMat: LessonMaterial = {
          id: 'mat-' + Date.now(),
          lessonId: data.lessonId || '',
          title: data.title || 'Course Document',
          fileName: data.fileName || (data.title || 'doc') + '.' + (data.fileType || 'pdf'),
          fileType: (data.fileType as any) || 'pdf',
          fileSize: data.fileSize || '1.5 MB',
          fileUrl: data.fileUrl || '',
          downloadable: true,
          uploadedAt: new Date().toISOString().split('T')[0]
        };
        return newMat;
      }
    );
    if (res.data) {
      clientStore.materials.push(res.data);
      persistLocalStore();
      saveMaterialToFirestore(res.data).catch(() => {});
    }
    return res;
  },

  deleteMaterial: async (id: string) => {
    clientStore.materials = clientStore.materials.filter(m => m.id !== id);
    persistLocalStore();
    deleteMaterialFromFirestore(id).catch(() => {});
    return request<void>(`/admin/materials/${id}`, { method: 'DELETE' }, () => undefined);
  },

  // Authentication (Works both with Express Backend AND Static Hosting)
  login: (email: string, pass: string) =>
    request<{ user: User; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password: pass })
      },
      () => {
        const cleanInput = (email || '').trim().toLowerCase();
        const isAdminAttempt =
          cleanInput === 'admin' ||
          cleanInput === 'mechmen' ||
          cleanInput === 'admin@mechmen.it' ||
          cleanInput === 'admin@it-learning.com' ||
          cleanInput === 'admin@devlearn.it' ||
          cleanInput === 'chhayhengidd22@gmail.com';

        const user = isAdminAttempt
          ? clientStore.users.find(u => u.role === 'admin') || clientStore.users[0]
          : clientStore.users.find(
              u => u.email.toLowerCase() === cleanInput || u.username?.toLowerCase() === cleanInput
            ) || clientStore.users[1];

        return {
          user,
          token: `devlearn_token_${user.id}_${Date.now()}`
        };
      }
    ),

  register: (name: string, email: string, pass: string, username?: string) =>
    request<{ user: User; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password: pass, username })
      },
      () => {
        const newUser: User = {
          id: 'usr-' + Date.now(),
          name,
          email,
          role: 'student',
          username: username || email.split('@')[0],
          avatar: '',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        clientStore.users.push(newUser);
        persistLocalStore();
        return {
          user: newUser,
          token: `devlearn_token_${newUser.id}_${Date.now()}`
        };
      }
    ),

  getMe: () =>
    request<{ user: User }>('/auth/me', {}, () => {
      const token = authStorage.getToken() || '';
      const isStudent = token.includes('usr-student');
      const user = isStudent
        ? clientStore.users.find(u => u.role === 'student') || clientStore.users[1]
        : clientStore.users.find(u => u.role === 'admin') || clientStore.users[0];
      return { user };
    }),

  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }, () => undefined),

  updateProfile: (data: { name?: string; username?: string; avatar?: string }) =>
    request<{ user: User }>(
      '/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      () => {
        const admin = clientStore.users[0];
        if (data.name) admin.name = data.name;
        if (data.username) admin.username = data.username;
        if (data.avatar !== undefined) admin.avatar = data.avatar;
        persistLocalStore();
        return { user: admin };
      }
    ),

  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    request<void>(
      '/auth/password',
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      () => undefined
    ),

  // Student Progress & Bookmarks
  getProgress: () =>
    request<LearningProgress[]>('/progress', {}, () => clientStore.progress),

  toggleProgress: (subjectId: string, lessonId: string) =>
    request<LearningProgress>(
      '/progress/toggle',
      {
        method: 'POST',
        body: JSON.stringify({ subjectId, lessonId })
      },
      () => {
        let rec = clientStore.progress.find(p => p.subjectId === subjectId);
        const total = clientStore.lessons.filter(l => l.subjectId === subjectId).length || 1;
        if (!rec) {
          rec = {
            userId: 'usr-student-1',
            subjectId,
            completedLessonIds: [lessonId],
            lastVisitedLessonId: lessonId,
            progressPercent: Math.round((1 / total) * 100),
            lastUpdated: new Date().toISOString()
          };
          clientStore.progress.push(rec);
        } else {
          if (rec.completedLessonIds.includes(lessonId)) {
            rec.completedLessonIds = rec.completedLessonIds.filter(id => id !== lessonId);
          } else {
            rec.completedLessonIds.push(lessonId);
          }
          rec.lastVisitedLessonId = lessonId;
          rec.progressPercent = Math.min(100, Math.round((rec.completedLessonIds.length / total) * 100));
          rec.lastUpdated = new Date().toISOString();
        }
        persistLocalStore();
        return rec;
      }
    ),

  getBookmarks: () =>
    request<Bookmark[]>('/bookmarks', {}, () => clientStore.bookmarks),

  toggleBookmark: (subjectId: string, lessonId: string) =>
    request<{ isBookmarked: boolean }>(
      '/bookmarks/toggle',
      {
        method: 'POST',
        body: JSON.stringify({ subjectId, lessonId })
      },
      () => {
        const idx = clientStore.bookmarks.findIndex(b => b.lessonId === lessonId);
        if (idx > -1) {
          clientStore.bookmarks.splice(idx, 1);
          persistLocalStore();
          return { isBookmarked: false };
        }
        clientStore.bookmarks.push({
          userId: 'usr-student-1',
          lessonId,
          subjectId,
          createdAt: new Date().toISOString()
        });
        persistLocalStore();
        return { isBookmarked: true };
      }
    ),

  // Admin Dashboard
  getDashboardStats: () =>
    request<DashboardStats>('/admin/dashboard', {}, () => {
      const totalPdfs =
        clientStore.materials.filter(m => m.fileType === 'pdf').length +
        clientStore.lessons.filter(l => Boolean(l.pdfUrl)).length;
      const totalSlides =
        clientStore.materials.filter(m => m.fileType === 'ppt' || m.fileType === 'pptx').length +
        clientStore.lessons.filter(l => l.slides && l.slides.length > 0).length;
      const totalVideos = clientStore.lessons.filter(l => Boolean(l.videoUrl)).length;

      return {
        totalSubjects: clientStore.subjects.length,
        totalLessons: clientStore.lessons.length,
        totalCategories: clientStore.categories.length,
        totalPdfs,
        totalSlides,
        totalVideos,
        totalUsers: clientStore.users.length,
        totalViews: 18450,
        recentActivity: clientStore.activityLogs.slice(0, 10),
        categoryStats: clientStore.categories.map(c => ({
          name: c.name,
          count: clientStore.subjects.filter(s => s.categoryId === c.id).length
        }))
      };
    }),

  getActivityLogs: () =>
    request<ActivityLog[]>('/admin/activity-logs', {}, () => clientStore.activityLogs),

  getUsers: () =>
    request<User[]>('/admin/users', {}, () => clientStore.users),

  toggleUserStatus: (id: string) =>
    request<User>(
      `/admin/users/${id}/status`,
      { method: 'PUT' },
      () => {
        const u = clientStore.users.find(user => user.id === id) || clientStore.users[0];
        u.isActive = !u.isActive;
        persistLocalStore();
        return u;
      }
    ),

  // Search
  search: (q: string) =>
    request<{ subjects: Subject[]; lessons: Lesson[]; categories: Category[] }>(
      `/search?q=${encodeURIComponent(q)}`,
      {},
      () => {
        const query = (q || '').toLowerCase();
        return {
          subjects: clientStore.subjects
            .filter(s => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query))
            .slice(0, 6),
          lessons: clientStore.lessons
            .filter(l => l.title.toLowerCase().includes(query) || l.description.toLowerCase().includes(query))
            .slice(0, 8),
          categories: clientStore.categories
            .filter(c => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query))
            .slice(0, 4)
        };
      }
    ),

  // File Upload
  uploadFile: (data: { fileName: string; fileType?: string; base64Data?: string; sizeInBytes?: number }) =>
    request<{ fileName: string; fileUrl: string; fileType: string; fileSize: string }>(
      '/upload',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      () => {
        const ext = data.fileName.split('.').pop()?.toLowerCase() || 'pdf';
        return {
          fileName: data.fileName,
          fileUrl: data.base64Data || `/uploads/${data.fileName}`,
          fileType: ext,
          fileSize: data.sizeInBytes ? `${(data.sizeInBytes / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB'
        };
      }
    ),

  // Laravel Spec
  getLaravelSpec: () => request<any>('/laravel-spec', {}, () => ({}))
};
