import React, { useState } from 'react';
import { Subject, Category } from '../../types/index.ts';
import { SubjectCard } from './SubjectCard.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { Search, Filter, SlidersHorizontal, GraduationCap } from 'lucide-react';

interface FeaturedSubjectsProps {
  subjects: Subject[];
  categories: Category[];
  onSelectSubject: (subject: Subject) => void;
  selectedCategory?: string;
  onCategoryChange?: (catId: string) => void;
}

export const FeaturedSubjects: React.FC<FeaturedSubjectsProps> = ({
  subjects,
  categories,
  onSelectSubject,
  selectedCategory = 'all',
  onCategoryChange
}) => {
  const { language, t } = useLanguage();
  const { isLight, isAmber } = useTheme();
  const isKh = language === 'kh';

  const [activeTab, setActiveTab] = useState<string>(selectedCategory);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleTabClick = (catId: string) => {
    setActiveTab(catId);
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
  };

  // Filter subjects based on Category, Academic Year, and Search Query
  let filtered = subjects.filter(s => {
    // Category match
    if (activeTab !== 'all' && s.categoryId !== activeTab) {
      return false;
    }
    // Academic Year match
    if (selectedYear !== 'all' && s.academicYear !== selectedYear) {
      return false;
    }
    // Search match (checks title, Khmer title, description, and Lecturer name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = s.name.toLowerCase();
      const nameKh = (s.nameKh || '').toLowerCase();
      const desc = (s.description || '').toLowerCase();
      const lecturer = (s.lecturerName || '').toLowerCase();
      if (!name.includes(q) && !nameKh.includes(q) && !desc.includes(q) && !lecturer.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Sort
  if (sortBy === 'lessons') {
    filtered = [...filtered].sort((a, b) => b.lessonsCount - a.lessonsCount);
  } else if (sortBy === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered = [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return (
    <section id="subjects" className={`py-16 transition-colors ${isLight ? 'bg-slate-50' : 'bg-slate-950'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-400 mb-2">
              <GraduationCap className="h-4 w-4" />
              <span>{isKh ? 'កម្មវិធីសិក្សា BBU IT (Promotion 19)' : 'Build Bright University IT Curriculum'}</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t('subjects.title')} ({subjects.length})
            </h2>
            <p className={`mt-2 text-sm max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'} ${isKh ? 'font-khmer' : ''}`}>
              {isKh
                ? 'ចុចលើរូបភាព ឬកាតមុខវិជ្ជាណាមួយ ដើម្បីចូលទៅកាន់ទំព័ររៀន អូសមើលឯកសារ PDF និងទាញយកមេរៀនភ្លាមៗ។'
                : t('subjects.subtitle')}
            </p>
          </div>

          {/* Search bar inside section */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKh ? 'ស្វែងរកមុខវិជ្ជា ឬឈ្មោះគ្រូ...' : 'Search subjects or lecturer...'}
              className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs transition-colors focus:outline-none ${
                isLight
                  ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                  : 'border-slate-800 bg-slate-900/90 text-white placeholder-slate-500 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>

        {/* Academic Year Quick Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          <span className={`text-xs font-bold uppercase tracking-wider mr-2 ${isLight ? 'text-slate-500' : 'text-slate-400'} ${isKh ? 'font-khmer' : ''}`}>
            {isKh ? 'កម្រិតឆ្នាំសិក្សា:' : 'Academic Year:'}
          </span>
          {[
            { id: 'all', label: isKh ? 'គ្រប់ឆ្នាំ (All Years)' : 'All Years' },
            { id: 'Year 1', label: isKh ? 'ឆ្នាំទី ១ (Year 1)' : 'Year 1' },
            { id: 'Year 2', label: isKh ? 'ឆ្នាំទី ២ (Year 2)' : 'Year 2' },
            { id: 'Year 3', label: isKh ? 'ឆ្នាំទី ៣ (Year 3)' : 'Year 3' },
            { id: 'Year 4', label: isKh ? 'ឆ្នាំទី ៤ (Year 4)' : 'Year 4' }
          ].map(y => (
            <button
              key={y.id}
              onClick={() => setSelectedYear(y.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === y.id
                  ? isAmber
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : isLight
                  ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
              } ${isKh ? 'font-khmer' : ''}`}
            >
              {y.label}
            </button>
          ))}
        </div>

        {/* Semester / Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <button
            onClick={() => handleTabClick('all')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? isAmber
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            {t('subjects.filter.all')} ({subjects.length})
          </button>

          {categories.map(cat => {
            const catName = language === 'kh' ? (cat.nameKh || cat.name) : cat.name;
            const count = subjects.filter(s => s.categoryId === cat.id).length;
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleTabClick(cat.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? isAmber
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : isLight
                    ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                } ${isKh ? 'font-khmer' : ''}`}
              >
                <span>{catName}</span>
                <span className="opacity-75 text-[11px] font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Subjects Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onSelect={onSelectSubject}
              />
            ))}
          </div>
        ) : (
          <div className={`rounded-2xl border p-12 text-center my-6 ${
            isLight ? 'border-slate-300 bg-white' : 'border-slate-800 bg-slate-900/40'
          }`}>
            <p className="text-sm text-slate-400">{t('subjects.empty')}</p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedYear('all');
                setSearchQuery('');
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
