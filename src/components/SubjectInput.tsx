'use client';

import { SubjectEntry, Unit, UNITS, InputMode, generateId } from '@/lib/types';

interface Props {
  subjects: SubjectEntry[];
  onChange: (subjects: SubjectEntry[]) => void;
  showErrors?: boolean;
}

export default function SubjectInput({ subjects, onChange, showErrors }: Props) {
  const addRow = () => {
    onChange([
      ...subjects,
      { id: generateId(), subject: '', material: '', amount: 0, unit: '問', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
    ]);
  };

  const removeRow = (id: string) => {
    if (subjects.length <= 1) return;
    onChange(subjects.filter((s) => s.id !== id));
  };

  const updateField = (
    id: string,
    field: keyof SubjectEntry,
    value: string | number
  ) => {
    onChange(
      subjects.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const toggleMode = (id: string) => {
    onChange(
      subjects.map((s) => {
        if (s.id !== id) return s;
        const newMode: InputMode = s.inputMode === 'amount' ? 'range' : 'amount';
        return { ...s, inputMode: newMode };
      })
    );
  };

  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    const arr = [...subjects];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onChange(arr);
  };

  const moveDown = (idx: number) => {
    if (idx >= subjects.length - 1) return;
    const arr = [...subjects];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    onChange(arr);
  };

  const inputBase = 'rounded-md border bg-white text-[13px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-colors';

  return (
    <div className="space-y-2.5">
      {subjects.map((entry, idx) => {
        const missingSubject = showErrors && !entry.subject.trim();
        const missingAmount = showErrors && entry.subject.trim() && entry.inputMode === 'amount' && !entry.amount;
        const missingRange = showErrors && entry.subject.trim() && entry.inputMode === 'range' && (!entry.rangeStart || !entry.rangeEnd);
        const isRange = entry.inputMode === 'range';

        return (
          <div key={entry.id} className="rounded-lg border border-gray-150 bg-gray-50/60 p-3">
            {/* Row 1: subject + material + delete */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex flex-col shrink-0 w-4">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="text-gray-300 hover:text-gray-600 disabled:opacity-20 h-3 flex items-center justify-center"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 5l4-4 4 4"/></svg>
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === subjects.length - 1}
                  className="text-gray-300 hover:text-gray-600 disabled:opacity-20 h-3 flex items-center justify-center"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 1l4 4 4-4"/></svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="科目"
                value={entry.subject}
                onChange={(e) => updateField(entry.id, 'subject', e.target.value)}
                className={`w-[72px] shrink-0 ${inputBase} px-2.5 py-2 font-medium ${
                  missingSubject ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                }`}
              />
              <input
                type="text"
                placeholder="教材名"
                value={entry.material}
                onChange={(e) => updateField(entry.id, 'material', e.target.value)}
                className={`min-w-0 flex-1 ${inputBase} px-2.5 py-2 border-gray-200`}
              />
              <button
                onClick={() => removeRow(entry.id)}
                disabled={subjects.length <= 1}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-gray-350 hover:bg-red-50 hover:text-red-500 disabled:opacity-20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3.5" y1="3.5" x2="10.5" y2="10.5" />
                  <line x1="10.5" y1="3.5" x2="3.5" y2="10.5" />
                </svg>
              </button>
            </div>

            {/* Row 2: mode tabs + inputs - aligned with row 1 */}
            <div className="flex items-center gap-2 pl-6">
              <div className="shrink-0 flex rounded-md border border-gray-200 overflow-hidden">
                <button
                  onClick={() => !isRange ? null : toggleMode(entry.id)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                    !isRange
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-400 hover:text-gray-600'
                  }`}
                >
                  量
                </button>
                <button
                  onClick={() => isRange ? null : toggleMode(entry.id)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold transition-colors border-l border-gray-200 ${
                    isRange
                      ? 'bg-violet-500 text-white'
                      : 'bg-white text-gray-400 hover:text-gray-600'
                  }`}
                >
                  範囲
                </button>
              </div>

              {isRange ? (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-gray-400 shrink-0">No.</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="開始"
                    value={entry.rangeStart || ''}
                    onChange={(e) => updateField(entry.id, 'rangeStart', parseInt(e.target.value) || 0)}
                    className={`w-[52px] shrink-0 ${inputBase} px-2 py-1.5 text-right ${
                      missingRange ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                    }`}
                  />
                  <span className="text-gray-300 shrink-0">~</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="終了"
                    value={entry.rangeEnd || ''}
                    onChange={(e) => updateField(entry.id, 'rangeEnd', parseInt(e.target.value) || 0)}
                    className={`w-[52px] shrink-0 ${inputBase} px-2 py-1.5 text-right ${
                      missingRange ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                    }`}
                  />
                  <span className="text-[11px] text-gray-400 shrink-0 tabular-nums">
                    = {entry.rangeEnd && entry.rangeStart ? Math.max(0, entry.rangeEnd - entry.rangeStart + 1) : 0}問
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={entry.amount || ''}
                    onChange={(e) => updateField(entry.id, 'amount', parseInt(e.target.value) || 0)}
                    className={`w-[60px] shrink-0 ${inputBase} px-2.5 py-1.5 text-right ${
                      missingAmount ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                    }`}
                  />
                  <select
                    value={entry.unit}
                    onChange={(e) => updateField(entry.id, 'unit', e.target.value as Unit)}
                    className={`w-[72px] shrink-0 ${inputBase} px-2 py-1.5 border-gray-200`}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {showErrors && (
        <p className="text-[11px] text-red-500 pl-1">科目名と量（または範囲）を入力してください</p>
      )}
      <button
        onClick={addRow}
        className="w-full rounded-lg border-2 border-dashed border-gray-200 py-3 text-[13px] font-medium text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-colors"
      >
        + 科目を追加
      </button>
    </div>
  );
}
