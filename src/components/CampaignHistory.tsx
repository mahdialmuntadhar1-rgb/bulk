/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { History, Trash2, Calendar, CheckSquare, RefreshCw } from 'lucide-react';
import { Campaign } from '../types';

interface CampaignHistoryProps {
  history: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onClearHistory: () => void;
  activeCampaignId?: string;
}

export default function CampaignHistory({
  history,
  onSelectCampaign,
  onClearHistory,
  activeCampaignId,
}: CampaignHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" />
          <span>Local Campaign History Cache</span>
        </h3>
        <button
          onClick={onClearHistory}
          className="p-1 px-2.5 rounded-lg border border-rose-100 hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors text-xs font-semibold flex items-center gap-1 dark:border-rose-950/20 dark:hover:bg-rose-955"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear Cache</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {history.map((campaign) => {
          const statsPercent = campaign.totalCount > 0 
            ? Math.round((campaign.succeededCount / campaign.totalCount) * 100) 
            : 0;
            
          const isSelected = activeCampaignId === campaign.id;

          return (
            <button
              key={campaign.id}
              onClick={() => onSelectCampaign(campaign)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-indigo-50/45 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-850 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(campaign.createdAt).toLocaleString()}</span>
                </span>
                <span className="block font-semibold text-xs text-slate-850 dark:text-slate-200 font-mono">
                  {campaign.name}
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    campaign.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400'
                      : campaign.status === 'canceled'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-955 dark:text-rose-450'
                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-955 dark:text-indigo-400'
                  }`}>
                    {campaign.status}
                  </span>
                  <span className="text-[10px] text-slate-450">
                    Contacts processed: <strong>{campaign.sentCount}</strong> / {campaign.totalCount}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center">
                <span className="text-xs font-bold text-slate-705 dark:text-slate-300">
                  {statsPercent}% Succeeded
                </span>
                <span className="text-[9px] text-slate-400">
                  {campaign.succeededCount} OK • {campaign.failedCount} Err
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
