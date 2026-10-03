import React from 'react';
import { Lesson } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PlayCircle, Clock, FileText, ArrowRight } from 'lucide-react';

interface PopularLessonsProps {
  lessons: Lesson[];
  onSelectLesson: (lessonId: string) => void;
}

export const PopularLessons: React.FC<PopularLessonsProps> = ({ lessons, onSelectLesson }) => {
  const { language, t } = useLanguage();
  const isKh = language === 'kh';

  return (
    <section className="py-16 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('popular.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {t('popular.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.slice(0, 6).map(lesson => {
            const title = isKh ? (lesson.titleKh || lesson.title) : lesson.title;

            return (
              <div
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                className="group cursor-pointer rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 hover:border-indigo-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-indigo-400">{lesson.subjectName}</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span className="tabular-nums">{lesson.duration}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {lesson.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    {lesson.videoUrl && (
                      <span className="flex items-center gap-1 text-sky-400 font-medium">
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span>Video</span>
                      </span>
                    )}
                    {lesson.pdfUrl && (
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <FileText className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    {t('subjects.start')}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
