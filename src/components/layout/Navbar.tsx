import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import {
  Search,
  Globe,
  Shield,
  LogOut,
  BookOpen,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  Sparkles,
  Settings,
  ChevronDown,
  Layers,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string, param?: string) => void;
  currentView: string;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentView,
  onOpenSearch,
  onOpenAuth
}) => {
  const { settings } = useSettings();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const { theme, setTheme, isLight, isAmber } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const isKh = language === 'kh';

  // Dynamic brand name and logo from settings (Default to MECH MEN)
  const brandName = isKh
    ? (settings?.siteNameKh || settings?.siteName || 'MECH MEN')
    : (settings?.siteName || 'MECH MEN');

  const logoWordmark = settings?.logoText || 'MECH MEN';
  const logoMonogram = logoWordmark.includes(' ')
    ? logoWordmark.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : logoWordmark.slice(0, 2).toUpperCase();

  const navLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'subjects', label: t('nav.subjects') },
    { id: 'categories', label: isKh ? 'ឆមាស/ជំនាន់' : 'Curriculum' },
    { id: 'about', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') }
  ];

  // Theme-aware styles for neat organization
  const headerClass = isLight
    ? 'border-b border-slate-200/90 bg-white/95 text-slate-800 shadow-sm'
    : isAmber
    ? 'border-b border-amber-500/20 bg-zinc-950/95 text-zinc-100 shadow-lg shadow-black/40'
    : 'border-b border-slate-800/80 bg-slate-950/90 text-white shadow-lg shadow-black/20';

  const controlPillClass = isLight
    ? 'border border-slate-200 bg-slate-100/90 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 shadow-xs'
    : isAmber
    ? 'border border-amber-500/20 bg-zinc-900/90 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 shadow-xs'
    : 'border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white shadow-xs';

  const dropdownMenuClass = isLight
    ? 'bg-white border-slate-200 text-slate-800 shadow-xl ring-1 ring-slate-900/5'
    : isAmber
    ? 'bg-zinc-900 border-amber-500/30 text-zinc-100 shadow-2xl ring-1 ring-amber-500/20'
    : 'bg-slate-900 border-slate-800 text-white shadow-2xl ring-1 ring-black/40';

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md transition-colors ${headerClass}`}>
      <div className="mx-auto flex h-16 sm:h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. LEFT: POLISHED BRAND LOGO & APP NAME (MECH MEN)                        */}
        {/* ========================================================================= */}
        <button
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl transition-transform active:scale-98"
          title={`${brandName} IT Platform`}
        >
          {/* Logo Mark Capsule */}
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl font-black text-sm sm:text-base shadow-md transition-all group-hover:scale-105 overflow-hidden shrink-0">
            {isAmber ? (
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-zinc-950 flex items-center justify-center font-extrabold tracking-tighter">
                {logoMonogram || 'MM'}
              </div>
            ) : isLight ? (
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white flex items-center justify-center font-extrabold tracking-tighter shadow-inner">
                {logoMonogram || 'MM'}
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white flex items-center justify-center font-extrabold tracking-tighter shadow-indigo-500/20 shadow-lg">
                {logoMonogram || 'MM'}
              </div>
            )}
          </div>

          {/* Brand Name & Tagline */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`text-base sm:text-lg font-black tracking-tight transition-colors line-clamp-1 ${
                isLight 
                  ? 'text-slate-900 group-hover:text-indigo-600' 
                  : isAmber 
                  ? 'text-white group-hover:text-amber-400' 
                  : 'text-white group-hover:text-cyan-400'
              }`}>
                {brandName}
              </span>
              <span className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isAmber 
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                  : isLight 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'bg-indigo-950/60 text-cyan-300 border border-cyan-800/40'
              }`}>
                IT Platform
              </span>
            </div>
            <p className={`text-[11px] font-medium leading-none mt-0.5 hidden sm:block ${
              isLight ? 'text-slate-500' : isAmber ? 'text-zinc-400' : 'text-slate-400'
            }`}>
              {settings?.siteSubtitleKh || 'សាកលវិទ្យាល័យបៀលប្រាយ (BBU)'}
            </p>
          </div>
        </button>

        {/* ========================================================================= */}
        {/* 2. CENTER: ORDERLY & SPACED NAVIGATION LINKS                             */}
        {/* ========================================================================= */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-bold">
          {navLinks.map(link => {
            const isActive = currentView === link.id;
            let linkStyle = isLight 
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
              : isAmber 
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' 
              : 'text-slate-300 hover:text-white hover:bg-slate-900';

            if (isActive) {
              linkStyle = isAmber
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                : isLight
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'bg-indigo-600/20 text-cyan-300 border border-cyan-500/30 shadow-xs';
            }

            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3.5 py-2 rounded-xl transition-all ${linkStyle} ${isKh ? 'font-khmer' : ''}`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* ========================================================================= */}
        {/* 3. RIGHT: GROUPED, NEAT CONTROLS (Search, Lang/Theme Pill, User/Admin)    */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className={`flex items-center gap-2 rounded-xl px-2.5 sm:px-3 py-2 text-xs font-medium transition-all ${controlPillClass}`}
            title="Search curriculum & lessons (Ctrl+K)"
          >
            <Search className={`h-3.5 w-3.5 ${isAmber ? 'text-amber-400' : 'text-indigo-400'}`} />
            <span className={`hidden sm:inline ${isKh ? 'font-khmer' : ''}`}>
              {isKh ? 'ស្វែងរក' : 'Search'}
            </span>
            <kbd className={`hidden xl:inline rounded px-1.5 py-0.2 text-[10px] font-mono border ${
              isLight ? 'bg-white text-slate-500 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              ⌘K
            </kbd>
          </button>

          {/* Unified Controls Capsule: Language + 3-Theme Switcher */}
          <div className={`hidden sm:flex items-center rounded-xl p-0.5 border ${
            isLight ? 'border-slate-200 bg-slate-100/90' : isAmber ? 'border-amber-500/20 bg-zinc-900/90' : 'border-slate-800 bg-slate-900/90'
          }`}>
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'kh' : 'en')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isLight ? 'text-slate-700 hover:bg-white hover:shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={language === 'en' ? 'Switch to Khmer (ភាសាខ្មែរ)' : 'Switch to English'}
            >
              <Globe className={`h-3.5 w-3.5 ${isAmber ? 'text-amber-400' : 'text-indigo-500'}`} />
              <span className="font-mono uppercase">{language === 'en' ? 'EN' : 'ខ្មែរ'}</span>
            </button>

            <span className={`h-3.5 w-px ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />

            {/* 3-Theme Trigger */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isLight ? 'text-slate-700 hover:bg-white hover:shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Change Color Theme (Dark / Light / Amber)"
              >
                {theme === 'light' ? (
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                ) : theme === 'amber' ? (
                  <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-indigo-400" />
                )}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {/* Theme Dropdown Menu */}
              {themeDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-2xl border p-1.5 z-50 animate-in fade-in ${dropdownMenuClass}`}
                  onClick={() => setThemeDropdownOpen(false)}
                >
                  <div className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b mb-1 ${
                    isLight ? 'text-slate-400 border-slate-100' : 'text-slate-400 border-slate-800'
                  }`}>
                    {isKh ? 'ជ្រើសរើសពណ៍ Theme' : 'Select Theme'}
                  </div>

                  {/* Dark Mode */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white'
                        : isLight
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{t('theme.dark')}</span>
                    </div>
                    {theme === 'dark' && <span className="text-[10px]">✓</span>}
                  </button>

                  {/* Light Mode */}
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${
                      theme === 'light'
                        ? 'bg-indigo-600 text-white'
                        : isLight
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                      <span>{t('theme.light')}</span>
                    </div>
                    {theme === 'light' && <span className="text-[10px]">✓</span>}
                  </button>

                  {/* Amber / Yellow Mode */}
                  <button
                    onClick={() => setTheme('amber')}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors ${
                      theme === 'amber'
                        ? 'bg-amber-500 text-zinc-950'
                        : isLight
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span>{t('theme.amber')}</span>
                    </div>
                    {theme === 'amber' && <span className="text-[10px]">✓</span>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Account / Admin Capsule */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs font-bold transition-all ${controlPillClass}`}
              >
                <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black uppercase text-white shadow-xs shrink-0 ${
                  user.role === 'admin'
                    ? isAmber ? 'bg-amber-500 text-zinc-950' : 'bg-indigo-600'
                    : 'bg-emerald-600'
                }`}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                
                <span className="hidden md:inline max-w-[110px] truncate text-left">
                  {user.name}
                </span>

                {user.role === 'admin' && (
                  <span className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                    isAmber ? 'bg-amber-400 text-zinc-950' : 'bg-indigo-600 text-white'
                  }`}>
                    Admin
                  </span>
                )}
                <ChevronDown className="h-3 w-3 opacity-60 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-60 rounded-2xl border p-2 z-50 animate-in fade-in ${dropdownMenuClass}`}
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className={`px-3 py-2.5 border-b mb-1.5 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                    <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  {user.role === 'admin' && (
                    <>
                      <button
                        onClick={() => onNavigate('admin')}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                          isAmber ? 'text-amber-400 hover:bg-amber-950/40' : 'text-indigo-600 hover:bg-indigo-50'
                        } ${isKh ? 'font-khmer' : ''}`}
                      >
                        <Shield className="h-4 w-4 shrink-0" />
                        <span>{isKh ? 'ផ្ទាំងគ្រប់គ្រង Admin' : 'Admin Console'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setTimeout(() => {
                            const btn = document.querySelector('[data-admin-tab="settings"]');
                            if (btn) (btn as HTMLElement).click();
                          }, 100);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                          isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                        } ${isKh ? 'font-khmer' : ''}`}
                      >
                        <Settings className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>{isKh ? 'កែប្រែ Logo & ឈ្មោះ App' : 'Edit Logo & App Name'}</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => onNavigate('student-progress')}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                      isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                    } ${isKh ? 'font-khmer' : ''}`}
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{t('nav.myLearning')}</span>
                  </button>

                  <div className={`my-1 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`} />

                  <button
                    onClick={() => {
                      logout();
                      onNavigate('home');
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors ${
                      isKh ? 'font-khmer' : ''
                    }`}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>{t('nav.signOut')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 whitespace-nowrap ${
                isAmber
                  ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isKh ? 'ចូលគណនី' : 'Sign In'}
            </button>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border transition-colors ${controlPillClass}`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE NAVIGATION DRAWER                                              */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 ${
          isLight ? 'bg-white border-slate-200' : isAmber ? 'bg-zinc-950 border-amber-500/20' : 'bg-slate-950 border-slate-800'
        }`}>
          {/* Brand & Creator Capsule in Mobile */}
          <div className="flex items-center justify-between pb-3 border-b border-inherit">
            <div className="flex items-center gap-2.5">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                isAmber ? 'bg-amber-500 text-zinc-950' : 'bg-indigo-600'
              }`}>
                {logoMonogram || 'MM'}
              </div>
              <div>
                <p className="font-bold text-xs leading-none">{brandName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">BBU IT Platform</p>
              </div>
            </div>

            {/* Quick Language switch in mobile header */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'kh' : 'en')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${controlPillClass}`}
            >
              {language === 'en' ? '🇰🇭 ខ្មែរ' : '🇺🇸 EN'}
            </button>
          </div>

          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map(link => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? isAmber
                        ? 'bg-amber-500/20 text-amber-300 font-extrabold'
                        : 'bg-indigo-600/20 text-indigo-400 font-extrabold'
                      : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                </button>
              );
            })}
          </div>

          {/* 3-Theme Selector in Mobile */}
          <div className="pt-2 border-t border-inherit">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {isKh ? 'ជម្រើសពណ៍ (Color Themes)' : 'Color Themes'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>ងងឹត</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  theme === 'light'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>សស្រាល</span>
              </button>

              <button
                onClick={() => setTheme('amber')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  theme === 'amber'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 text-amber-300 border-zinc-800'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>លឿង</span>
              </button>
            </div>
          </div>

          {/* User Auth Action in Mobile Drawer */}
          <div className="pt-2 border-t border-inherit">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-white">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-600 text-white font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                  >
                    <Shield className="h-4 w-4" />
                    <span>{isKh ? 'ចូលទៅ Admin Console' : 'Open Admin Console'}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-400 bg-rose-950/30 border border-rose-900/40 text-xs font-bold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('nav.signOut')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                <Shield className="h-4 w-4" />
                <span>{isKh ? 'ចូលគណនី / ចូលជា Admin' : 'Sign In / Admin Login'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
