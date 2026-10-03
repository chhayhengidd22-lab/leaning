import React from 'react';
import { Category } from '../../types/index.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Code, Globe, Database, ShieldCheck, Terminal, Cpu, Cloud, GraduationCap, Layers, ArrowRight } from 'lucide-react';

interface CategoriesGridProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="h-6 w-6 text-sky-400" />,
  Globe: <Globe className="h-6 w-6 text-indigo-400" />,
  Database: <Database className="h-6 w-6 text-emerald-400" />,
  ShieldCheck: <ShieldCheck className="h-6 w-6 text-rose-400" />,
  Terminal: <Terminal className="h-6 w-6 text-amber-400" />,
  Cpu: <Cpu className="h-6 w-6 text-purple-400" />,
  Cloud: <Cloud className="h-6 w-6 text-purple-400" />,
  GraduationCap: <GraduationCap className="h-6 w-6 text-pink-400" />,
  Layers: <Layers className="h-6 w-6 text-cyan-400" />
};

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories, onSelectCategory }) => {
  const { language, t } = useLanguage();
  const isKh = language === 'kh';

  return (
    <section id="categories" className="py-16 bg-slate-900/40 border-y border-slate-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('categories.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => {
            const name = isKh ? (cat.nameKh || cat.name) : cat.name;
            const desc = isKh ? (cat.descriptionKh || cat.description) : cat.description;
            const icon = iconMap[cat.icon] || <Code className="h-6 w-6 text-indigo-400" />;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group cursor-pointer rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 hover:border-indigo-500/40 hover:bg-slate-900 transition-all hover:translate-y-[-2px] flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {cat.subjectsCount || 0} {t('nav.subjects')}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    {t('categories.explore')}
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
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
