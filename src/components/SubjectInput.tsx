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
      { id: generateId(), subject: '', material: '', amount: 0, unit: 'ページ', inputMode: 'amount', rangeStart: 0, rangeEnd: 0 },
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

  return (
    <div className="space-y-3">
      {subjects.map((entry) => {
        const missingSubject = showErrors && !entry.subject.trim();
        const missingAmount = showErrors && entry.subject.trim() && entry.inputMode === 'amount' && !entry.amount;
        const missingRange = showErrors && entry.subject.trim() && entry.inputMode === 'range' && (!entry.rangeStart || !entry.rangeEnd);
        const isRange = entry.inputMode === 'range';

        return (
          <div key={entry.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 space-y-2">
            {/* Row 1: subject, material, delete */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="科目"
                value={entry.subject}
                onChange={(e) => updateField(entry.id, 'subject', e.target.value)}
                className={`w-[68px] shrink-0 rounded-lg border bg-white px-2 py-2 text-sm focus:border-blue-500 focus:outline-none ${
                  missingSubject ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              <input
                type="text"
                placeholder="教材名"
                value={entry.material}
                onChange={(e) => updateField(entry.id, 'material', e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => removeRow(entry.id)}
                disabled={subjects.length <= 1}
                className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="4" x2="12" y2="12" />
                  <line x1="12" y1="4" x2="4" y2="12" />
                </svg>
              </button>
            </div>

            {/* Row 2: mode toggle + amount/range inputs */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleMode(entry.id)}
                className={`shrink-0 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  isRange
                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-500'
                }`}
              >
                {isRange ? '範囲' : '量'}
              </button>

              {isRange ? (
                <>
                  <span className="text-xs text-gray-400 shrink-0">No.</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="開始"
                    value={entry.rangeStart || ''}
                    onChange={(e) => updateField(entry.id, 'rangeStart', parseInt(e.target.value) || 0)}
                    className={`w-[56px] shrink-0 rounded-lg border bg-white px-2 py-1.5 text-sm text-right focus:border-blue-500 focus:outline-none ${
                      missingRange ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <span className="text-xs text-gray-400 shrink-0">~</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="終了"
                    value={entry.rangeEnd || ''}
                    onChange={(e) => updateField(entry.id, 'rangeEnd', parseInt(e.target.value) || 0)}
                    className={`w-[56px] shrink-0 rounded-lg border bg-white px-2 py-1.5 text-sm text-right focus:border-blue-500 focus:outline-none ${
                      missingRange ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <span className="text-xs text-gray-400 shrink-0">
                    ({entry.rangeEnd && entry.rangeStart ? Math.max(0, entry.rangeEnd - entry.rangeStart + 1) : 0}問)
                  </span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    min={0}
                    value={entry.amount || ''}
                    onChange={(e) => updateField(entry.id, 'amount', parseInt(e.target.value) || 0)}
                    className={`w-[56px] shrink-0 rounded-lg border bg-white px-2 py-1.5 text-sm text-right focus:border-blue-500 focus:outline-none ${
                      missingAmount ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <select
                    value={entry.unit}
                    onChange={(e) => updateField(entry.id, 'unit', e.target.value as Unit)}
                    className="w-[68px] shrink-0 rounded-lg border border-gray-200 bg-white px-1 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        );
      })}
      {showErrors && (
        <p className="text-xs text-red-500">科目名と量（または範囲）を入力してください</p>
      )}
      <button
        onClick={addRow}
        className="w-full rounded-lg border-2 border-dashed border-gray-200 py-2.5 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 追加
      </button>
    </div>
  );
}
