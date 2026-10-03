import React, { useState, useEffect } from 'react';
import { Subject, Lesson } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  PlayCircle,
  FileText,
  CheckCircle,
  Circle,
  HelpCircle,
  Layers,
  Award,
  User,
  ChevronRight
} from 'lucide-react';

interface SubjectLearningViewProps {
  subjectSlug: string;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export const SubjectLearningView: React.FC<SubjectLearningViewProps> = ({
  subjectSlug,
  onBack,
  onSelectLesson
}) => {
  const { language, t } = useLanguage();
  const { settings } = useSettings();
  const { user } = useAuth();
  const [subject, setSubject] = useState<(Subject & { lessons: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const isKh = language === 'kh';

  useEffect(() => {
    setLoading(true);
    api.getSubjectBySlug(subjectSlug)
      .then(res => {
        if (res.success && res.data) {
          setSubject(res.data);
        }
      })
      .catch(err => console.error('Failed to load subject:', err))
      .finally(() => setLoading(false));

    // Load progress if user is logged in
    if (user) {
      api.getProgress().then(res => {
        if (res.success && res.data) {
          const match = res.data.find(p => p.subjectId === subject?.id || p.subjectId === subjectSlug);
          if (match) {
            setCompletedLessonIds(match.completedLessonIds);
          }
        }
      }).catch(() => {});
    }
  }, [subjectSlug, user, subject?.id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-r-transparent" />
        <p className="mt-3 text-xs text-slate-400">Loading subject curriculum...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-400">Subject not found.</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('learn.back')}
        </button>
      </div>
    );
  }

  const name = isKh ? (subject.nameKh || subject.name) : subject.name;
  const desc = isKh ? (subject.descriptionKh || subject.description) : subject.description;
  const lessons = subject.lessons || [];
  const progressPercent = lessons.length > 0 ? Math.round((completedLessonIds.length / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Link */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('learn.back')}</span>
        </button>

        {/* Hero Card of Subject */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Details */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Metadata: Unboxed text with subtle separators */}
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold tracking-wide">
                  <span>{subject.categoryName || 'IT Subject'}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400">{subject.level}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400 tabular-nums">{lessons.length} {t('subjects.lessons')}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {name}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {desc}
                </p>

                {/* Progress Bar (if logged in) */}
                {user && (
                  <div className="pt-2 max-w-md space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Curriculum Progress</span>
                      <span className="font-semibold text-indigo-400 tabular-nums">{progressPercent}% Completed</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Lecturer, Academic Details & Action */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold text-sm">
                    {subject.lecturerName ? subject.lecturerName.slice(0, 2).toUpperCase() : 'IT'}
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">{isKh ? 'សាស្ត្រាចារ្យទទួលបន្ទុក' : t('learn.instructor')}</p>
                    <p className="font-bold text-white text-sm">{subject.lecturerName || settings?.creatorName || 'Instructor'}</p>
                    {subject.lecturerTel && (
                      <p className="text-[11px] text-indigo-400 font-mono">Tel: {subject.lecturerTel}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {subject.credits && (
                    <span className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-300">
                      {subject.credits} Credits · {subject.room || 'Room 204'}
                    </span>
                  )}

                  {lessons.length > 0 && (
                    <button
                      onClick={() => onSelectLesson(lessons[0].id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
                    >
                      <span>{isKh ? 'ចាប់ផ្តើមរៀនមេរៀនទី ១' : 'Start First Lesson'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Cover Image */}
            <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto h-full min-h-[260px] bg-slate-950">
              <img
                src={subject.coverImage}
                alt={name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 lg:from-slate-900/90 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Learning Objectives Section */}
        {subject.learningObjectives && subject.learningObjectives.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-400" />
              <span>{t('learn.objectives')}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subject.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curriculum / Lessons List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              <span>{t('learn.curriculum')}</span>
            </h2>
            <span className="text-xs text-slate-400 tabular-nums">
              {lessons.length} {t('subjects.lessons')}
            </span>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const lessonTitle = isKh ? (lesson.titleKh || lesson.title) : lesson.title;

              return (
                <div
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson.id)}
                  className="group cursor-pointer rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Lesson Number or Completion status */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-bold text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400 group-hover:text-white" />
                      ) : (
                        <span className="tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {lessonTitle}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span className="tabular-nums">{lesson.duration || '20 mins'}</span>
                        </span>
                        {lesson.hasVideo && (
                          <span className="flex items-center gap-1 text-sky-400">
                            <PlayCircle className="h-3 w-3" />
                            <span>Video</span>
                          </span>
                        )}
                        {lesson.hasPdf && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <FileText className="h-3 w-3" />
                            <span>PDF</span>
                          </span>
                        )}
                        {lesson.hasSlides && (
                          <span className="flex items-center gap-1 text-purple-400">
                            <Layers className="h-3 w-3" />
                            <span>Slides</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-xs font-semibold text-indigo-400 group-hover:underline">
                      Open Lesson
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
