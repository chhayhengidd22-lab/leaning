import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { User, Lock, Mail, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

export const AdminProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    try {
      await updateProfile({ name, username, avatar });
      setProfileSuccess('Admin credentials and identity updated successfully!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Profile update failed');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    try {
      await api.changePassword({ currentPassword, newPassword, confirmPassword });
      setPassSuccess('Admin password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 4000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-400" />
          <span>Administrator Profile & Security</span>
        </h2>
        <p className="text-xs text-slate-400">
          Manage administrator account information and update password credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Admin Profile Info
          </h3>

          {profileSuccess && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300">
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2 text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Profile Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-white font-semibold hover:bg-indigo-500 transition-colors"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Change Master Password
          </h3>

          {passError && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300">
              {passError}
            </div>
          )}

          {passSuccess && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300">
              {passSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">New Password (Min 6 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-white font-semibold hover:bg-indigo-500 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
