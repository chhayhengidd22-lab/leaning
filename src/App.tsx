import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { SettingsProvider, useSettings } from './context/SettingsContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { HeroSection } from './components/home/HeroSection.tsx';
import { FeaturedSubjects } from './components/home/FeaturedSubjects.tsx';
import { CategoriesGrid } from './components/home/CategoriesGrid.tsx';
import { PopularLessons } from './components/home/PopularLessons.tsx';
import { AboutSection } from './components/home/AboutSection.tsx';
import { ContactSection } from './components/home/ContactSection.tsx';

import { SubjectLearningView } from './components/subjects/SubjectLearningView.tsx';
import { LessonViewer } from './components/lessons/LessonViewer.tsx';
import { StudentProgressView } from './components/student/StudentProgressView.tsx';
import { SearchModal } from './components/search/SearchModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';

import { AdminLayout } from './components/admin/AdminLayout.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { SubjectManagement } from './components/admin/SubjectManagement.tsx';
import { CategoryManagement } from './components/admin/CategoryManagement.tsx';
import { LessonManagement } from './components/admin/LessonManagement.tsx';
import { MaterialManagement } from './components/admin/MaterialManagement.tsx';
import { SettingsManagement } from './components/admin/SettingsManagement.tsx';
import { UserManagement } from './components/admin/UserManagement.tsx';
import { ActivityLogsView } from './components/admin/ActivityLogsView.tsx';
import { AdminProfile } from './components/admin/AdminProfile.tsx';
import { LaravelSpecViewer } from './components/admin/LaravelSpecViewer.tsx';

import { api } from './services/api.ts';
import { Subject, Category, Lesson } from './types/index.ts';

function AppContent() {
  const { user, isAdmin } = useAuth();
  const { settings } = useSettings();

  // Navigation states
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string>('fundamental-for-computer-technology');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('les-sub-bbu-101-1');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Admin Tab state
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Global Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularLessons, setPopularLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGlobalData = () => {
    Promise.all([
      api.getSubjects(),
      api.getCategories(),
      api.getLessons({ limit: 8, featured: true })
    ]).then(([subRes, catRes, lessonsRes]) => {
      if (subRes.success) {
        setSubjects(subRes.data);
        if (subRes.data.length > 0) {
          setSelectedSubjectSlug(prev => {
            const exists = subRes.data.some(s => s.slug === prev || s.id === prev);
            return exists ? prev : subRes.data[0].slug;
          });
        }
      }
      if (catRes.success) setCategories(catRes.data);
      if (lessonsRes.success && lessonsRes.data) {
        setPopularLessons(lessonsRes.data);
        if (lessonsRes.data.length > 0) {
          setSelectedLessonId(prev => {
            const exists = lessonsRes.data.some(l => l.id === prev);
            return exists ? prev : lessonsRes.data[0].id;
          });
        }
      }
    }).catch(err => console.error('App init error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGlobalData();
  }, []);

  // Handlers for subject and lesson navigation
  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubjectSlug(subject.slug || subject.id);
    setCurrentView('subject-learn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentView('lesson-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryFilter(categoryId);
    setCurrentView('subjects');
    const elem = document.getElementById('subjects');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'add-subject') {
      setAdminTab('subjects');
    } else if (action === 'add-lesson') {
      setAdminTab('lessons');
    } else if (action === 'manage-branding') {
      setAdminTab('settings');
    } else if (action === 'upload-material') {
      setAdminTab('materials');
    } else if (action === 'add-category') {
      setAdminTab('categories');
    }
  };

  // If viewing admin console
  if (currentView === 'admin') {
    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(tab) => setAdminTab(tab)}
        onExitAdmin={() => setCurrentView('home')}
        onQuickAction={handleQuickAction}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setAdminTab(tab)} />}
        {adminTab === 'subjects' && <SubjectManagement />}
        {adminTab === 'categories' && <CategoryManagement />}
        {adminTab === 'lessons' && <LessonManagement />}
        {adminTab === 'materials' && <MaterialManagement />}
        {adminTab === 'users' && <UserManagement />}
        {adminTab === 'activity' && <ActivityLogsView />}
        {adminTab === 'settings' && <SettingsManagement />}
        {adminTab === 'profile' && <AdminProfile />}
        {adminTab === 'laravel-spec' && <LaravelSpecViewer />}
      </AdminLayout>
    );
  }

  // Student progress view
  if (currentView === 'student-progress') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          onNavigate={(view) => setCurrentView(view)}
          currentView={currentView}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
        <main className="flex-1">
          <StudentProgressView
            onBack={() => setCurrentView('home')}
            onSelectSubject={(slug) => {
              setSelectedSubjectSlug(slug);
              setCurrentView('subject-learn');
            }}
            onSelectLesson={handleSelectLesson}
          />
        </main>
        <Footer onNavigate={(view) => setCurrentView(view)} />
      </div>
    );
  }

  // Subject learning view
  if (currentView === 'subject-learn') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          onNavigate={(view) => setCurrentView(view)}
          currentView={currentView}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
        <main className="flex-1">
          <SubjectLearningView
            subjectSlug={selectedSubjectSlug}
            onBack={() => setCurrentView('subjects')}
            onSelectLesson={handleSelectLesson}
          />
        </main>
        <Footer onNavigate={(view) => setCurrentView(view)} />
      </div>
    );
  }

  // Full lesson interactive viewer
  if (currentView === 'lesson-view') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          onNavigate={(view) => setCurrentView(view)}
          currentView={currentView}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
        <main className="flex-1">
          <LessonViewer
            lessonId={selectedLessonId}
            onBackToSubject={(slug) => {
              setSelectedSubjectSlug(slug || 'python-programming');
              setCurrentView('subject-learn');
            }}
            onSelectLesson={handleSelectLesson}
          />
        </main>
        <Footer onNavigate={(view) => setCurrentView(view)} />
      </div>
    );
  }

  // Default: Public Website (Home, Subjects, Categories, About, Contact)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'subjects' || view === 'categories' || view === 'about' || view === 'contact') {
            const el = document.getElementById(view);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        currentView={currentView}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main className="flex-1">
        {/* Hero / Profile Section */}
        <HeroSection
          onExplore={() => {
            const el = document.getElementById('subjects');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onViewCategories={() => {
            const el = document.getElementById('categories');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          totalSubjects={subjects.length}
          totalLessons={subjects.reduce((acc, s) => acc + (s.lessonsCount || 0), 0)}
          onOpenAdminSettings={() => {
            setCurrentView('admin');
            setAdminTab('settings');
          }}
        />

        {/* IT Subjects Grid with Tabs & Filter */}
        <FeaturedSubjects
          subjects={subjects}
          categories={categories}
          onSelectSubject={handleSelectSubject}
          selectedCategory={activeCategoryFilter}
          onCategoryChange={(catId) => setActiveCategoryFilter(catId)}
        />

        {/* Categories Section */}
        <CategoriesGrid
          categories={categories}
          onSelectCategory={handleSelectCategory}
        />

        {/* Popular Lessons Section */}
        <PopularLessons
          lessons={popularLessons}
          onSelectLesson={handleSelectLesson}
        />

        {/* About Creator & Platform */}
        <AboutSection />

        {/* Contact Section */}
        <ContactSection />
      </main>

      <Footer onNavigate={(view) => setCurrentView(view)} />

      {/* Global Live Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectSubject={handleSelectSubject}
        onSelectLesson={handleSelectLesson}
        onSelectCategory={handleSelectCategory}
      />

      {/* Auth Modal for Admin / Student */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(role) => {
          if (role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('student-progress');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
