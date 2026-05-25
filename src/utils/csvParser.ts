/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageContact } from '../types';

/**
 * Parses double-quoted CSV row cleanly
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let currentWord = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentWord.trim());
      currentWord = '';
    } else {
      currentWord += char;
    }
  }
  result.push(currentWord.trim());
  return result;
}

/**
 * Validates international phone format (digits only, length 10-15 roughly)
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  // Strip any leading +, spaces, hyphens
  const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
  
  if (!cleanPhone) {
    return { isValid: false, error: 'Phone number is empty' };
  }
  
  if (!/^\d+$/.test(cleanPhone)) {
    return { isValid: false, error: 'Phone number must contain only digits' };
  }
  
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, error: `Invalid length (${cleanPhone.length} digits). Expected 10-15.` };
  }
  
  return { isValid: true };
}

export function parseCSV(content: string): { contacts: MessageContact[]; errors: string[] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  const contacts: MessageContact[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    errors.push('The uploaded CSV file is empty.');
    return { contacts, errors };
  }

  // Parse headers
  const headerCols = parseCsvLine(lines[0]).map(h => h.toLowerCase());
  
  let phoneIdx = headerCols.findIndex(h => h.includes('phone') || h.includes('num') || h.includes('tel'));
  let messageIdx = headerCols.findIndex(h => h.includes('msg') || h.includes('message') || h.includes('text'));

  // Fallbacks if headers aren't clear
  if (phoneIdx === -1) {
    phoneIdx = 0; // Assume first column is phone
  }
  if (messageIdx === -1 && headerCols.length > 1) {
    messageIdx = 1; // Assume second column is message
  }

  // Parse records
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length === 0 || (cols.length === 1 && cols[0] === '')) continue;

    // Extract values
    const rawPhone = cols[phoneIdx] || '';
    const rawMessage = messageIdx !== -1 ? cols[messageIdx] : undefined;

    const cleanedPhone = rawPhone.replace(/[\s\-\+\(\)]/g, '');
    const { isValid, error } = validatePhoneNumber(rawPhone);

    contacts.push({
      id: `contact-${i}-${Date.now()}`,
      phone: cleanedPhone || rawPhone,
      message: rawMessage,
      isValid,
      validationError: error,
    });
  }

  if (contacts.length === 0) {
    errors.push('No valid contact entries found in CSV. Make sure you have a phone column.');
  }

  return { contacts, errors };
}
