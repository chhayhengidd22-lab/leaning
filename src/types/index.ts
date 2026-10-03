export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  username?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameKh?: string;
  slug: string;
  description: string;
  descriptionKh?: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  subjectsCount?: number;
}

export type SubjectLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Beginner → Advanced';

export interface Subject {
  id: string;
  name: string;
  nameKh?: string;
  slug: string;
  description: string;
  descriptionKh?: string;
  shortDescription: string;
  shortDescriptionKh?: string;
  categoryId: string;
  categoryName?: string;
  level: SubjectLevel;
  coverImage: string;
  icon: string;
  lessonsCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  academicYear?: string;
  semester?: string;
  credits?: number;
  lecturerName?: string;
  lecturerTel?: string;
  room?: string;
  university?: string;
  learningObjectives?: string[];
  createdAt: string;
  updatedAt: string;
}

export type VideoType = 'youtube' | 'vimeo' | 'external' | 'upload';

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation?: string;
  expectedOutput?: string;
}

export interface SlidePage {
  pageNumber: number;
  title: string;
  bullets: string[];
  notes?: string;
  codeSnippet?: string;
  image?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonMaterial {
  id: string;
  lessonId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'ppt' | 'pptx' | 'doc' | 'docx' | 'zip' | 'image' | 'video';
  fileSize: string;
  fileUrl: string;
  downloadable: boolean;
  uploadedAt: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  subjectSlug?: string;
  subjectName?: string;
  lessonNumber: number;
  title: string;
  titleKh?: string;
  slug: string;
  duration: string;
  level: SubjectLevel;
  description: string;
  descriptionKh?: string;
  content: string; // Markdown or rich text
  videoType?: VideoType;
  videoUrl?: string;
  thumbnail?: string;
  codeSnippets?: CodeSnippet[];
  slides?: SlidePage[];
  pdfUrl?: string;
  pdfTitle?: string;
  materials?: LessonMaterial[];
  quiz?: QuizQuestion[];
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSettings {
  // General
  siteName: string;
  siteNameKh: string;
  siteSubtitle: string;
  siteSubtitleKh: string;
  siteDescription: string;
  siteDescriptionKh: string;
  logoText: string;
  logoUrl?: string;
  theme: 'dark' | 'light' | 'system';
  headerLayout: 'split-right-avatar' | 'split-left-avatar' | 'centered';

  // Creator Profile / Branding
  creatorName: string;
  creatorNameKh: string;
  creatorRole: string;
  creatorRoleKh: string;
  creatorBio: string;
  creatorBioKh: string;
  creatorAvatar: string;
  creatorPhotoStyle?: 'cutout-transparent' | 'framed' | 'minimal';
  creatorPhotoPose?: 'standing' | 'sitting' | 'auto';
  creatorPhotoHeight?: 'medium' | 'large' | 'tall';

  // Hero Section
  heroTitle: string;
  heroTitleKh: string;
  heroSubtitle: string;
  heroSubtitleKh: string;
  heroDescription: string;
  heroDescriptionKh: string;
  heroImage: string;

  // Contact & Social
  email: string;
  phone: string;
  address: string;
  telegramUsername: string;
  facebookUrl: string;
  githubUrl: string;
  linkedinUrl?: string;

  // About Section
  aboutHeading: string;
  aboutHeadingKh: string;
  aboutText: string;
  aboutTextKh: string;
  aboutHighlights: string[];

  // Footer
  footerText: string;
  footerTextKh: string;
  copyrightYear: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface DashboardStats {
  totalSubjects: number;
  totalLessons: number;
  totalCategories: number;
  totalPdfs: number;
  totalSlides: number;
  totalVideos: number;
  totalUsers: number;
  totalViews: number;
  recentActivity: ActivityLog[];
  categoryStats: { name: string; count: number }[];
}

export interface LearningProgress {
  userId: string;
  subjectId: string;
  completedLessonIds: string[];
  lastVisitedLessonId?: string;
  progressPercent: number;
  lastUpdated: string;
}

export interface Bookmark {
  userId: string;
  lessonId: string;
  subjectId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
  };
}
