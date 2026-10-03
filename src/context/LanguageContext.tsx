import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'kh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.subjects': 'Subjects',
    'nav.categories': 'Categories',
    'nav.about': 'About Platform',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin Console',
    'nav.myLearning': 'My Progress',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    'nav.search': 'Search subjects & lessons...',
    'nav.searchShortcut': 'Ctrl + K',

    // Hero & CTA
    'hero.badge': 'IT Learning Platform',
    'hero.explore': 'Explore IT Subjects',
    'hero.curriculum': 'View Categories',
    'hero.stats.lessons': 'Structured Lessons',
    'hero.stats.subjects': 'Core IT Subjects',
    'hero.stats.learners': 'Active Students',
    'hero.stats.completion': 'Hands-on Projects',

    // Subjects Section
    'subjects.title': 'Explore IT Subjects',
    'subjects.subtitle': 'Click on any subject card or image to immediately launch its interactive curriculum and lessons.',
    'subjects.start': 'Start Learning',
    'subjects.lessons': 'Lessons',
    'subjects.filter.all': 'All Subjects',
    'subjects.filter.level': 'All Levels',
    'subjects.sort': 'Sort by',
    'subjects.sort.default': 'Recommended',
    'subjects.sort.lessons': 'Most Lessons',
    'subjects.sort.name': 'Alphabetical',
    'subjects.empty': 'No subjects found matching your criteria.',

    // Categories Section
    'categories.title': 'Learning Categories',
    'categories.subtitle': 'Curated pathways designed for software engineers, network admins, and IT specialists.',
    'categories.explore': 'Browse Category',

    // Popular Lessons
    'popular.title': 'Popular IT Lessons',
    'popular.subtitle': 'Jump directly into the most frequently studied lessons across our curriculum.',

    // Learning Viewer
    'learn.back': 'Back to Subjects',
    'learn.instructor': 'Course Instructor',
    'learn.level': 'Skill Level',
    'learn.objectives': 'Learning Objectives',
    'learn.curriculum': 'Course Curriculum',
    'learn.lesson': 'Lesson',
    'learn.duration': 'Duration',
    'learn.tab.content': 'Lesson Overview',
    'learn.tab.slides': 'Presentation Slides',
    'learn.tab.pdf': 'Embedded PDF',
    'learn.tab.code': 'Code Playground',
    'learn.tab.video': 'Video Lesson',
    'learn.tab.quiz': 'Practice Quiz',
    'learn.tab.materials': 'Materials & Downloads',
    'learn.markComplete': 'Mark as Complete',
    'learn.completed': 'Completed',
    'learn.prev': 'Previous Lesson',
    'learn.next': 'Next Lesson',
    'learn.copyCode': 'Copy Code',
    'learn.copied': 'Copied to Clipboard!',
    'learn.downloadPdf': 'Download PDF',
    'learn.downloadSlide': 'Download Slide Deck',

    // About Section
    'about.label': 'About The Creator & Platform',
    'about.creator': 'Creator & Instructor',

    // Contact
    'contact.title': 'Get in Touch',
    'contact.subtitle': 'Have questions about course materials, curriculum, or technical guidance? Connect directly.',
    'contact.telegram': 'Telegram Channel',
    'contact.github': 'GitHub Repository',
    'contact.facebook': 'Facebook Page',
    'contact.email': 'Direct Email',

    // Footer
    'footer.rights': 'All rights reserved.',
    'footer.independent': 'Independent IT Developer & Educator Platform',

    // Themes
    'theme.dark': 'Dark Slate',
    'theme.light': 'Soft Light',
    'theme.amber': 'Amber Gold',

    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.subjects': 'Subjects',
    'admin.categories': 'Categories',
    'admin.lessons': 'Lessons',
    'admin.materials': 'Materials',
    'admin.users': 'Users',
    'admin.activityLogs': 'Activity Logs',
    'admin.settings': 'Settings & Branding',
    'admin.profile': 'Admin Profile',
    'admin.laravelSpec': 'Laravel API Specs',
    'admin.quickAction.subject': '+ Add Subject',
    'admin.quickAction.lesson': '+ Add Lesson',
    'admin.quickAction.material': '+ Upload Material',
    'admin.quickAction.category': '+ Add Category',
    'admin.quickAction.branding': 'Manage Branding'
  },
  kh: {
    // Nav
    'nav.home': 'ទំព័រដើម',
    'nav.subjects': 'មុខវិជ្ជា IT',
    'nav.categories': 'ផ្នែកជំនាញ',
    'nav.about': 'អំពីវេទិកា',
    'nav.contact': 'ទំនាក់ទំនង',
    'nav.admin': 'ផ្ទាំងគ្រប់គ្រង Admin',
    'nav.myLearning': 'ការសិក្សារបស់ខ្ញុំ',
    'nav.signIn': 'ចូលប្រើប្រាស់',
    'nav.signOut': 'ចាកចេញ',
    'nav.search': 'ស្វែងរកមុខវិជ្ជា និងមេរៀន...',
    'nav.searchShortcut': 'Ctrl + K',

    // Hero & CTA
    'hero.badge': 'វេទិការៀនបច្ចេកវិទ្យាព័ត៌មានវិទ្យា',
    'hero.explore': 'ស្វែងរកមុខវិជ្ជា IT ទាំងអស់',
    'hero.curriculum': 'មើលផ្នែកជំនាញ',
    'hero.stats.lessons': 'មេរៀនលម្អិត',
    'hero.stats.subjects': 'មុខវិជ្ជាស្នូល',
    'hero.stats.learners': 'សិស្សកំពុងរៀន',
    'hero.stats.completion': 'គម្រោងអនុវត្តផ្ទាល់',

    // Subjects Section
    'subjects.title': 'មុខវិជ្ជា IT ទាំងអស់',
    'subjects.subtitle': 'ចុចលើរូបភាព ឬកាតមុខវិជ្ជាណាមួយ ដើម្បីចូលទៅកាន់ទំព័ររៀនមេរៀនភ្លាមៗ។',
    'subjects.start': 'ចាប់ផ្តើមរៀន',
    'subjects.lessons': 'មេរៀន',
    'subjects.filter.all': 'មុខវិជ្ជាទាំងអស់',
    'subjects.filter.level': 'គ្រប់កម្រិត',
    'subjects.sort': 'តម្រៀបតាម',
    'subjects.sort.default': 'ណែនាំពិសេស',
    'subjects.sort.lessons': 'មេរៀនច្រើនជាងគេ',
    'subjects.sort.name': 'តាមឈ្មោះ A-Z',
    'subjects.empty': 'មិនមានមុខវិជ្ជាត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ។',

    // Categories Section
    'categories.title': 'ផ្នែកជំនាញ IT',
    'categories.subtitle': 'រៀបចំឡើងជាពិសេសសម្រាប់អ្នកសរសេរកម្មវិធី អ្នកគ្រប់គ្រងបណ្តាញ និងអ្នកជំនាញ IT។',
    'categories.explore': 'មើលមុខវិជ្ជា',

    // Popular Lessons
    'popular.title': 'មេរៀនពេញនិយម',
    'popular.subtitle': 'ចូលរៀនមេរៀន IT សំខាន់ៗដែលសិស្សចូលរៀនច្រើនជាងគេ។',

    // Learning Viewer
    'learn.back': 'ត្រឡប់ទៅមុខវិជ្ជាវិញ',
    'learn.instructor': 'គ្រូបង្រៀន/អ្នកបង្កើត',
    'learn.level': 'កម្រិតសិក្សា',
    'learn.objectives': 'គោលបំណងនៃការរៀន',
    'learn.curriculum': 'បញ្ជីមេរៀនទាំងអស់',
    'learn.lesson': 'មេរៀនទី',
    'learn.duration': 'រយៈពេល',
    'learn.tab.content': 'ខ្លឹមសារមេរៀន',
    'learn.tab.slides': 'ស្លាយបង្រៀន Slides',
    'learn.tab.pdf': 'ឯកសារ PDF',
    'learn.tab.code': 'កូដគំរូ Code Playground',
    'learn.tab.video': 'វីដេអូបង្រៀន',
    'learn.tab.quiz': 'តេស្តសាកល្បង Quiz',
    'learn.tab.materials': 'ឯកសារទាញយក',
    'learn.markComplete': 'សម្គាល់ថារៀនចប់',
    'learn.completed': 'បានរៀនចប់',
    'learn.prev': 'មេរៀនមុន',
    'learn.next': 'មេរៀនបន្ទាប់',
    'learn.copyCode': 'ចម្លងកូដ',
    'learn.copied': 'បានចម្លងរួចរាល់!',
    'learn.downloadPdf': 'ទាញយកឯកសារ PDF',
    'learn.downloadSlide': 'ទាញយកស្លាយ Slide Deck',

    // About Section
    'about.label': 'អំពីអ្នកបង្កើត និងវេទិកា',
    'about.creator': 'អ្នកបង្កើត និងគ្រូបណ្តុះបណ្តាល',

    // Contact
    'contact.title': 'ទំនាក់ទំនង',
    'contact.subtitle': 'មានចម្ងល់អំពីមេរៀន ឬត្រូវការការណែនាំបច្ចេកទេស? អាចទាក់ទងមកកាន់យើងខ្ញុំផ្ទាល់។',
    'contact.telegram': 'ឆានែល Telegram',
    'contact.github': 'គណនី GitHub',
    'contact.facebook': 'ទំព័រ Facebook',
    'contact.email': 'អ៊ីមែលផ្ទាល់',

    // Footer
    'footer.rights': 'រក្សាសិទ្ធិគ្រប់យ៉ាង។',
    'footer.independent': 'វេទិកាអប់រំ IT ឯករាជ្យដោយវិស្វករខ្មែរ',

    // Themes
    'theme.dark': 'ពណ៍ងងឹត (Dark)',
    'theme.light': 'សស្រាល (ច្បាស់)',
    'theme.amber': 'ពណ៍លឿង (Amber)',

    // Admin
    'admin.dashboard': 'ផ្ទាំងគ្រប់គ្រង',
    'admin.subjects': 'គ្រប់គ្រងមុខវិជ្ជា',
    'admin.categories': 'គ្រប់គ្រងផ្នែក',
    'admin.lessons': 'គ្រប់គ្រងមេរៀន',
    'admin.materials': 'ឯកសារទាញយក',
    'admin.users': 'គ្រប់គ្រងអ្នកប្រើ',
    'admin.activityLogs': 'កំណត់ហេតុសកម្មភាព',
    'admin.settings': 'ការកំណត់ និង Branding',
    'admin.profile': 'ព័ត៌មាន Admin',
    'admin.laravelSpec': 'Laravel API Specs',
    'admin.quickAction.subject': '+ បន្ថែមមុខវិជ្ជា',
    'admin.quickAction.lesson': '+ បន្ថែមមេរៀន',
    'admin.quickAction.material': '+ បង្ហោះឯកសារ',
    'admin.quickAction.category': '+ បន្ថែមផ្នែក',
    'admin.quickAction.branding': 'កំណត់ Branding'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('devlearn_lang');
    return (saved === 'kh' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('devlearn_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.body.setAttribute('data-lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
