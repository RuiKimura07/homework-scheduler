import { Preset, SubjectEntry, ScheduleHistory, generateId } from './types';

const PRESETS_KEY = 'homework-scheduler-presets';
const HISTORY_KEY = 'homework-scheduler-history';
const MAX_HISTORY = 30;

// === Presets ===

export function loadPresets(): Preset[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PRESETS_KEY);
  if (!data) {
    const defaults = getDefaultPresets();
    savePresets(defaults);
    return defaults;
  }
  return JSON.parse(data);
}

export function savePresets(presets: Preset[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

export function getDefaultPresets(): Preset[] {
  return [
    {
      id: generateId(),
      name: '中学生（5教科）',
      subjects: [
        { id: generateId(), subject: '数学', material: 'フォレスタ', amount: 20, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
        { id: generateId(), subject: '英語', material: 'フォレスタ', amount: 15, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
        { id: generateId(), subject: '国語', material: '必修テキスト', amount: 10, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
        { id: generateId(), subject: '理科', material: '必修テキスト', amount: 10, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
        { id: generateId(), subject: '社会', material: '必修テキスト', amount: 10, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
      ],
    },
    {
      id: generateId(),
      name: '高校受験直前',
      subjects: [
        { id: generateId(), subject: '数学', material: '過去問', amount: 3, unit: '回', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
        { id: generateId(), subject: '英語', material: '長文問題集', amount: 5, unit: '問', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
        { id: generateId(), subject: '理科', material: '一問一答', amount: 50, unit: '問', inputMode: 'range', rangeStart: 1, rangeEnd: 50 },
        { id: generateId(), subject: '社会', material: '一問一答', amount: 50, unit: '問', inputMode: 'range', rangeStart: 1, rangeEnd: 50 },
      ],
    },
  ];
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
