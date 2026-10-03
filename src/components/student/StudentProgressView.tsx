import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Subject, Lesson, Bookmark, LearningProgress } from '../../types/index.ts';
import { BookOpen, CheckCircle, Bookmark as BookmarkIcon, Clock, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react';

interface StudentProgressViewProps {
  onBack: () => void;
  onSelectSubject: (subjectSlug: string) => void;
  onSelectLesson: (lessonId: string) => void;
}

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  onBack,
  onSelectSubject,
  onSelectLesson
}) => {
  const { user } = useAuth();
  const [progressList, setProgressList] = useState<LearningProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    Promise.all([
      api.getProgress(),
      api.getBookmarks(),
      api.getSubjects()
    ]).then(([progRes, bookRes, subRes]) => {
      if (progRes.success) setProgressList(progRes.data || []);
      if (bookRes.success) setBookmarks(bookRes.data || []);
      if (subRes.success) setSubjects(subRes.data || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);
    try {
      await api.changePassword({ currentPassword, newPassword, confirmPassword });
      setPassMessage({ text: 'Password successfully updated!', error: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMessage({ text: err.message || 'Failed to update password', error: true });
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-r-transparent" />
        <p className="mt-3 text-xs text-slate-400">Loading student learning records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold text-xl shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
              <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-semibold">
                <span>Student Learner</span>
                <span>·</span>
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-2xl font-extrabold text-white tabular-nums">{progressList.length}</p>
              <p className="text-[11px] text-slate-400">Active Courses</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-indigo-400 tabular-nums">{bookmarks.length}</p>
              <p className="text-[11px] text-slate-400">Bookmarks</p>
            </div>
          </div>
        </div>

        {/* Learning Progress List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <span>Course Progress</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map(subject => {
              const progress = progressList.find(p => p.subjectId === subject.id || p.subjectId === subject.slug);
              const percent = progress ? progress.progressPercent : 0;
              const completedCount = progress ? progress.completedLessonIds.length : 0;

              return (
                <div
                  key={subject.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-indigo-400">{subject.categoryName}</span>
                      <span className="tabular-nums font-semibold text-white">{percent}%</span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {subject.name}
                    </h3>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-400 tabular-nums">
                      {completedCount} of {subject.lessonsCount} lessons completed
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <button
                      onClick={() => onSelectSubject(subject.slug)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>Continue Course</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change Password Form */}
        <div className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-400" />
            <span>Update Account Password</span>
          </h2>

          {passMessage && (
            <div className={`p-3 rounded-xl text-xs ${passMessage.error ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300' : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'}`}>
              {passMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
