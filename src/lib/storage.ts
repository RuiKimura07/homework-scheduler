import { Preset, SubjectEntry, ScheduleHistory, generateId } from './types';

const PRESETS_KEY = 'homework-scheduler-presets';
const HISTORY_KEY = 'homework-scheduler-history';
const SEEDED_KEY = 'homework-scheduler-seeded';
const SUBJECT_MASTER_KEY = 'subject-master';
const MAX_HISTORY = 30;

const DEFAULT_SUBJECTS = ['数学', '英語', '国語', '理科', '社会'];

// === Sample Preset ===

function getSamplePreset(): Preset {
  return {
    id: generateId(),
    name: '中学5教科サンプル',
    subjects: [
      { id: generateId(), subject: '英語', material: '教科書ワーク', amount: 10, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
      { id: generateId(), subject: '数学', material: '基本問題集', amount: 0, unit: '問', inputMode: 'range', rangeStart: 1, rangeEnd: 20 },
      { id: generateId(), subject: '国語', material: '漢字ドリル', amount: 15, unit: '問', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
      { id: generateId(), subject: '理科', material: 'ワーク', amount: 8, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
      { id: generateId(), subject: '社会', material: 'ワーク', amount: 8, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
    ],
    numDays: 7,
    dayLevels: ['均等', '均等', '均等', '均等', '均等', '少なめ', '少なめ'],
  };
}

function seedSamplePreset(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;
  const existing = localStorage.getItem(PRESETS_KEY);
  if (!existing || JSON.parse(existing).length === 0) {
    savePresets([getSamplePreset()]);
  }
  localStorage.setItem(SEEDED_KEY, '1');
}

// === Presets ===

export function loadPresets(): Preset[] {
  if (typeof window === 'undefined') return [];
  seedSamplePreset();
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

// === Subject Master ===

export function loadSubjectMaster(): string[] {
  if (typeof window === 'undefined') return DEFAULT_SUBJECTS;
  const data = localStorage.getItem(SUBJECT_MASTER_KEY);
  if (!data) {
    saveSubjectMaster(DEFAULT_SUBJECTS);
    return DEFAULT_SUBJECTS;
  }
  return JSON.parse(data);
}

export function saveSubjectMaster(subjects: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUBJECT_MASTER_KEY, JSON.stringify(subjects));
}

export function addToSubjectMaster(subject: string): void {
  const subjects = loadSubjectMaster();
  const trimmed = subject.trim();
  if (!trimmed || subjects.includes(trimmed)) return;
  subjects.push(trimmed);
  saveSubjectMaster(subjects);
}

// === Export / Import ===

interface ExportData {
  version: 1;
  exportedAt: string;
  presets: Preset[];
  history: ScheduleHistory[];
  subjectMaster?: string[];
}

export function exportData(): string {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    presets: loadPresets(),
    history: loadHistory(),
    subjectMaster: loadSubjectMaster(),
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
  if (data.subjectMaster) {
    saveSubjectMaster(data.subjectMaster);
  }
  return { presets: data.presets.length, history: data.history.length };
}
