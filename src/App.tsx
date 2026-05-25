/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import {
  Moon,
  Sun,
  Send,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Play,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  MessageContact,
  CampaignSettings,
  CampaignLog,
  Campaign,
  CampaignStatus,
} from './types';
import CsvUploader from './components/CsvUploader';
import MessageComposer from './components/MessageComposer';
import CampaignSettingsForm from './components/CampaignSettingsForm';
import ActiveCampaignPanel from './components/ActiveCampaignPanel';
import CampaignLogsTable from './components/CampaignLogsTable';
import CampaignHistory from './components/CampaignHistory';
import HowToUseDocs from './components/HowToUseDocs';

const STORAGE_HISTORY_KEY = 'nabda_campaign_history';

const INITIAL_SETTINGS: CampaignSettings = {
  instanceId: 'INST-4A92B',
  batchSize: 1,
  rateLimit: 50,
  dryRun: false,
  defaultMessage: 'Salam! 😊 This is a fallback bulk notification powered by Nabda OTP WhatsApp module.',
  useContactOverride: true,
  apiMode: 'simulated',
  apiBaseUrl: 'http://localhost:8000/api',
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });

  const [settings, setSettings] = useState<CampaignSettings>(INITIAL_SETTINGS);
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  
  // Active Campaign running states
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>('idle');
  const [sentCount, setSentCount] = useState(0);
  const [succeededCount, setSucceededCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [logs, setLogs] = useState<CampaignLog[]>([]);
  
  // History list
  const [history, setHistory] = useState<Campaign[]>(() => {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  // UI status metrics
  const [apiError, setApiError] = useState<string | null>(null);
  const [livePollIntervalId, setLivePollIntervalId] = useState<number | null>(null);
  const [liveBackoffCount, setLiveBackoffCount] = useState(0);

  // References for active simulation timers
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(0);

  // Apply dark mode theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Handle simulations cleanup
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (livePollIntervalId) clearInterval(livePollIntervalId);
    };
  }, [livePollIntervalId]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleContactsParsed = (parsed: MessageContact[]) => {
    setContacts(parsed);
    console.log(`[CSV Parser] Parsed ${parsed.length} contacts successfully.`);
  };

  const handleClearContacts = () => {
    setContacts([]);
    console.log('[CSV Parser] Contacts list cleared.');
  };

  // Helper to persist campaigns to browser cache history
  const saveCampaignToHistory = (completedCampaign: Campaign) => {
    setHistory((prevHistory) => {
      // Filter out duplicates with the same ID, and cap list at 3
      const filtered = prevHistory.filter((c) => c.id !== completedCampaign.id);
      const updated = [completedCampaign, ...filtered].slice(0, 3);
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Switch/Load selected previous campaign for stats review
  const handleSelectCampaign = (camp: Campaign) => {
    // Cannot load if another campaign is currently sending
    if (campaignStatus === 'running' || campaignStatus === 'paused') {
      alert('Please pause or stop the current active task before loading history stats!');
      return;
    }
    
    // Set parameters from this history row
    setCampaignStatus(camp.status);
    setSentCount(camp.sentCount);
    setSucceededCount(camp.succeededCount);
    setFailedCount(camp.failedCount);
    setLogs(camp.logs);
    setContacts(camp.contacts);
    
    const settingsLoaded: CampaignSettings = {
      ...camp.settings,
      defaultMessage: camp.settings.defaultMessage || INITIAL_SETTINGS.defaultMessage,
    };
    setSettings(settingsLoaded);

    setActiveCampaign(camp);
    
    console.log(`[History Loader] Loaded Campaign: "${camp.name}" with ID: ${camp.id}`);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local campaign history cache?')) {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
      setHistory([]);
      console.log('[History System] History cache wiped out completely.');
    }
  };

  // -------------------------------------------------------------
  // SIMULATION MODE ENGINE (OFFLINE)
  // -------------------------------------------------------------
  const startSimulatedCampaign = () => {
    const validContacts = contacts.filter((c) => c.isValid);
    if (validContacts.length === 0) {
      alert('Please upload a CSV containing at least one valid phone number first!');
      return;
    }

    setCampaignStatus('running');
    setApiError(null);

    // If starting fresh or resuming
    const isNew = sentCount === 0 || sentCount >= validContacts.length;
    let indexPointer = isNew ? 0 : currentIndexRef.current;
    
    if (isNew) {
      setSentCount(0);
      setSucceededCount(0);
      setFailedCount(0);
      setLogs([]);
      indexPointer = 0;
      currentIndexRef.current = 0;
    }

    const campaignId = `sim-camp-${Date.now().toString().slice(-6)}`;
    const freshCampaign: Campaign = {
      id: campaignId,
      name: `Simulated Campaign ${campaignId}`,
      status: 'running',
      settings,
      contacts,
      totalCount: validContacts.length,
      sentCount: isNew ? 0 : sentCount,
      succeededCount: isNew ? 0 : succeededCount,
      failedCount: isNew ? 0 : failedCount,
      logs: isNew ? [] : logs,
      createdAt: new Date().toISOString(),
    };
    setActiveCampaign(freshCampaign);

    console.log(`[Simulated Server] Starting Campaign ${campaignId} with ${validContacts.length} items.`);

    // Set simulator interval tick time (approx. 800ms per contact for premium realistic rendering)
    simIntervalRef.current = setInterval(() => {
      if (indexPointer >= validContacts.length) {
        // Finished simulation
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        setCampaignStatus('completed');
        
        const finished: Campaign = {
          ...freshCampaign,
          status: 'completed',
          sentCount: validContacts.length,
          succeededCount: currentIndexRef.current - failedCount,
          failedCount,
          logs: [...logs],
        };
        setActiveCampaign(finished);
        saveCampaignToHistory(finished);
        console.log('[Simulated Server] Campaign processes completed with success.');
        return;
      }

      // Process current row
      const contact = validContacts[indexPointer];
      const messageText = (settings.useContactOverride && contact.message) 
        ? contact.message 
        : settings.defaultMessage;

      // Simulate sending latency/outcome
      const isSuccessTick = settings.dryRun || Math.random() > 0.08; // 8% failure simulation rate limit/token issues
      const timestamp = new Date().toLocaleTimeString();

      const newLog: CampaignLog = {
        id: `log-${Date.now()}-${indexPointer}`,
        phone: contact.phone,
        status: isSuccessTick ? 'succeeded' : 'failed',
        errorMessage: isSuccessTick 
          ? undefined 
          : settings.dryRun 
            ? undefined 
            : getRandomErrorMessage(),
        timestamp,
      };

      setLogs((prev) => {
        const updatedLogs = [newLog, ...prev];
        
        // Update stats
        const nextSent = indexPointer + 1;
        const nextSucceeded = isSuccessTick ? succeededCount + 1 : succeededCount;
        const nextFailed = isSuccessTick ? failedCount : failedCount + 1;

        setSentCount(nextSent);
        if (isSuccessTick) setSucceededCount(nextSucceeded);
        else setFailedCount(nextFailed);

        const updatedCampaign: Campaign = {
          ...freshCampaign,
          status: nextSent >= validContacts.length ? 'completed' : 'running',
          sentCount: nextSent,
          succeededCount: nextSucceeded,
          failedCount: nextFailed,
          logs: updatedLogs,
        };
        
        setActiveCampaign(updatedCampaign);

        if (nextSent >= validContacts.length) {
          setCampaignStatus('completed');
          saveCampaignToHistory(updatedCampaign);
        }

        return updatedLogs;
      });

      indexPointer++;
      currentIndexRef.current = indexPointer;
    }, 850);
  };

  const pauseSimulatedCampaign = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      setCampaignStatus('paused');
      if (activeCampaign) {
        const pausedCamp: Campaign = {
          ...activeCampaign,
          status: 'paused',
        };
        setActiveCampaign(pausedCamp);
      }
      console.log('[Simulated Server] Campaign execution paused.');
    }
  };

  const stopSimulatedCampaign = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }
    setCampaignStatus('canceled');
    if (activeCampaign) {
      const canceledCamp: Campaign = {
        ...activeCampaign,
        status: 'canceled',
        sentCount,
        succeededCount,
        failedCount,
        logs,
      };
      setActiveCampaign(canceledCamp);
      saveCampaignToHistory(canceledCamp);
    }
    console.log('[Simulated Server] Campaign aborted manually.');
  };

  // Pick realistic randomly thrown third-party system delivery warning labels
  const getRandomErrorMessage = () => {
    const errors = [
      'Token validation expired, status 401',
      'Target client device is unreachable / offline',
      'Rate limit warning (Code 429) - Nabda queue busy',
      'Country code routing block on instance',
      'Failed during initial handshake on WhatsApp server',
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  };

  // -------------------------------------------------------------
  // LIVE API INTEGRATION ENGINE
  // -------------------------------------------------------------
  const startLiveCampaign = async () => {
    const validContacts = contacts.filter((c) => c.isValid);
    if (validContacts.length === 0) {
      alert('Please upload a CSV containing at least one valid phone number first!');
      return;
    }

    setCampaignStatus('running');
    setApiError(null);
    setSentCount(0);
    setSucceededCount(0);
    setFailedCount(0);
    setLogs([]);

    const payload = {
      instanceId: settings.instanceId,
      batchSize: settings.batchSize,
      dryRun: settings.dryRun,
      defaultMessage: settings.defaultMessage,
      useContactOverride: settings.useContactOverride,
      contacts: validContacts.map((c) => ({
        phone: c.phone,
        message: c.message,
      })),
    };

    console.log('[Live API Engine] Triggering POST /campaigns/start at Base:', settings.apiBaseUrl);
    console.log('[Live API Payload]', payload);

    try {
      // Setup request headers (including optional auth key)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const key = localStorage.getItem('nabda_api_key');
      if (key) {
        headers['Authorization'] = `Bearer ${key}`;
      }

      // Try actual HTTP request to configured endpoint
      const response = await fetch(`${settings.apiBaseUrl}/campaigns/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('429 Rate Limit: Backend queue is currently busy. Please wait.');
        }
        throw new Error(`API Return Exception: Code ${response.status}`);
      }

      const resData = await response.json();
      console.log('[Live API Response]', resData);

      const realCampaignId = resData.campaignId || `live-camp-${Date.now().toString().slice(-5)}`;
      startLivePolling(realCampaignId);

    } catch (err: any) {
      console.error('[Live API Connection Fail]', err);
      // Give them a fully explanatory message with fallbacks
      setApiError(
        `Failed to reach Live Backend: ${err.message || 'Network unreachable'}. ` +
        `This is expected if your separate backend server is not yet running on ${settings.apiBaseUrl}. ` +
        `Please test using "Simulated Server Mode" tab config!`
      );
      setCampaignStatus('idle');
    }
  };

  const startLivePolling = (campaignId: string) => {
    if (livePollIntervalId) clearInterval(livePollIntervalId);
    
    setLiveBackoffCount(0);

    const intId = window.setInterval(async () => {
      try {
        const headers: Record<string, string> = {};
        const key = localStorage.getItem('nabda_api_key');
        if (key) {
          headers['Authorization'] = `Bearer ${key}`;
        }

        const pollRes = await fetch(`${settings.apiBaseUrl}/campaigns/${campaignId}/status`, {
          headers,
        });

        if (!pollRes.ok) {
          throw new Error(`HTTP Error Status: ${pollRes.status}`);
        }

        const statusReport = await pollRes.json();
        console.log('[Live API Polled Status]', statusReport);

        // Map server response fields to React states
        setSentCount(statusReport.sentCount ?? 0);
        setSucceededCount(statusReport.succeededCount ?? 0);
        setFailedCount(statusReport.failedCount ?? 0);
        if (statusReport.logs) {
          setLogs(statusReport.logs);
        }

        // Handle states
        const remoteStatus: CampaignStatus = statusReport.status || 'running';
        setCampaignStatus(remoteStatus);

        if (remoteStatus === 'completed' || remoteStatus === 'canceled') {
          clearInterval(intId);
          setLivePollIntervalId(null);
          
          const completedLive: Campaign = {
            id: campaignId,
            name: `Live Campaign ${campaignId}`,
            status: remoteStatus,
            settings,
            contacts,
            totalCount: contacts.filter(c => c.isValid).length,
            sentCount: statusReport.sentCount ?? contacts.length,
            succeededCount: statusReport.succeededCount ?? 0,
            failedCount: statusReport.failedCount ?? 0,
            logs: statusReport.logs ?? [],
            createdAt: new Date().toISOString(),
          };
          setActiveCampaign(completedLive);
          saveCampaignToHistory(completedLive);
        }

      } catch (pollErr) {
        console.warn('[Live Polling Network Fail, Attempting Backoff]', pollErr);
        // Exponential backoff or max warnings
        setLiveBackoffCount((prev) => {
          const nextVal = prev + 1;
          if (nextVal >= 3) {
            clearInterval(intId);
            setLivePollIntervalId(null);
            setApiError('Connected polling failed after 3 network retry attempts.');
            setCampaignStatus('paused');
          }
          return nextVal;
        });
      }
    }, 2000);

    setLivePollIntervalId(intId);
  };

  const pauseLiveCampaign = async () => {
    if (!activeCampaign) return;
    try {
      const response = await fetch(`${settings.apiBaseUrl}/campaigns/${activeCampaign.id}/pause`, {
        method: 'POST',
      });
      if (response.ok) {
        setCampaignStatus('paused');
        console.log('[Live API Engine] Posted pause.');
      }
    } catch (err) {
      console.error('Failed to trigger Pause request', err);
    }
  };

  const resumeLiveCampaign = async () => {
    if (!activeCampaign) return;
    try {
      const response = await fetch(`${settings.apiBaseUrl}/campaigns/${activeCampaign.id}/resume`, {
        method: 'POST',
      });
      if (response.ok) {
        setCampaignStatus('running');
        startLivePolling(activeCampaign.id);
        console.log('[Live API Engine] Posted resume.');
      }
    } catch (err) {
      console.error('Failed to trigger Resume request', err);
    }
  };

  const stopLiveCampaign = async () => {
    if (!activeCampaign) return;
    try {
      const response = await fetch(`${settings.apiBaseUrl}/campaigns/${activeCampaign.id}/stop`, {
        method: 'POST',
      });
      if (response.ok) {
        setCampaignStatus('canceled');
        if (livePollIntervalId) clearInterval(livePollIntervalId);
        setLivePollIntervalId(null);
        console.log('[Live API Engine] Sent abort termination signal.');
      }
    } catch (err) {
      console.error('Failed to trigger Stop request', err);
    }
  };

  // -------------------------------------------------------------
  // PRIMARY BUTTON ROUTER Dispatcher
  // -------------------------------------------------------------
  const handleStartCampaign = () => {
    if (settings.apiMode === 'simulated') {
      startSimulatedCampaign();
    } else {
      startLiveCampaign();
    }
  };

  const handlePauseCampaign = () => {
    if (settings.apiMode === 'simulated') {
      pauseSimulatedCampaign();
    } else {
      pauseLiveCampaign();
    }
  };

  const handleResumeCampaign = () => {
    if (settings.apiMode === 'simulated') {
      startSimulatedCampaign(); // Retrigger simulated loop at currentRef pointer index
    } else {
      resumeLiveCampaign();
    }
  };

  const handleStopCampaign = () => {
    if (settings.apiMode === 'simulated') {
      stopSimulatedCampaign();
    } else {
      stopLiveCampaign();
    }
  };

  const handleResetWorkspace = () => {
    setCampaignStatus('idle');
    setSentCount(0);
    setSucceededCount(0);
    setFailedCount(0);
    setLogs([]);
    currentIndexRef.current = 0;
    setActiveCampaign(null);
    setApiError(null);
    console.log('[Campaign Monitor] Reset.');
  };

  // Compute calculated Estimated Time Left (assuming 850ms per batch simulated latency)
  const estimatedTimeLeftSecs = Math.max(
    0,
    Math.round(((contacts.filter((c) => c.isValid).length - sentCount) * 850) / 1000)
  );

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-250 flex flex-col font-sans">
      {/* Navbar Banner Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/10">
              <Cpu className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                  Nabda OTP Bulk Messenger
                </h1>
                <span className="hidden sm:inline-flex text-[9px] font-extrabold tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase px-1.5 py-0.5 rounded">
                  v1.2 Prod
                </span>
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-400">
                Bulk message delivery and queuing dashboard for Nabda OTP API instances
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Server mode indicator badge */}
            <div className={`hidden md:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
              settings.apiMode === 'simulated'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-955 dark:border-emerald-950 dark:text-emerald-400'
                : 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-955 dark:border-indigo-950 dark:text-indigo-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${settings.apiMode === 'simulated' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
              <span>{settings.apiMode === 'simulated' ? 'On-Device Simulation Mode' : 'Connected to Live APIs'}</span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme colorizer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Connection Exception Banner */}
        {apiError && (
          <div className="p-4 bg-rose-50 border border-rose-100 dark:bg-rose-955 dark:border-rose-950 text-rose-700 dark:text-rose-400 rounded-xl flex items-start gap-3 animate-scaleIn text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <div className="space-y-1">
              <span className="font-bold block">Live Connection Attempt Halted</span>
              <p>{apiError}</p>
              <button
                onClick={() => setSettings({ ...settings, apiMode: 'simulated' })}
                className="mt-1 font-semibold text-rose-600 dark:text-rose-400 underline hover:text-rose-700"
              >
                Switch back to simulated mock server for sandbox preview testing
              </button>
            </div>
          </div>
        )}

        {/* Instructions guidelines widget */}
        <HowToUseDocs />

        {/* Work grid configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Segment left - Files importation preview */}
            <CsvUploader
              onContactsParsed={handleContactsParsed}
              contacts={contacts}
              onClear={handleClearContacts}
            />

            {/* Segment Content Composer */}
            <MessageComposer
              defaultMessage={settings.defaultMessage}
              useContactOverride={settings.useContactOverride}
              onDefaultMessageChange={(val) => setSettings({ ...settings, defaultMessage: val })}
              onUseContactOverrideChange={(val) => setSettings({ ...settings, useContactOverride: val })}
            />
          </div>

          <div className="space-y-6">
            {/* Campaign Parameters section */}
            <CampaignSettingsForm
              settings={settings}
              onSettingsChange={setSettings}
            />

            {/* Active Control Station panel */}
            {campaignStatus !== 'idle' ? (
              <ActiveCampaignPanel
                status={campaignStatus}
                sentCount={sentCount}
                succeededCount={succeededCount}
                failedCount={failedCount}
                totalCount={contacts.filter((c) => c.isValid).length}
                onPause={handlePauseCampaign}
                onResume={handleResumeCampaign}
                onStop={handleStopCampaign}
                onReset={handleResetWorkspace}
                estimatedTimeLeftSecs={estimatedTimeLeftSecs}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center shadow-sm flex flex-col items-center justify-center min-h-[180px] space-y-3.5">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-500">
                  <Send className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-slate-850 dark:text-slate-200 text-sm">Campaign Launcher Ready</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[210px] mx-auto">
                    Upload your contacts and type your messages above to start broadcasting on Nabda instance
                  </p>
                </div>
                <button
                  onClick={handleStartCampaign}
                  disabled={contacts.filter((c) => c.isValid).length === 0 || !settings.instanceId}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Campaign Delivery</span>
                </button>
              </div>
            )}

            {/* Dynamic Local Campaign Cache History */}
            <CampaignHistory
              history={history}
              activeCampaignId={activeCampaign?.id}
              onSelectCampaign={handleSelectCampaign}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>

        {/* Delivery detail log databases */}
        <CampaignLogsTable logs={logs} />
      </main>

      {/* Footer credits bar */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-250/20 dark:border-slate-850 px-4 py-4 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="font-medium text-[10px] sm:text-xs">
            Nabda OTP WhatsApp Messenger Dashboard • Clean Architecture Frontend System
          </p>
          <div className="flex items-center gap-3 font-mono text-[9px] sm:text-[10px]">
            <span>Egypt Country Router: Egypt +20</span>
            <span>Local Cache limit: 3 campaigns</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
