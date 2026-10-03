import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { DashboardStats } from '../../types/index.ts';
import {
  BookOpen,
  FileCode,
  Layers,
  FileText,
  PlayCircle,
  Users,
  Eye,
  TrendingUp,
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then(res => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-r-transparent" />
        <p className="mt-3">Compiling platform telemetry and database metrics...</p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { title: 'Total Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'text-sky-400', tab: 'subjects' },
    { title: 'Total Lessons', value: stats.totalLessons, icon: FileCode, color: 'text-indigo-400', tab: 'lessons' },
    { title: 'Total Categories', value: stats.totalCategories, icon: Layers, color: 'text-purple-400', tab: 'categories' },
    { title: 'PDF Materials', value: stats.totalPdfs, icon: FileText, color: 'text-amber-400', tab: 'materials' },
    { title: 'Video Lessons', value: stats.totalVideos, icon: PlayCircle, color: 'text-rose-400', tab: 'lessons' },
    { title: 'Active Students', value: stats.totalUsers, icon: Users, color: 'text-emerald-400', tab: 'users' },
    { title: 'Total Page Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-cyan-400' }
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => card.tab && onNavigateTab(card.tab)}
              className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 transition-all ${
                card.tab ? 'hover:border-indigo-500/50 hover:bg-slate-900 cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">{card.title}</span>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Category Distribution & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Chart */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <span>Subjects by Category</span>
            </h3>
            <span className="text-xs text-slate-500">Curriculum Distribution</span>
          </div>

          <div className="space-y-3">
            {stats.categoryStats.map((item, i) => {
              const maxCount = Math.max(...stats.categoryStats.map(c => c.count), 1);
              const pct = Math.round((item.count / maxCount) * 100);

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{item.name}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {item.count} {item.count === 1 ? 'subject' : 'subjects'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Admin Activity Log */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Audit Activity Logs</span>
            </h3>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {stats.recentActivity.map(log => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-800/80 bg-slate-950 p-3 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300">{log.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{log.description}</p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                  <span>{log.adminName}</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
