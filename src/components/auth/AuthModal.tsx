import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useSettings } from '../../context/SettingsContext.tsx';
import { X, Lock, Mail, User, Shield, CheckCircle, ArrowRight, Sparkles, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const { language, t } = useLanguage();
  const { settings } = useSettings();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states with default Admin pre-fill for effortless login
  const [emailOrUsername, setEmailOrUsername] = useState('admin@mechmen.it');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isKh = language === 'kh';
  const brandName = isKh
    ? (settings?.siteNameKh || settings?.siteName || 'MECH MEN')
    : (settings?.siteName || 'MECH MEN');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (tab === 'login') {
        const user = await login(emailOrUsername, password);
        onSuccess(user.role);
        onClose();
      } else {
        const user = await register(name, emailOrUsername, password, username);
        onSuccess(user.role);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || (isKh ? 'ការចូលគណនីមិនជោគជ័យ សូមពិនិត្យគណនី ឬពាក្យសម្ងាត់' : 'Operation failed. Please check credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Instant 1-click admin login
  const handleQuickAdminLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const user = await login('admin@mechmen.it', 'admin123');
      onSuccess(user.role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Admin login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmailOrUsername('admin@mechmen.it');
    setPassword('admin123');
    setTab('login');
    setError(null);
  };

  const fillDemoStudent = () => {
    setEmailOrUsername('student@it-learning.com');
    setPassword('student123');
    setTab('login');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-black text-sm shadow-md">
              MM
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {tab === 'login' 
                  ? (isKh ? `ចូលគណនី ${brandName}` : `Sign In to ${brandName}`) 
                  : (isKh ? 'បង្កើតគណនីសិស្ស' : 'Create Student Account')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isKh ? 'ប្រព័ន្ធគ្រប់គ្រង និងរៀនព័ត៌មានវិទ្យា BBU' : 'Build Bright University IT Portal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick 1-Click Admin Access Banner */}
        <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {isKh ? 'ចូលជា Admin ភ្លាមៗ (1-Click)' : 'Fast 1-Click Admin Login'}
              </p>
              <p className="text-[10px] text-slate-300 font-mono">
                admin@mechmen.it / admin123
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleQuickAdminLogin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-500 active:scale-95 transition-all shrink-0"
          >
            <span>{submitting ? '...' : (isKh ? 'ចូល Admin' : 'Enter Admin')}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKh ? 'ចូលគណនី (Sign In)' : 'Sign In'}
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKh ? 'ចុះឈ្មោះសិស្ស (Register)' : 'Register Student'}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {tab === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Full Name (ឈ្មោះពេញ)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MECH MEN"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Username (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="mechmen"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email or Username input (type="text" to allow "admin" without HTML5 email validation error) */}
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">
              {isKh ? 'អ៊ីមែល ឬ ឈ្មោះគណនី (Email or Username)' : 'Email or Username'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="admin@mechmen.it ឬ admin"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {isKh ? 'សម្រាប់ Admin អាចវាយ: admin ឬ admin@mechmen.it' : 'For Admin, you can type: admin or admin@mechmen.it'}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">
              {isKh ? 'ពាក្យសម្ងាត់ (Password)' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {isKh ? 'លេខសម្ងាត់ Admin: admin123' : 'Admin password: admin123'}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500 active:scale-98 disabled:opacity-50 transition-all"
          >
            {submitting 
              ? (isKh ? 'កំពុងដំណើរការ...' : 'Authenticating...') 
              : tab === 'login' 
              ? (isKh ? 'ចូលគណនី (Sign In)' : 'Sign In') 
              : (isKh ? 'បង្កើតគណនី (Create Account)' : 'Create Account')}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            {isKh ? 'ចុចបំពេញគណនីសាកល្បងភ្លាមៗ (Quick Fill)' : 'Quick Fill Test Accounts'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-2 text-left hover:bg-indigo-950/80 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
                <span>MECH MEN (Admin)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">admin / admin123</p>
            </button>

            <button
              type="button"
              onClick={fillDemoStudent}
              className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-left hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Student</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">student123</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
