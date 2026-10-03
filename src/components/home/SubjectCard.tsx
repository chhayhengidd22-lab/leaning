import React from 'react';
import { Subject } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { BookOpen, ArrowRight, Play, User, MapPin } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  onSelect: (subject: Subject) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onSelect }) => {
  const { language, t } = useLanguage();
  const { isLight, isAmber } = useTheme();
  const isKh = language === 'kh';

  const name = isKh ? (subject.nameKh || subject.name) : subject.name;
  const shortDescription = isKh ? (subject.shortDescriptionKh || subject.shortDescription) : subject.shortDescription;

  return (
    <div
      onClick={() => onSelect(subject)}
      className={`group cursor-pointer rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl ${
        isLight
          ? 'border-slate-300 bg-white hover:border-indigo-400 hover:shadow-indigo-500/10'
          : isAmber
          ? 'border-zinc-800 bg-zinc-950/80 hover:border-amber-500/50 hover:shadow-amber-500/10'
          : 'border-slate-800 bg-slate-900/70 hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-indigo-950/30'
      }`}
    >
      {/* Clickable Subject Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <img
          src={subject.coverImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback gradient background if image doesn't load */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 flex items-center justify-center p-6 text-center">
          <span className="text-sm font-semibold text-slate-400">{name}</span>
        </div>

        {/* Measured Scrim for contrast overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Start Learning Overlay Button on Image Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg shadow-black/50 transform translate-y-2 group-hover:translate-y-0 transition-transform ${
            isAmber ? 'bg-amber-500 text-zinc-950' : 'bg-indigo-600'
          }`}>
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{t('subjects.start')}</span>
          </div>
        </div>

        {/* Top Badges (Category + Academic Year/Semester) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white border border-white/10">
            {subject.academicYear ? `${subject.academicYear} · ${subject.semester}` : (subject.categoryName || 'IT Subject')}
          </span>

          {subject.credits && (
            <span className="rounded-lg bg-amber-500/90 text-zinc-950 font-bold px-2 py-0.5 text-[10px] shadow-sm">
              {subject.credits} Credits
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Metadata: Room & Number of Lessons */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <MapPin className="h-3 w-3 text-slate-500" />
              <span>{subject.room || 'Room 204'}</span>
            </span>
            <span className="tabular-nums font-semibold text-indigo-400">
              {subject.lessonsCount} {t('subjects.lessons')}
            </span>
          </div>

          <h3 className={`text-base font-bold transition-colors line-clamp-2 leading-snug ${
            isLight ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-300'
          } ${isKh ? 'font-khmer' : ''}`}>
            {name}
          </h3>

          {/* Lecturer Info */}
          {subject.lecturerName && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <User className="h-3 w-3 text-slate-500 shrink-0" />
              <span className={`truncate ${isKh ? 'font-khmer' : ''}`}>
                {isKh ? 'សាស្ត្រាចារ្យ: ' : 'Lecturer: '}
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {subject.lecturerName}
                </span>
                {subject.lecturerTel && (
                  <span className="opacity-70 ml-1 text-[11px]">({subject.lecturerTel})</span>
                )}
              </span>
            </div>
          )}

          <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'} ${isKh ? 'font-khmer' : ''}`}>
            {shortDescription}
          </p>
        </div>

        {/* Learning Action Footer */}
        <div className={`pt-3 border-t flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <span className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${
            isAmber
              ? 'text-amber-400 group-hover:text-amber-300'
              : 'text-indigo-500 group-hover:text-indigo-400'
          } ${isKh ? 'font-khmer' : ''}`}>
            {t('subjects.start')}
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
          <BookOpen className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};
