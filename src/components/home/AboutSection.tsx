import React from 'react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { CheckCircle2, User, Award, Terminal } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { settings } = useSettings();
  const { language, t } = useLanguage();
  const isKh = language === 'kh';

  const heading = isKh ? (settings?.aboutHeadingKh || settings?.aboutHeading) : settings?.aboutHeading;
  const text = isKh ? (settings?.aboutTextKh || settings?.aboutText) : settings?.aboutText;
  const creatorName = isKh ? (settings?.creatorNameKh || settings?.creatorName) : settings?.creatorName;
  const creatorBio = isKh ? (settings?.creatorBioKh || settings?.creatorBio) : settings?.creatorBio;
  const creatorRole = isKh ? (settings?.creatorRoleKh || settings?.creatorRole) : settings?.creatorRole;

  return (
    <section id="about" className="py-20 bg-slate-900/30 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Creator Identity */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
            <div className="relative">
              <div className="h-32 w-32 rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-slate-900 shadow-xl">
                <img
                  src={settings?.creatorAvatar || '/src/assets/images/creator_profile_avatar_1790863234093.jpg'}
                  alt={creatorName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
                <Terminal className="h-4 w-4" />
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {t('about.creator')}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{creatorName}</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{creatorRole}</p>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {creatorBio}
            </p>
          </div>

          {/* Right Column: Platform Purpose & Quality Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {t('about.label')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                {heading || 'Built by an Engineer, for Future Developers'}
              </h2>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {text}
            </p>

            {/* Highlights List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(settings?.aboutHighlights || [
                "Practical code-first curriculum with real-world scenarios",
                "Interactive in-browser slides, PDF document reader, and code examples",
                "Structured progression from absolute beginner to industry-ready engineer",
                "100% free community access to foundational knowledge"
              ]).map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-snug">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
