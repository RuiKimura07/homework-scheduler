'use client';

import { useState, useEffect } from 'react';
import {
  SubjectEntry,
  DayDistribution,
  ScheduleResult,
  ScheduleHistory,
  Preset,
  generateId,
  formatDate,
} from '@/lib/types';
import { calculateSchedule } from '@/lib/scheduler';
import { usePresets } from '@/hooks/usePresets';
import { addHistory, loadHistory, deleteHistory, exportData, importData } from '@/lib/storage';
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
    { id: generateId(), subject: '', material: '', amount: 0, unit: '問', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
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
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [nextLessonDate, setNextLessonDate] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [customDays, setCustomDays] = useState('');

  const { presets, addPreset, updatePreset, deletePreset, reload: reloadPresets } = usePresets();

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

  const handleLoadPreset = (preset: Preset) => {
    setSubjects(
      preset.subjects.map((s) => ({ ...s, id: generateId() }))
    );
    setStudentName(preset.name);
    if (preset.numDays) {
      setNumDays(preset.numDays);
      const newDays = getDays(startDate, preset.numDays);
      setDays(newDays.map((d, i) => ({
        ...d,
        level: preset.dayLevels?.[i] ?? '均等',
      })));
    }
    setShowErrors(false);
  };

  const handleSavePreset = (name: string) => {
    addPreset({ name, subjects, numDays, dayLevels: days.map((d) => d.level) });
  };

  const handleUpdatePreset = (id: string) => {
    updatePreset(id, { name: studentName || 'プリセット', subjects, numDays, dayLevels: days.map((d) => d.level) });
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

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homework-scheduler-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = importData(reader.result as string);
          setHistory(loadHistory());
          reloadPresets();
          setImportMsg(`復元完了（プリセット${result.presets}件・履歴${result.history}件）`);
          setTimeout(() => setImportMsg(''), 3000);
        } catch {
          setImportMsg('エラー: データの読み込みに失敗しました');
          setTimeout(() => setImportMsg(''), 3000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
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
          <div className="flex gap-1.5">
            <button
              onClick={() => { setShowHistory(!showHistory); setShowDataMenu(false); }}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                showHistory
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              履歴
            </button>
            <button
              onClick={() => { setShowDataMenu(!showDataMenu); setShowHistory(false); }}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                showDataMenu
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              データ管理
            </button>
          </div>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="mb-4 print:hidden">
          <Section title="作成履歴">
            {history.length > 0 && (
              <input
                type="text"
                placeholder="生徒名・科目で検索..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm mb-3 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            )}
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 text-center">履歴がありません</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {history.filter((h) => {
                  if (!historySearch.trim()) return true;
                  const q = historySearch.toLowerCase();
                  return h.studentName.toLowerCase().includes(q) ||
                    h.subjects.some((s) => s.subject.toLowerCase().includes(q) || s.material.toLowerCase().includes(q));
                }).map((h) => {
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

      {/* Data management panel */}
      {showDataMenu && (
        <div className="mb-4 print:hidden">
          <Section title="データ管理">
            <p className="text-[11px] text-gray-400 mb-3">
              プリセットと履歴をファイルに保存・復元できます。再インストール時のデータ引き継ぎに使えます。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 10v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" />
                  <path d="M8 2v8M5 7l3 3 3-3" />
                </svg>
                バックアップ保存
              </button>
              <button
                onClick={handleImport}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 10v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" />
                  <path d="M8 10V2M5 5l3-3 3 3" />
                </svg>
                バックアップ復元
              </button>
            </div>
            {importMsg && (
              <p className={`mt-2 text-[11px] font-medium text-center ${importMsg.startsWith('エラー') ? 'text-red-500' : 'text-green-600'}`}>
                {importMsg}
              </p>
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
                    onClick={() => { handleNumDaysChange(n); setCustomDays(''); }}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      numDays === n && !customDays
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {n}日
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="他"
                  value={customDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomDays(v);
                    const n = parseInt(v);
                    if (n > 0 && n <= 31) handleNumDaysChange(n);
                  }}
                  className={`w-[48px] shrink-0 rounded-lg border px-1.5 py-2 text-xs text-center font-medium transition-colors focus:outline-none ${
                    customDays
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}
                />
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
              nextLessonDate={nextLessonDate}
              onNextLessonDateChange={setNextLessonDate}
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
            nextLessonDate={nextLessonDate}
          />
        </div>
      )}
    </main>
  );
}
