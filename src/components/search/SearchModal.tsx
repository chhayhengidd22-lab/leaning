import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.ts';
import { Subject, Lesson, Category } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Search, X, BookOpen, Layers, FileCode, ArrowRight, CornerDownLeft } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubject: (subject: Subject) => void;
  onSelectLesson: (lessonId: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSubject,
  onSelectLesson,
  onSelectCategory
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    subjects: Subject[];
    lessons: Lesson[];
    categories: Category[];
  }>({ subjects: [], lessons: [], categories: [] });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ subjects: [], lessons: [], categories: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ subjects: [], lessons: [], categories: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      api.search(query)
        .then(res => {
          if (res.success && res.data) {
            setResults(res.data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Global shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults = results.subjects.length + results.lessons.length + results.categories.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-800 px-4 py-3.5 gap-3">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, lessons, and technologies..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching database...
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-300">No results found for "{query}"</p>
              <p className="text-xs text-slate-500">Try searching for "Python", "Web", "Database", "Networking", or "Linux".</p>
            </div>
          )}

          {/* Subjects results */}
          {results.subjects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <BookOpen className="h-3.5 w-3.5" />
                <span>IT Subjects ({results.subjects.length})</span>
              </div>
              <div className="space-y-1">
                {results.subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSubject(s);
                      onClose();
                    }}
                    className="w-full text-left rounded-xl p-3 text-xs bg-slate-950/60 hover:bg-slate-800 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-semibold text-white group-hover:text-indigo-300">{s.name}</p>
                      <p className="text-slate-400 line-clamp-1">{s.shortDescription}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lessons results */}
          {results.lessons.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <FileCode className="h-3.5 w-3.5" />
                <span>Lessons ({results.lessons.length})</span>
              </div>
              <div className="space-y-1">
                {results.lessons.map(l => (
                  <button
                    key={l.id}
                    onClick={() => {
                      onSelectLesson(l.id);
                      onClose();
                    }}
                    className="w-full text-left rounded-xl p-3 text-xs bg-slate-950/60 hover:bg-slate-800 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-semibold text-white group-hover:text-emerald-300">{l.title}</p>
                      <p className="text-slate-400 line-clamp-1">{l.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories results */}
          {results.categories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                <Layers className="h-3.5 w-3.5" />
                <span>Categories ({results.categories.length})</span>
              </div>
              <div className="space-y-1">
                {results.categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCategory(c.id);
                      onClose();
                    }}
                    className="w-full text-left rounded-xl p-3 text-xs bg-slate-950/60 hover:bg-slate-800 transition-colors flex items-center justify-between group"
                  >
                    <span className="font-semibold text-white group-hover:text-purple-300">{c.name}</span>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-purple-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-slate-800 px-4 py-2.5 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Search IT knowledge base</span>
          <div className="flex items-center gap-3">
            <span><kbd className="rounded bg-slate-800 px-1 py-0.5 border border-slate-700">ESC</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
