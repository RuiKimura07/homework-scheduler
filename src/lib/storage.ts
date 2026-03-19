import { Preset, SubjectEntry, ScheduleHistory, generateId } from './types';

const PRESETS_KEY = 'homework-scheduler-presets';
const HISTORY_KEY = 'homework-scheduler-history';
const SEEDED_KEY = 'homework-scheduler-seeded';
const SUBJECT_MASTER_KEY = 'subject-master';
const MATERIAL_SEEDED_KEY = 'homework-scheduler-material-seeded';
const MAX_HISTORY = 30;

export interface SubjectMasterEntry {
  name: string;
  materials: string[];
}

const DEFAULT_SUBJECT_MASTER: SubjectMasterEntry[] = [
  { name: '数学', materials: ['基本問題集', 'ワーク', '教科書'] },
  { name: '英語', materials: ['教科書ワーク', 'ワーク', '教科書'] },
  { name: '国語', materials: ['漢字ドリル', 'ワーク', '教科書'] },
  { name: '理科', materials: ['ワーク', '教科書'] },
  { name: '社会', materials: ['ワーク', '教科書'] },
];

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

function migrateSubjectMaster(raw: unknown): SubjectMasterEntry[] {
  if (!Array.isArray(raw)) return DEFAULT_SUBJECT_MASTER;
  if (raw.length === 0) return [];
  // Old format: string[]
  if (typeof raw[0] === 'string') {
    return (raw as string[]).map((name) => {
      const defaults = DEFAULT_SUBJECT_MASTER.find((d) => d.name === name);
      return { name, materials: defaults?.materials ?? [] };
    });
  }
  // New format
  return raw as SubjectMasterEntry[];
}

export function loadSubjectMaster(): SubjectMasterEntry[] {
  if (typeof window === 'undefined') return DEFAULT_SUBJECT_MASTER;
  const data = localStorage.getItem(SUBJECT_MASTER_KEY);
  if (!data) {
    saveSubjectMaster(DEFAULT_SUBJECT_MASTER);
    return DEFAULT_SUBJECT_MASTER;
  }
  const parsed = JSON.parse(data);
  let migrated = migrateSubjectMaster(parsed);
  let needsSave = typeof parsed[0] === 'string';

  // One-time: seed default materials for subjects that have none
  if (!localStorage.getItem(MATERIAL_SEEDED_KEY)) {
    for (const entry of migrated) {
      if (entry.materials.length === 0) {
        const defaults = DEFAULT_SUBJECT_MASTER.find((d) => d.name === entry.name);
        if (defaults && defaults.materials.length > 0) {
          entry.materials = [...defaults.materials];
          needsSave = true;
        }
      }
    }
    localStorage.setItem(MATERIAL_SEEDED_KEY, '1');
  }

  if (needsSave) {
    saveSubjectMaster(migrated);
  }
  return migrated;
}

export function saveSubjectMaster(subjects: SubjectMasterEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUBJECT_MASTER_KEY, JSON.stringify(subjects));
}

export function addToSubjectMaster(subject: string, material?: string): void {
  const subjects = loadSubjectMaster();
  const trimmed = subject.trim();
  if (!trimmed) return;
  const existing = subjects.find((s) => s.name === trimmed);
  if (existing) {
    if (material?.trim() && !existing.materials.includes(material.trim())) {
      existing.materials.push(material.trim());
      saveSubjectMaster(subjects);
    }
    return;
  }
  subjects.push({ name: trimmed, materials: material?.trim() ? [material.trim()] : [] });
  saveSubjectMaster(subjects);
}

export function addMaterialToSubject(subjectName: string, material: string): void {
  const subjects = loadSubjectMaster();
  const entry = subjects.find((s) => s.name === subjectName);
  const trimmed = material.trim();
  if (!trimmed) return;
  if (entry) {
    if (!entry.materials.includes(trimmed)) {
      entry.materials.push(trimmed);
      saveSubjectMaster(subjects);
    }
  }
}

// === Export / Import ===

interface ExportData {
  version: 1;
  exportedAt: string;
  presets: Preset[];
  history: ScheduleHistory[];
  subjectMaster?: SubjectMasterEntry[] | string[];
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
    saveSubjectMaster(migrateSubjectMaster(data.subjectMaster));
  }
  return { presets: data.presets.length, history: data.history.length };
}
