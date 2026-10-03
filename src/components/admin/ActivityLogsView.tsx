import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { ActivityLog } from '../../types/index.ts';
import { Activity, Shield, Clock, Monitor, Globe } from 'lucide-react';

export const ActivityLogsView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActivityLogs()
      .then(res => {
        if (res.success) setLogs(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span>System & Admin Activity Audit Logs</span>
        </h2>
        <p className="text-xs text-slate-400">
          Immutable audit trail capturing all administrative mutations, logins, and configurations.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
            <tr>
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Details & Target</th>
              <th className="py-3 px-4 font-semibold">Admin User</th>
              <th className="py-3 px-4 font-semibold">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-850/50">
                <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-indigo-300">{log.action}</span>
                </td>
                <td className="py-3 px-4 text-slate-300 max-w-md">
                  {log.description}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  <span className="font-medium text-white">{log.adminName}</span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
