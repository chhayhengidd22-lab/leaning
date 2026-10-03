import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileCode,
  Download,
  Users,
  Activity,
  Settings,
  UserCheck,
  Code2,
  LogOut,
  ArrowLeft,
  PlusCircle,
  Sparkles,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onExitAdmin: () => void;
  onQuickAction: (action: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onExitAdmin,
  onQuickAction,
  children
}) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
    { id: 'subjects', label: t('admin.subjects'), icon: BookOpen },
    { id: 'categories', label: t('admin.categories'), icon: Layers },
    { id: 'lessons', label: t('admin.lessons'), icon: FileCode },
    { id: 'materials', label: t('admin.materials'), icon: Download },
    { id: 'users', label: t('admin.users'), icon: Users },
    { id: 'activity', label: t('admin.activityLogs'), icon: Activity },
    { id: 'settings', label: t('admin.settings'), icon: Settings },
    { id: 'profile', label: t('admin.profile'), icon: UserCheck },
    { id: 'laravel-spec', label: 'Laravel MVC Architecture', icon: Code2 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between transform transition-transform duration-200 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight">Admin Console</p>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[130px]">
                  {settings?.siteName || 'DevLearn IT'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  data-admin-tab={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer profile & exit */}
        <div className="border-t border-slate-800 p-4 space-y-3 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
              <img
                src={user?.avatar || settings?.creatorAvatar || '/src/assets/images/creator_profile_avatar_1790863234093.jpg'}
                alt={user?.name || 'Admin'}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onExitAdmin}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Public Site</span>
            </button>
            <button
              onClick={() => {
                logout();
                onExitAdmin();
              }}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-rose-400 hover:bg-rose-950/40 hover:border-rose-800/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header with Quick Actions */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              {navItems.find(i => i.id === currentTab)?.label || 'Console'}
            </h1>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => onQuickAction('add-subject')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('admin.quickAction.subject')}</span>
              <span className="sm:hidden">+ Subject</span>
            </button>

            <button
              onClick={() => onQuickAction('add-lesson')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors whitespace-nowrap"
            >
              <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">{t('admin.quickAction.lesson')}</span>
              <span className="sm:hidden">+ Lesson</span>
            </button>

            <button
              onClick={() => onQuickAction('manage-branding')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t('admin.quickAction.branding')}</span>
              <span className="sm:hidden">Branding</span>
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
