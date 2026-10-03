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

const TOKEN_KEY = 'devlearn_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY)
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Settings & Dynamic Branding
  getSettings: () => request<WebsiteSettings>('/settings'),
  updateSettings: (settings: Partial<WebsiteSettings>) =>
    request<WebsiteSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (data: Partial<Category>) =>
    request<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateCategory: (id: string, data: Partial<Category>) =>
    request<Category>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteCategory: (id: string) =>
    request<void>(`/admin/categories/${id}`, {
      method: 'DELETE'
    }),

  // Subjects
  getSubjects: (params?: { category?: string; level?: string; sort?: string; q?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.level) searchParams.set('level', params.level);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.q) searchParams.set('q', params.q);
    const qs = searchParams.toString();
    return request<Subject[]>(`/subjects${qs ? `?${qs}` : ''}`);
  },
  getSubjectBySlug: (slug: string) => request<Subject & { lessons: any[] }>(`/subjects/${slug}`),
  createSubject: (data: Partial<Subject>) =>
    request<Subject>('/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSubject: (id: string, data: Partial<Subject>) =>
    request<Subject>(`/admin/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSubject: (id: string) =>
    request<void>(`/admin/subjects/${id}`, {
      method: 'DELETE'
    }),

  // Lessons
  getLessons: (params?: { limit?: number; featured?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.featured) searchParams.set('featured', 'true');
    const qs = searchParams.toString();
    return request<Lesson[]>(`/lessons${qs ? `?${qs}` : ''}`);
  },
  getLesson: (id: string) => request<Lesson & { prevLesson: any; nextLesson: any; allLessonsSummary: any[] }>(`/lessons/${id}`),
  createLesson: (data: Partial<Lesson>) =>
    request<Lesson>('/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateLesson: (id: string, data: Partial<Lesson>) =>
    request<Lesson>(`/admin/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteLesson: (id: string) =>
    request<void>(`/admin/lessons/${id}`, {
      method: 'DELETE'
    }),

  // Materials
  getMaterials: () => request<LessonMaterial[]>('/materials'),
  createMaterial: (data: Partial<LessonMaterial>) =>
    request<LessonMaterial>('/admin/materials', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteMaterial: (id: string) =>
    request<void>(`/admin/materials/${id}`, {
      method: 'DELETE'
    }),

  // Authentication
  login: (email: string, pass: string) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    }),
  register: (name: string, email: string, pass: string, username?: string) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass, username })
    }),
  getMe: () => request<{ user: User }>('/auth/me'),
  logout: () =>
    request<void>('/auth/logout', {
      method: 'POST'
    }),
  updateProfile: (data: { name?: string; username?: string; avatar?: string }) =>
    request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    request<void>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Student Progress & Bookmarks
  getProgress: () => request<LearningProgress[]>('/progress'),
  toggleProgress: (subjectId: string, lessonId: string) =>
    request<LearningProgress>('/progress/toggle', {
      method: 'POST',
      body: JSON.stringify({ subjectId, lessonId })
    }),
  getBookmarks: () => request<Bookmark[]>('/bookmarks'),
  toggleBookmark: (subjectId: string, lessonId: string) =>
    request<{ isBookmarked: boolean }>('/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ subjectId, lessonId })
    }),

  // Admin Dashboard
  getDashboardStats: () => request<DashboardStats>('/admin/dashboard'),
  getActivityLogs: () => request<ActivityLog[]>('/admin/activity-logs'),
  getUsers: () => request<User[]>('/admin/users'),
  toggleUserStatus: (id: string) =>
    request<User>(`/admin/users/${id}/status`, {
      method: 'PUT'
    }),

  // Search
  search: (q: string) => request<{ subjects: Subject[]; lessons: Lesson[]; categories: Category[] }>(`/search?q=${encodeURIComponent(q)}`),

  // File Upload
  uploadFile: (data: { fileName: string; fileType?: string; base64Data?: string; sizeInBytes?: number }) =>
    request<{ fileName: string; fileUrl: string; fileType: string; fileSize: string }>('/upload', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Laravel Spec
  getLaravelSpec: () => request<any>('/laravel-spec')
};
