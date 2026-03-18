export type Unit = 'ページ' | '問' | '枚' | '回';

export const UNITS: Unit[] = ['ページ', '問', '枚', '回'];

export type DistributionLevel = '多め' | '均等' | '少なめ' | '無し';

export const DISTRIBUTION_LEVELS: DistributionLevel[] = ['多め', '均等', '少なめ', '無し'];

export const DISTRIBUTION_WEIGHTS: Record<DistributionLevel, number> = {
  '多め': 2,
  '均等': 1,
  '少なめ': 0.5,
  '無し': 0,
};

export interface SubjectEntry {
  id: string;
  subject: string;
  material: string;
  amount: number;
  unit: Unit;
}

export interface DayDistribution {
  date: Date;
  level: DistributionLevel;
}

export interface ScheduleResult {
  days: DaySchedule[];
  subjects: SubjectEntry[];
}

export interface DaySchedule {
  date: Date;
  level: DistributionLevel;
  assignments: Assignment[];
}

export interface Assignment {
  subjectId: string;
  amount: number;
}

export interface Preset {
  id: string;
  name: string;
  subjects: SubjectEntry[];
}

export interface ScheduleHistory {
  id: string;
  studentName: string;
  createdAt: string; // ISO string
  startDate: string; // YYYY-MM-DD
  numDays: number;
  subjects: SubjectEntry[];
  editedAmounts: Record<string, Record<number, number>>;
  dayLevels: DistributionLevel[];
  comment: string;
}

export const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

export function formatDate(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAY_NAMES[date.getDay()];
  return `${m}/${d}(${day})`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
