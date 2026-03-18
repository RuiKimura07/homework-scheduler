'use client';

import { useState, useEffect } from 'react';
import {
  SubjectEntry,
  DayDistribution,
  ScheduleResult,
  ScheduleHistory,
  generateId,
  formatDate,
} from '@/lib/types';
import { calculateSchedule } from '@/lib/scheduler';
import { usePresets } from '@/hooks/usePresets';
import { addHistory, loadHistory, deleteHistory } from '@/lib/storage';
import SubjectInput from '@/components/SubjectInput';
import DateSetting from '@/components/DateSetting';
import DayConfig from '@/components/DayConfig';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import PresetPanel from '@/components/PresetPanel';
import PrintView from '@/components/PrintView';

function getDefaultDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getDays(startDateStr: string, numDays: number): DayDistribution[] {
  const start = new Date(startDateStr + 'T00:00:00');
  return Array.from({ length: numDays }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { date, level: '均等' as const };
  });
}

function Section({ title, children, rightAction }: { title: string; children: React.ReactNode; rightAction?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm shadow-gray-100">
      <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-gray-700 tracking-tight">{title}</h2>
        {rightAction}
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

const NUM_DAYS_OPTIONS = [5, 6, 7, 10, 14];

export default function Home() {
  const [studentName, setStudentName] = useState('');
  const [startDate, setStartDate] = useState(getDefaultDate);
  const [numDays, setNumDays] = useState(7);
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { id: generateId(), subject: '', material: '', amount: 0, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
  ]);
  const [days, setDays] = useState<DayDistribution[]>(() =>
    getDays(getDefaultDate(), 7)
  );
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [editedAmounts, setEditedAmounts] = useState<
    Record<string, Record<number, number>>
  >({});
  const [comment, setComment] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [history, setHistory] = useState<ScheduleHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { presets, addPreset, updatePreset, deletePreset } = usePresets();

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    setDays((prev) => {
      const newDays = getDays(date, numDays);
      return newDays.map((d, i) => ({
        ...d,
        level: prev[i]?.level ?? '均等',
      }));
    });
  };

  const handleNumDaysChange = (n: number) => {
    setNumDays(n);
    setDays((prev) => {
      const newDays = getDays(startDate, n);
      return newDays.map((d, i) => ({
        ...d,
        level: prev[i]?.level ?? '均等',
      }));
    });
  };

  const handleGenerate = () => {
    const validSubjects = subjects.filter(
      (s) =>
        s.subject.trim() &&
        (s.inputMode === 'range'
          ? s.rangeStart > 0 && s.rangeEnd >= s.rangeStart
          : s.amount > 0)
    );
    if (validSubjects.length === 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    const schedule = calculateSchedule(validSubjects, days);
    setResult(schedule);
    setEditedAmounts({});

    // Save to history
    const entry: ScheduleHistory = {
      id: generateId(),
      studentName,
      createdAt: new Date().toISOString(),
      startDate,
      numDays,
      subjects: validSubjects,
      editedAmounts: {},
      dayLevels: days.map((d) => d.level),
      comment,
    };
    addHistory(entry);
    setHistory(loadHistory());
  };

  const handleResetEdits = () => {
    setEditedAmounts({});
  };

  const handleLoadPreset = (presetSubjects: SubjectEntry[], name: string) => {
    setSubjects(
      presetSubjects.map((s) => ({ ...s, id: generateId() }))
    );
    setStudentName(name);
    setShowErrors(false);
  };

  const handleSavePreset = (name: string) => {
    addPreset(name, subjects);
  };

  const handleUpdatePreset = (id: string) => {
    updatePreset(id, subjects);
  };

  const handleDeleteHistory = (id: string) => {
    deleteHistory(id);
    setHistory(loadHistory());
  };

  const handleLoadHistory = (h: ScheduleHistory) => {
    setStudentName(h.studentName);
    setStartDate(h.startDate);
    setNumDays(h.numDays);
    setSubjects(h.subjects.map((s) => ({ ...s, id: generateId() })));
    setComment(h.comment);

    const newDays = getDays(h.startDate, h.numDays);
    const daysWithLevels = newDays.map((d, i) => ({
      ...d,
      level: h.dayLevels[i] ?? '均等' as const,
    }));
    setDays(daysWithLevels);

    const schedule = calculateSchedule(h.subjects, daysWithLevels);
    setResult(schedule);
    setEditedAmounts(h.editedAmounts);
    setShowHistory(false);
    setShowErrors(false);
  };

  const validSubjectCount = subjects.filter(
    (s) =>
      s.subject.trim() &&
      (s.inputMode === 'range'
        ? s.rangeStart > 0 && s.rangeEnd >= s.rangeStart
        : s.amount > 0)
  ).length;

  return (
    <main className="mx-auto max-w-lg px-4 pb-20 pt-6 print:max-w-none print:px-0 print:pt-0">
      {/* Header */}
      <div className="mb-5 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="3" width="14" height="13" rx="2" />
                <line x1="2" y1="7" x2="16" y2="7" />
                <line x1="6" y1="1" x2="6" y2="5" />
                <line x1="12" y1="1" x2="12" y2="5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">宿題スケジュール</h1>
              <p className="text-[11px] text-gray-400">宿題配分を作成・印刷</p>
            </div>
          </div>
          {/* History button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              showHistory
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            履歴
          </button>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="mb-4 print:hidden">
          <Section title="作成履歴">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 text-center">履歴がありません</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {history.map((h) => {
                  const d = new Date(h.createdAt);
                  const dateLabel = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
                  return (
                    <div key={h.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50">
                      <button
                        onClick={() => handleLoadHistory(h)}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-medium text-gray-700">
                          {h.studentName || '（名前なし）'}
                          <span className="ml-2 text-xs text-gray-400">{h.numDays}日間</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {dateLabel} ・ {h.subjects.map((s) => s.subject).join('・')}
                        </div>
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(h.id)}
                        className="shrink-0 ml-2 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4v7.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>
      )}

      <div className="space-y-4 print:hidden">
        {/* Preset */}
        <Section title="プリセット">
          <PresetPanel
            presets={presets}
            onLoad={handleLoadPreset}
            onSave={handleSavePreset}
            onUpdate={handleUpdatePreset}
            onDelete={deletePreset}
            currentName={studentName}
          />
        </Section>

        {/* Student name & Start date & Period */}
        <Section title="基本情報">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">生徒名</label>
              <input
                type="text"
                placeholder="生徒名（任意）"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">開始日</label>
              <DateSetting startDate={startDate} onChange={handleStartDateChange} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">期間</label>
              <div className="flex gap-1.5">
                {NUM_DAYS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => handleNumDaysChange(n)}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      numDays === n
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {n}日
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Subjects */}
        <Section title="科目・教材・量">
          <SubjectInput subjects={subjects} onChange={setSubjects} showErrors={showErrors} />
        </Section>

        {/* Day distribution */}
        <Section title="各日の配分">
          <DayConfig days={days} onChange={setDays} />
        </Section>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          スケジュールを作成
        </button>

        {/* Result */}
        {result && (
          <Section title="スケジュール">
            <ScheduleCalendar
              result={result}
              editedAmounts={editedAmounts}
              onEditedAmountsChange={setEditedAmounts}
              onReset={handleResetEdits}
            />
          </Section>
        )}

        {/* Comment & Print */}
        {result && (
          <Section title="コメント・印刷">
            <PrintView
              result={result}
              studentName={studentName}
              editedAmounts={editedAmounts}
              comment={comment}
              onCommentChange={setComment}
            />
          </Section>
        )}
      </div>

      {/* Print content */}
      {result && (
        <div className="hidden print:block">
          <PrintView
            result={result}
            studentName={studentName}
            editedAmounts={editedAmounts}
            comment={comment}
          />
        </div>
      )}
    </main>
  );
}
