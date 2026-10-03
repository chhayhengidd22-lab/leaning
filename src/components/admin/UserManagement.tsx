import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { User } from '../../types/index.ts';
import { Users, UserCheck, UserX, Shield, Search } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = () => {
    setLoading(true);
    api.getUsers()
      .then(res => {
        if (res.success) setUsers(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      await api.toggleUserStatus(user.id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Student & User Management</h2>
          <p className="text-xs text-slate-400">View registered learners, manage credentials, and toggle status.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search learners..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
            <tr>
              <th className="py-3 px-4 font-semibold">Learner Name</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Joined Date</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-850/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-white">{u.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-slate-400">
                  {u.email}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 font-mono uppercase text-[10px] font-semibold ${
                    u.role === 'admin' ? 'text-indigo-400' : 'text-slate-300'
                  }`}>
                    {u.role === 'admin' && <Shield className="h-3 w-3" />}
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 font-medium ${
                    u.isActive ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        u.isActive
                          ? 'border border-slate-800 bg-slate-900 text-rose-300 hover:bg-rose-950/40'
                          : 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                      }`}
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
