/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { MessageContact } from '../types';

interface CsvUploaderProps {
  onContactsParsed: (contacts: MessageContact[]) => void;
  contacts: MessageContact[];
  onClear: () => void;
}

export default function CsvUploader({ onContactsParsed, contacts, onClear }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseErrors(['Invalid file format. Please upload a structured .csv file.']);
      return;
    }

    setFileName(file.name);
    setParseErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { contacts: parsedContacts, errors } = parseCSV(text);
      if (errors.length > 0) {
        setParseErrors(errors);
      }
      onContactsParsed(parsedContacts);
    };
    reader.onerror = () => {
      setParseErrors(['Failed to read file. Please try again.']);
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFileName(null);
    setParseErrors([]);
    onClear();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const invalidCount = contacts.filter((c) => !c.isValid).length;
  const validCount = contacts.filter((c) => c.isValid).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <span>1. Import Contacts (CSV)</span>
        </h3>
        {contacts.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-955 px-2.5 py-1.5 rounded-lg border border-rose-100 dark:border-rose-950/20"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset File</span>
          </button>
        )}
      </div>

      {contacts.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-850/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Drag and drop your CSV file here, or{' '}
            <span className="text-indigo-600 dark:text-indigo-400 hover:underline">browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Requires at least a 'phone' column</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-850">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-md">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {fileName || 'contacts.csv'}
              </p>
              <p className="text-xs text-slate-400">
                Parsed {contacts.length} rows
              </p>
            </div>
          </div>

          {/* Validation summary banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/30 rounded-lg p-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div>
                <span className="block text-xs text-slate-400">Valid Numbers</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {validCount}
                </span>
              </div>
            </div>
            <div className={`border rounded-lg p-2.5 flex items-center gap-2 ${
              invalidCount > 0 
                ? 'bg-amber-50/50 dark:bg-amber-955/20 border-amber-100 dark:border-amber-950/30' 
                : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850'
            }`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${invalidCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              <div>
                <span className="block text-xs text-slate-400">Invalid Rows</span>
                <span className={`text-sm font-semibold ${invalidCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                  {invalidCount}
                </span>
              </div>
            </div>
          </div>

          {parseErrors.length > 0 && (
            <div className="p-3 bg-rose-50 dark:bg-rose-955 border border-rose-100 dark:border-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg text-xs space-y-1">
              <p className="font-semibold">Parsing Warnings:</p>
              {parseErrors.map((err, idx) => (
                <p key={idx}>• {err}</p>
              ))}
            </div>
          )}

          {/* Table Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pt-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Contact Preview (First 5 Rows)</span>
            </h4>
            <div className="border border-slate-150 dark:border-slate-850 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 text-slate-550 dark:text-slate-400 font-semibold">
                      <th className="p-2 w-12 text-center">Row</th>
                      <th className="p-2">Phone Number</th>
                      <th className="p-2">Message Payload</th>
                      <th className="p-2 w-20 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {contacts.slice(0, 5).map((contact, idx) => (
                      <tr key={contact.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10">
                        <td className="p-2 text-center text-slate-400 font-mono font-medium">{idx + 1}</td>
                        <td className="p-2 font-mono text-slate-700 dark:text-slate-300">
                          {contact.phone || <em className="text-red-400">Missing</em>}
                        </td>
                        <td className="p-2 truncate max-w-[200px] text-slate-500">
                          {contact.message ? (
                            <span className="text-slate-700 dark:text-slate-300">{contact.message}</span>
                          ) : (
                            <span className="text-slate-400 italic">Fallback default</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {contact.isValid ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                              Valid
                            </span>
                          ) : (
                            <span
                              title={contact.validationError}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 dark:bg-rose-950/35 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 cursor-help"
                            >
                              Invalid
                            </span>
                          )}
                        </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
              {contacts.length > 5 && (
                <div className="bg-slate-50/50 dark:bg-slate-950/50 p-2 text-center text-xs text-slate-400 border-t border-slate-150 dark:border-slate-850">
                  And {contacts.length - 5} more entries...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
