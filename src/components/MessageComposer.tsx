/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MessageSquare, RefreshCw, Sparkles, Smile } from 'lucide-react';

interface MessageComposerProps {
  defaultMessage: string;
  useContactOverride: boolean;
  onDefaultMessageChange: (val: string) => void;
  onUseContactOverrideChange: (val: boolean) => void;
}

const QUICK_EMOJIS = ['😊', '📢', '🔥', '⚠️', '🎉', '👉', '✅', '❤️', '📅', '🚀', '⭐', '💬'];

export default function MessageComposer({
  defaultMessage,
  useContactOverride,
  onDefaultMessageChange,
  onUseContactOverrideChange,
}: MessageComposerProps) {
  const [charLimit] = useState(1600);

  const handleEmojiClick = (emoji: string) => {
    onDefaultMessageChange(defaultMessage + emoji);
  };

  const remainingChars = charLimit - defaultMessage.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <span>2. Compose Message Group</span>
        </span>
      </h3>

      {/* Override Toggle Choice */}
      <div className="flex items-start gap-3 p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-lg border border-indigo-100/35 dark:border-indigo-950/40">
        <input
          id="overrideToggle"
          type="checkbox"
          checked={useContactOverride}
          onChange={(e) => onUseContactOverrideChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="overrideToggle" className="text-xs cursor-pointer select-none space-y-0.5">
          <span className="block font-semibold text-slate-800 dark:text-slate-200">
            Override with Column Custom Messages
          </span>
          <span className="block text-slate-400">
            If a contact entry has a custom message in the CSV, use that instead of the default fallback message.
          </span>
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-500 dark:text-slate-400">
            Default Fallback Message
          </label>
          <span
            className={`font-semibold ${
              isOverLimit ? 'text-rose-500' : remainingChars < 100 ? 'text-amber-500' : 'text-slate-400'
            }`}
          >
            {defaultMessage.length} / {charLimit} Chars
          </span>
        </div>

        <textarea
          value={defaultMessage}
          onChange={(e) => onDefaultMessageChange(e.target.value)}
          placeholder="Type fallback message payload here... Enclose options or use emojis for rich engagement. Standard line breaks and whatsapp styling (*bold*, _italics_) are fully supported!"
          rows={5}
          maxLength={2000}
          className={`w-full text-sm border p-3 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            isOverLimit ? 'border-rose-450 focus:border-rose-500' : 'border-slate-200 dark:border-slate-850'
          }`}
        />
      </div>

      {/* Fast emojis bar */}
      <div className="space-y-1.5">
        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Smile className="w-3.5 h-3.5" />
          <span>Quick Emojis</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="px-2 py-1 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-250 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
