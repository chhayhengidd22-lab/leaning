import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { AdminPhotoModal } from '../admin/AdminPhotoModal.tsx';
import {
  ArrowRight,
  BookOpen,
  Layers,
  Terminal,
  Sparkles,
  Send,
  Github,
  Camera,
  Check
} from 'lucide-react';

interface HeroSectionProps {
  onExplore: () => void;
  onViewCategories: () => void;
  totalLessons: number;
  totalSubjects: number;
  onOpenAdminSettings?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplore,
  onViewCategories,
  totalLessons,
  totalSubjects,
  onOpenAdminSettings
}) => {
  const { settings, updateSettings } = useSettings();
  const { language, t } = useLanguage();
  const { theme, isLight, isAmber } = useTheme();
  const { isAdmin } = useAuth();

  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const isKh = language === 'kh';
  const heroTitle = isKh ? (settings?.heroTitleKh || settings?.heroTitle) : settings?.heroTitle;
  const heroSubtitle = isKh ? (settings?.heroSubtitleKh || settings?.heroSubtitle) : settings?.heroSubtitle;
  const heroDescription = isKh ? (settings?.heroDescriptionKh || settings?.heroDescription) : settings?.heroDescription;
  const creatorName = isKh ? (settings?.creatorNameKh || settings?.creatorName) : settings?.creatorName;
  const creatorRole = isKh ? (settings?.creatorRoleKh || settings?.creatorRole) : settings?.creatorRole;
  const creatorAvatar = settings?.creatorAvatar || '/src/assets/images/creator_standing_cutout_1790941029628.jpg';

  const layout = settings?.headerLayout || 'split-right-avatar';
  const photoStyle = settings?.creatorPhotoStyle || 'cutout-transparent';
  const photoPose = settings?.creatorPhotoPose || 'standing';

  // Responsive height and sizing based on pose (standing vs sitting)
  let photoHeightClass = 'h-[360px] sm:h-[420px] md:h-[480px] lg:h-[530px] max-w-[340px] sm:max-w-[420px]';
  if (photoPose === 'sitting') {
    photoHeightClass = 'h-[280px] sm:h-[340px] md:h-[400px] lg:h-[450px] max-w-[420px] sm:max-w-[490px]';
  }

  // Handle direct posture toggle for Admin
  const handleTogglePose = async (newPose: 'standing' | 'sitting') => {
    if (!isAdmin) return;
    try {
      await updateSettings({ creatorPhotoPose: newPose });
    } catch (err) {
      console.error('Failed to update pose:', err);
    }
  };

  // Section theme classes
  const sectionBgClass = isLight
    ? 'bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200'
    : isAmber
    ? 'bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 border-b border-zinc-800/80'
    : 'bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 border-b border-slate-800/60';

  const trustBadgeClass = isLight
    ? 'border-indigo-200 bg-indigo-50/90 text-indigo-700 shadow-sm'
    : isAmber
    ? 'border-amber-500/30 bg-amber-950/40 text-amber-300 shadow-sm'
    : 'border-indigo-500/20 bg-indigo-950/40 text-indigo-300 shadow-sm';

  const mainTitleClass = isLight
    ? 'text-slate-900'
    : isAmber
    ? 'text-zinc-100'
    : 'text-slate-100';

  const subtitleGradient = isLight
    ? 'bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-800 bg-clip-text text-transparent'
    : isAmber
    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent';

  const descClass = isLight
    ? 'text-slate-700'
    : isAmber
    ? 'text-zinc-300'
    : 'text-slate-300';

  const primaryBtnClass = isLight
    ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/25 focus-visible:ring-indigo-500'
    : isAmber
    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/25 focus-visible:ring-amber-400'
    : 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 focus-visible:ring-indigo-400';

  const secondaryBtnClass = isLight
    ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm'
    : isAmber
    ? 'border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200'
    : 'border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-200';

  const statNumberClass = isLight
    ? 'text-slate-900'
    : isAmber
    ? 'text-white'
    : 'text-white';

  const statLabelClass = isLight
    ? 'text-slate-600'
    : isAmber
    ? 'text-zinc-400'
    : 'text-slate-400';

  // Left Content Block (Title, Subtitle, Description, Actions, Stats)
  const contentBlock = (
    <div className="flex-1 space-y-6 text-left">
      {/* Creator Trust Badge */}
      <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm ${trustBadgeClass}`}>
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className={isKh ? 'font-khmer' : ''}>
          {creatorName} · {creatorRole}
        </span>
      </div>

      <div className="space-y-3.5">
        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${isKh ? 'font-khmer leading-snug' : ''}`}>
          <span className={`block ${mainTitleClass}`}>{heroTitle || 'IT Learning Platform'}</span>
          <span className={`block ${subtitleGradient}`}>
            {heroSubtitle || 'Learn IT Skills Easily'}
          </span>
        </h1>

        <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${descClass} ${isKh ? 'font-khmer leading-loose' : ''}`}>
          {heroDescription || 'Hands-on IT courses covering Programming, Web Development, Databases, Networking, and Cybersecurity.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={onExplore}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm transition-all hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 ${primaryBtnClass} ${isKh ? 'font-khmer' : ''}`}
        >
          <span>{t('hero.explore')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={onViewCategories}
          className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${secondaryBtnClass} ${isKh ? 'font-khmer' : ''}`}
        >
          <Layers className={`h-4 w-4 ${isAmber ? 'text-amber-400' : 'text-indigo-500'}`} />
          <span>{t('hero.curriculum')}</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className={`grid grid-cols-3 gap-4 pt-4 border-t max-w-lg ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
        <div>
          <p className={`text-2xl font-bold tabular-nums ${statNumberClass}`}>{totalSubjects || 6}+</p>
          <p className={`text-xs ${statLabelClass} ${isKh ? 'font-khmer' : ''}`}>{t('hero.stats.subjects')}</p>
        </div>
        <div>
          <p className={`text-2xl font-bold tabular-nums ${statNumberClass}`}>{totalLessons || 35}+</p>
          <p className={`text-xs ${statLabelClass} ${isKh ? 'font-khmer' : ''}`}>{t('hero.stats.lessons')}</p>
        </div>
        <div>
          <p className={`text-2xl font-bold tabular-nums ${statNumberClass}`}>100%</p>
          <p className={`text-xs ${statLabelClass} ${isKh ? 'font-khmer' : ''}`}>{t('hero.stats.completion')}</p>
        </div>
      </div>
    </div>
  );

  // Ambient backlight based on active theme
  const backlightClass = isLight
    ? 'bg-gradient-to-t from-indigo-200/30 via-sky-100/20 to-transparent'
    : isAmber
    ? 'bg-gradient-to-t from-amber-600/20 via-yellow-500/10 to-transparent'
    : 'bg-gradient-to-t from-indigo-600/20 via-cyan-500/10 to-transparent';

  const pedestalClass = isLight
    ? 'bg-indigo-300/20 blur-xl'
    : isAmber
    ? 'bg-amber-500/25 blur-xl'
    : 'bg-indigo-500/25 blur-xl';

  // Identity capsule card at the base of the image
  const identityCapsuleClass = isLight
    ? 'border-slate-200 bg-white/95 text-slate-900 shadow-xl'
    : isAmber
    ? 'border-zinc-800 bg-zinc-950/90 text-white shadow-2xl'
    : 'border-slate-800/80 bg-slate-950/90 text-white shadow-2xl';

  // Right Side Avatar / Creator Photo Block (supports Transparent PNG Cutout for Standing / Sitting Poses)
  const avatarBlock = (
    <div className="flex-shrink-0 flex flex-col items-center justify-end relative group">
      {/* Background Soft Ambient Light / Backlight matching Web App Color */}
      <div className={`absolute -inset-4 rounded-full blur-3xl pointer-events-none ${backlightClass}`} />

      {/* Pedestal glow ellipse for transparent PNG cutout */}
      <div className={`absolute bottom-0 w-3/4 h-8 rounded-full pointer-events-none ${pedestalClass}`} />

      {/* ADMIN-ONLY QUICK CONTROLS: Only visible to authenticated Admin */}
      {isAdmin && (
        <div className="mb-2 z-20 flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/95 p-1 shadow-xl backdrop-blur-md">
          {/* Posture quick buttons: Standing vs Sitting */}
          <button
            type="button"
            onClick={() => handleTogglePose('standing')}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
              photoPose === 'standing'
                ? isAmber
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            } ${isKh ? 'font-khmer' : ''}`}
            title="Switch to Standing Pose (រូបឈរ)"
          >
            <span>🧍</span>
            <span>{isKh ? 'រូបឈរ' : 'Standing'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTogglePose('sitting')}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-all ${
              photoPose === 'sitting'
                ? isAmber
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            } ${isKh ? 'font-khmer' : ''}`}
            title="Switch to Sitting Pose (រូបអង្គុយ)"
          >
            <span>🪑</span>
            <span>{isKh ? 'រូបអង្គុយ' : 'Sitting'}</span>
          </button>

          <span className="h-3.5 w-px bg-slate-700 mx-0.5" />

          {/* Upload / Modal trigger */}
          <button
            type="button"
            onClick={() => setPhotoModalOpen(true)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-slate-800 transition-colors ${isKh ? 'font-khmer' : ''}`}
            title="Admin Only: Upload PNG or Change Photo"
          >
            <Camera className="h-3.5 w-3.5 text-amber-400" />
            <span>{isKh ? 'ដូររូប PNG' : 'Upload PNG'}</span>
          </button>
        </div>
      )}

      {photoStyle === 'cutout-transparent' ? (
        /* Transparent PNG Cutout Style (Standing or Sitting with Web-App Color Matching) */
        <div className="relative flex flex-col items-center">
          <div className="relative [mask-image:linear-gradient(to_bottom,black_86%,transparent_100%)]">
            <img
              src={creatorAvatar}
              alt={creatorName || 'Instructor'}
              className={`${photoHeightClass} w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02] filter drop-shadow-[0_20px_35px_rgba(99,102,241,0.2)]`}
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback image if broken
                (e.target as HTMLImageElement).src = '/src/assets/images/creator_standing_cutout_1790941029628.jpg';
              }}
            />
          </div>

          {/* Floating Minimal Identity Capsule (Pure Web App Blended) */}
          <div className={`mt-2 inline-flex items-center gap-3 rounded-2xl border px-4 py-2 backdrop-blur-md ${identityCapsuleClass}`}>
            <div className="text-left">
              <p className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-white'} ${isKh ? 'font-khmer' : ''}`}>
                {creatorName}
              </p>
              <p className={`text-[11px] font-semibold ${isAmber ? 'text-amber-400' : 'text-indigo-500'} ${isKh ? 'font-khmer' : ''}`}>
                {creatorRole}
              </p>
            </div>

            <div className={`flex items-center gap-1.5 pl-2 border-l ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              {settings?.telegramUsername && (
                <a
                  href={`https://t.me/${settings.telegramUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-1.5 transition-colors ${
                    isLight ? 'bg-slate-100 text-slate-700 hover:text-indigo-600 hover:bg-slate-200' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Telegram"
                >
                  <Send className="h-3 w-3" />
                </a>
              )}
              {settings?.githubUrl && (
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-1.5 transition-colors ${
                    isLight ? 'bg-slate-100 text-slate-700 hover:text-indigo-600 hover:bg-slate-200' : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="GitHub"
                >
                  <Github className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Framed Style (Rounded Frame) */
        <div className="relative">
          <div className={`relative h-72 w-72 sm:h-80 sm:w-80 md:h-96 md:w-96 rounded-3xl overflow-hidden border shadow-2xl ${
            isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/90'
          }`}>
            <img
              src={creatorAvatar}
              alt={creatorName || 'Instructor'}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-5">
              <p className={`text-sm font-bold text-white leading-tight ${isKh ? 'font-khmer' : ''}`}>{creatorName}</p>
              <p className={`text-xs text-indigo-300 font-medium ${isKh ? 'font-khmer' : ''}`}>{creatorRole}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <section className={`relative overflow-hidden py-12 md:py-20 transition-colors ${sectionBgClass}`}>
        {/* Subtle background grid pattern */}
        <div className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem]'
            : 'bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]'
        }`} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {layout === 'split-left-avatar' ? (
            <div className="flex flex-col-reverse md:flex-row items-center gap-10 lg:gap-16">
              {avatarBlock}
              {contentBlock}
            </div>
          ) : layout === 'centered' ? (
            <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
              {avatarBlock}
              {contentBlock}
            </div>
          ) : (
            /* Default: Right Side Photo (Standing/Sitting Cutout), Left Side Content */
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-16">
              {contentBlock}
              {avatarBlock}
            </div>
          )}
        </div>
      </section>

      {/* Admin Photo Modal */}
      {isAdmin && (
        <AdminPhotoModal
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
        />
      )}
    </>
  );
};
