import { Preset, SubjectEntry, ScheduleHistory, generateId } from './types';

const PRESETS_KEY = 'homework-scheduler-presets';
const HISTORY_KEY = 'homework-scheduler-history';
const MAX_HISTORY = 30;

// === Presets ===

export function loadPresets(): Preset[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PRESETS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function savePresets(presets: Preset[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

// === History ===

export function loadHistory(): ScheduleHistory[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(HISTORY_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveHistory(history: ScheduleHistory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addHistory(entry: ScheduleHistory): void {
  const history = loadHistory();
  history.unshift(entry);
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }
  saveHistory(history);
}

export function deleteHistory(id: string): void {
  const history = loadHistory().filter((h) => h.id !== id);
  saveHistory(history);
}

// === Export / Import ===

interface ExportData {
  version: 1;
  exportedAt: string;
  presets: Preset[];
  history: ScheduleHistory[];
}

export function exportData(): string {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    presets: loadPresets(),
    history: loadHistory(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): { presets: number; history: number } {
  const data: ExportData = JSON.parse(json);
  if (!data.version || !data.presets || !data.history) {
    throw new Error('無効なデータ形式です');
  }
  savePresets(data.presets);
  saveHistory(data.history);
  return { presets: data.presets.length, history: data.history.length };
}
