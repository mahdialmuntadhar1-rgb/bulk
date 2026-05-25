/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Play, Pause, Square, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { CampaignStatus } from '../types';

interface ActiveCampaignPanelProps {
  status: CampaignStatus;
  sentCount: number;
  succeededCount: number;
  failedCount: number;
  totalCount: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  estimatedTimeLeftSecs: number;
}

export default function ActiveCampaignPanel({
  status,
  sentCount,
  succeededCount,
  failedCount,
  totalCount,
  onPause,
  onResume,
  onStop,
  onReset,
  estimatedTimeLeftSecs,
}: ActiveCampaignPanelProps) {
  const percentage = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  // Format dynamic estimate
  const formatTime = (secs: number) => {
    if (secs <= 0) return 'Immediate';
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${mins}m ${rSecs}s`;
  };

  const statusColors: Record<CampaignStatus, string> = {
    idle: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    running: 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-indigo-400 border animate-pulse',
    paused: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-955 dark:border-amber-900/30 dark:text-amber-400 border',
    completed: 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-955 dark:border-emerald-900/30 dark:text-emerald-400 border',
    canceled: 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-955 dark:border-rose-900/30 dark:text-rose-400 border',
  };

  const statusLabels: Record<CampaignStatus, string> = {
    idle: 'Idle',
    running: 'Sending Campaign...',
    paused: 'Paused',
    completed: 'Campaign Completed',
    canceled: 'Aborted',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Indicator Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Live campaign</span>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Execution Monitor</h4>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">Bulk Stream Rate</span>
          <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3.5 overflow-hidden border border-slate-150 dark:border-slate-850">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              status === 'paused'
                ? 'bg-amber-400'
                : status === 'completed'
                ? 'bg-emerald-500'
                : status === 'canceled'
                ? 'bg-rose-400'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Numerical Indicators Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/10 border border-slate-100 dark:border-slate-850 rounded-lg">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Sent</span>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">
            {sentCount} <span className="text-xs text-slate-400 font-normal">/ {totalCount}</span>
          </span>
        </div>

        <div className="p-3 bg-emerald-50/25 dark:bg-emerald-950/10 border border-emerald-100/10 dark:border-slate-850 rounded-lg animate-fadeIn">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Succeeded</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {succeededCount}
          </span>
        </div>

        <div className="p-3 bg-rose-50/20 dark:bg-rose-955/10 border border-slate-100 dark:border-slate-850 rounded-lg">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Failed</span>
          <span className={`text-lg font-bold font-mono ${failedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
            {failedCount}
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-850">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Est. Time Left</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono h-7 flex items-center justify-center">
            {status === 'running' ? formatTime(estimatedTimeLeftSecs) : '--'}
          </span>
        </div>
      </div>

      {/* Button controls based on CampaignState */}
      <div className="flex flex-wrap gap-2 pt-1.5 justify-end">
        {status === 'running' && (
          <>
            <button
              onClick={onPause}
              className="px-4 py-2 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Campaign</span>
            </button>
            <button
              onClick={onStop}
              className="px-4 py-2 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Cancel Campaign</span>
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              onClick={onResume}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
            <button
              onClick={onStop}
              className="px-4 py-2 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop / Terminate</span>
            </button>
          </>
        )}

        {(status === 'completed' || status === 'canceled') && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Prepare New Campaign</span>
          </button>
        )}
      </div>

      {/* Status alerts */}
      {status === 'running' && (
        <div className="flex items-center gap-2 p-2.5 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg text-xs text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Polling remote system status continuously. Keep this browser window online for logs.</span>
        </div>
      )}
      {status === 'completed' && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50/40 dark:bg-emerald-950/15 rounded-lg text-xs text-emerald-750 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/30 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Completed! Check below to download structured campaign logs.</span>
        </div>
      )}
      {status === 'canceled' && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50/20 dark:bg-rose-955/15 rounded-lg text-xs text-rose-700 dark:text-rose-400 border border-rose-100/35 dark:border-rose-900/30 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>Campaign stopped. Partial logs are cached correctly.</span>
        </div>
      )}
    </div>
  );
}
