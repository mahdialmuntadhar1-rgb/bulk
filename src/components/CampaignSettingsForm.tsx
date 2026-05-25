/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Settings, ShieldCheck, HelpCircle, Server, Key, Eye, EyeOff } from 'lucide-react';
import { CampaignSettings } from '../types';

interface CampaignSettingsFormProps {
  settings: CampaignSettings;
  onSettingsChange: (settings: CampaignSettings) => void;
}

export default function CampaignSettingsForm({ settings, onSettingsChange }: CampaignSettingsFormProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('nabda_api_key') || '';
  });

  const updateSetting = <K extends keyof CampaignSettings>(key: K, value: CampaignSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem('nabda_api_key', val);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-500" />
        <span>3. Campaign & Server Settings</span>
      </h3>

      {/* Instance ID & Dry Run */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 flex items-center gap-1">
            <span>Instance ID</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={settings.instanceId}
            onChange={(e) => updateSetting('instanceId', e.target.value)}
            placeholder="e.g. INST-4A92B"
            className="w-full text-xs font-mono border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="text-[10px] text-slate-400">Unique WhatsApp sender terminal identifier</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 flex items-center gap-1">
            <span>Dry Run Mode</span>
          </label>
          <div className="border border-slate-200 dark:border-slate-850 p-2 rounded-lg flex items-center justify-between h-[38px] bg-slate-50/50 dark:bg-slate-950/20">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Validate without sending</span>
            </span>
            <input
              type="checkbox"
              checked={settings.dryRun}
              onChange={(e) => updateSetting('dryRun', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Batch size & Rate limit UI view */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">
            Batch Size
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={settings.batchSize}
            onChange={(e) => updateSetting('batchSize', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full text-xs font-mono border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <p className="text-[10px] text-slate-400">Requests handled concurrently</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">
            Backend Rate Limit Info
          </label>
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg h-[38px] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono">50 msg / min</span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-semibold border border-indigo-100 dark:border-indigo-900/30">
              Nabda Max
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Throttled by Nabda servers</p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-850 space-y-3">
        {/* Backend toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-slate-400" />
            <span>Connection Strategy</span>
          </span>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950 text-xs">
            <button
              onClick={() => updateSetting('apiMode', 'simulated')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                settings.apiMode === 'simulated'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-150 dark:border-slate-700'
                  : 'text-slate-500'
              }`}
            >
              Simulated Server
            </button>
            <button
              onClick={() => updateSetting('apiMode', 'live')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                settings.apiMode === 'live'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-150 dark:border-slate-700'
                  : 'text-slate-500'
              }`}
            >
              Live API Mode
            </button>
          </div>
        </div>

        {settings.apiMode === 'live' ? (
          <div className="space-y-3 p-3 bg-indigo-50/20 dark:bg-slate-950/40 rounded-lg border border-indigo-100/30 dark:border-slate-850 animate-fadeIn text-xs space-y-2.5">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-650 dark:text-slate-350 flex items-center justify-between">
                <span>Backend API Base URL</span>
                <span className="text-[10px] text-slate-400">Expected root for HTTP endpoints</span>
              </label>
              <input
                type="text"
                value={settings.apiBaseUrl}
                onChange={(e) => updateSetting('apiBaseUrl', e.target.value)}
                placeholder="e.g. http://localhost:8000/api"
                className="w-full font-mono border border-slate-200 dark:border-slate-850 p-2 rounded bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-650 dark:text-slate-350 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Custom Backend API Key</span>
                  <span className="text-slate-400 font-normal">(stored inside localStorage)</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Optional header authorization secret key"
                  className="w-full font-mono border border-slate-200 dark:border-slate-850 p-2 pr-9 rounded bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 px-1 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/35 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/10 rounded-lg text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <span className="text-emerald-500 text-base leading-none">✔</span>
            <span>
              <strong>Simulation Mode Active</strong>: Runs locally in the browser with authentic progress polling, error simulations, and dry run results. No actual API requests will be fired.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
