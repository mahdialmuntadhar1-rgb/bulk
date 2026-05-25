/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, FileSpreadsheet, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function HowToUseDocs() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all duration-200 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          <span>Integration & Formatting Guide (Nabda OTP API)</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-600 dark:text-slate-400 space-y-4">
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> CSV Template Structure
            </h4>
            <p className="mb-2">Your contacts upload should have columns resembling this structure. Notice that custom messages are optional:</p>
            <div className="bg-slate-50 dark:bg-slate-950 font-mono text-xs p-3 rounded-lg border border-slate-150 dark:border-slate-850 overflow-x-auto text-slate-700 dark:text-slate-300">
              phone,message<br />
              201012345678,Hello Ahmed! Your order ID 4519 is ready.<br />
              201198765432,<br />
              201234567890,Urgent notice regarding security codes.
            </div>
            <p className="mt-2 text-xs text-slate-400">
              * The CSV parser automatically detects variations like <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">phone</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">number</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">msg</code>, etc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Valid Forms
              </h4>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs">
                <li>International country code prefix required (such as Egypt: <code className="font-mono">20</code>).</li>
                <li>Length between 10 to 15 digits only (<code className="font-mono">201012345678</code>).</li>
                <li>All symbols, spaces, and brackets (+, -, etc.) will be automatically sanitized.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Formatting Warnings
              </h4>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs">
                <li>Avoid starting placeholders with localized <code className="font-mono">00</code> or national prefixes unless the backend supports it.</li>
                <li>Empty message columns will fall back directly to the Default Message composed rightward.</li>
                <li>Make sure to use active WhatsApp Instance IDs matching your Nabda subscription.</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Expected Live API Endpoints</h4>
            <p className="text-xs text-slate-500 mb-2">When running in <strong>Live API Connection Mode</strong>, the frontend uses standard JSON POSTs:</p>
            <div className="bg-slate-50 dark:bg-slate-950 font-mono text-xs p-3 rounded-lg border border-slate-150 dark:border-slate-850 space-y-2 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-emerald-500 font-bold">POST</span> /campaigns/start<br />
                <span className="text-slate-400">Payload:</span> <code className="text-rose-500">{"{ instanceId, batchSize, dryRun, contacts: [{ phone, message }] }"}</code>
              </div>
              <div>
                <span className="text-sky-500 font-bold">GET</span> /campaigns/:id/status<br />
                <span className="text-slate-400">Response:</span> <code className="text-rose-500">{"{ id, status, sentCount, succeededCount, failedCount, logs: [...] }"}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
