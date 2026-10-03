import React from 'react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Send, Github, Facebook, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { settings } = useSettings();
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('contact.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Telegram */}
          {settings?.telegramUsername && (
            <a
              href={`https://t.me/${settings.telegramUsername.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-sky-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400 group-hover:scale-110 transition-transform">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    {t('contact.telegram')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">@{settings.telegramUsername.replace('@', '')}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-sky-400 group-hover:underline">
                <span>Join Channel</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </a>
          )}

          {/* GitHub */}
          {settings?.githubUrl && (
            <a
              href={settings.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-200 group-hover:scale-110 transition-transform">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {t('contact.github')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Open source code repos</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:underline">
                <span>Visit Repos</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </a>
          )}

          {/* Email */}
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {t('contact.email')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 truncate">{settings.email}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:underline">
                <span>Send Message</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </a>
          )}

          {/* Facebook / Community */}
          {settings?.facebookUrl && (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-blue-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-400 group-hover:scale-110 transition-transform">
                  <Facebook className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {t('contact.facebook')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Community page</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:underline">
                <span>Follow Page</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
