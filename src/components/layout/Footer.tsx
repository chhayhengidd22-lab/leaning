import React from 'react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Send, Github, Facebook, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const { language, t } = useLanguage();

  const siteName = language === 'kh' ? (settings?.siteNameKh || settings?.siteName) : settings?.siteName;
  const creatorName = language === 'kh' ? (settings?.creatorNameKh || settings?.creatorName) : settings?.creatorName;
  const creatorRole = language === 'kh' ? (settings?.creatorRoleKh || settings?.creatorRole) : settings?.creatorRole;
  const footerText = language === 'kh' ? (settings?.footerTextKh || settings?.footerText) : settings?.footerText;

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Platform & Creator Branding */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-sm">
                {settings?.logoText ? settings.logoText.slice(0, 2).toUpperCase() : 'DL'}
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                {siteName}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {footerText || 'Empowering students and aspiring software developers with practical, project-grounded IT education.'}
            </p>
            <div className="pt-2 flex items-center gap-3">
              {settings?.telegramUsername && (
                <a
                  href={`https://t.me/${settings.telegramUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-colors"
                  title="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
              )}
              {settings?.githubUrl && (
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-colors"
                  title="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-colors"
                  title="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-colors"
                  title="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Curriculum
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('subjects')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t('nav.subjects')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t('nav.categories')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Instructor & Contact Details */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Instructor & Support
            </p>
            <div className="text-sm space-y-1.5">
              <p className="font-medium text-slate-200">{creatorName}</p>
              <p className="text-xs text-slate-400">{creatorRole}</p>
              {settings?.email && (
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>{settings.email}</span>
                </div>
              )}
              {settings?.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{settings.phone}</span>
                </div>
              )}
              {settings?.address && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{settings.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            &copy; {settings?.copyrightYear || '2026'} {siteName}. {t('footer.rights')}
          </p>
          <p className="text-slate-400">
            {t('footer.independent')} · <span className="text-slate-300 font-medium">{creatorName}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
