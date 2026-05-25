/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Download, Search, CheckCircle, XCircle, FileText, DownloadCloud } from 'lucide-react';
import { CampaignLog } from '../types';

interface CampaignLogsTableProps {
  logs: CampaignLog[];
}

export default function CampaignLogsTable({ logs }: CampaignLogsTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'failed'>('all');

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.phone.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'succeeded' && log.status === 'succeeded') ||
      (filter === 'failed' && log.status === 'failed');
    return matchesSearch && matchesFilter;
  });

  // Download logs as CSV
  const handleDownloadCSV = () => {
    if (logs.length === 0) return;
    
    const headers = 'Phone,Status,ErrorMessage,Timestamp\n';
    const rows = logs
      .map((log) => {
        const phone = log.phone;
        const status = log.status;
        const errMsg = log.errorMessage ? `"${log.errorMessage.replace(/"/g, '""')}"` : '';
        const timestamp = log.timestamp;
        return `${phone},${status},${errMsg},${timestamp}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `campaign_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download logs as JSON
  const handleDownloadJSON = () => {
    if (logs.length === 0) return;

    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `campaign_logs_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <span>Campaign Activity Logs</span>
          </h3>
          <p className="text-xs text-slate-400">Detailed report & delivery status logs</p>
        </div>

        {logs.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-250/20 dark:border-slate-850 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-lg text-xs font-semibold border border-indigo-100/35 dark:border-indigo-900/35 transition-colors"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-slate-400 border border-dashed border-slate-250 dark:border-slate-800 rounded-lg">
          <p className="text-sm">No activity logs recorded yet</p>
          <p className="text-xs mt-0.5 text-slate-400">Start a campaign above to capture real-time updates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Filters & search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phone number..."
                className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-950 text-slate-805 dark:text-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex rounded-lg border border-slate-250 dark:border-slate-855 bg-slate-50 dark:bg-slate-950 p-0.5 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium ${
                  filter === 'all'
                    ? 'bg-white dark:bg-slate-805 text-indigo-650 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                All ({logs.length})
              </button>
              <button
                onClick={() => setFilter('succeeded')}
                className={`px-3 py-1.5 rounded-md font-medium ${
                  filter === 'succeeded'
                    ? 'bg-white dark:bg-slate-805 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Succeeded ({logs.filter((l) => l.status === 'succeeded').length})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-3 py-1.5 rounded-md font-medium ${
                  filter === 'failed'
                    ? 'bg-white dark:bg-slate-850 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Failed ({logs.filter((l) => l.status === 'failed').length})
              </button>
            </div>
          </div>

          {/* Logs table list */}
          <div className="border border-slate-150 dark:border-slate-850 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-850">
                  <tr>
                    <th className="p-2.5">Phone Number</th>
                    <th className="p-2.5 w-24 text-center">Status</th>
                    <th className="p-2.5">Error Log / Info</th>
                    <th className="p-2.5 w-28 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-450 italic">
                        No logs match chosen filters
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/5">
                        <td className="p-2.5 font-mono font-medium text-slate-800 dark:text-slate-300">
                          {log.phone}
                        </td>
                        <td className="p-2.5 text-center">
                          {log.status === 'succeeded' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-55/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-950/40">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span>Sent</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50/20 text-rose-600 dark:text-rose-400 font-semibold px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-950/40 animate-pulse">
                              <XCircle className="w-3 h-3 text-rose-500" />
                              <span>Failed</span>
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-500 font-normal">
                          {log.status === 'succeeded' ? (
                            <span className="text-slate-400 italic">No delivery warnings. Ready</span>
                          ) : (
                            <span className="text-rose-500 font-medium">{log.errorMessage || 'Unknown error code from Nabda API'}</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right text-slate-400 font-mono">
                          {log.timestamp}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
