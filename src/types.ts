/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MessageContact {
  id: string;
  phone: string;
  message?: string; // Contact-specific message
  isValid: boolean;
  validationError?: string;
}

export type CampaignStatus = 'idle' | 'running' | 'paused' | 'completed' | 'canceled';

export interface CampaignSettings {
  instanceId: string;
  batchSize: number;
  rateLimit: number; // in msg/sec or msg/min (visual indicator/limit)
  dryRun: boolean;
  defaultMessage: string;
  useContactOverride: boolean;
  apiMode: 'simulated' | 'live';
  apiBaseUrl: string;
}

export interface CampaignLog {
  id: string;
  phone: string;
  status: 'succeeded' | 'failed' | 'pending';
  errorMessage?: string;
  timestamp: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  settings: CampaignSettings;
  contacts: MessageContact[];
  totalCount: number;
  sentCount: number;
  succeededCount: number;
  failedCount: number;
  logs: CampaignLog[];
  createdAt: string;
}
