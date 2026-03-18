'use client';

import { SubjectEntry, Unit, UNITS, generateId } from '@/lib/types';

interface Props {
  subjects: SubjectEntry[];
  onChange: (subjects: SubjectEntry[]) => void;
  showErrors?: boolean;
}

export default function SubjectInput({ subjects, onChange, showErrors }: Props) {
  const addRow = () => {
    onChange([
      ...subjects,
      { id: generateId(), subject: '', material: '', amount: 0, unit: 'ページ' },
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

  return (
    <div className="space-y-2.5">
      {subjects.map((entry) => {
        const missingSubject = showErrors && !entry.subject.trim();
        const missingAmount = showErrors && entry.subject.trim() && !entry.amount;
        return (
          <div key={entry.id} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="科目"
              value={entry.subject}
              onChange={(e) => updateField(entry.id, 'subject', e.target.value)}
              className={`w-[68px] shrink-0 rounded-lg border bg-gray-50 px-2 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none ${
                missingSubject ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
            <input
              type="text"
              placeholder="教材名"
              value={entry.material}
              onChange={(e) => updateField(entry.id, 'material', e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <input
              type="number"
              min={0}
              value={entry.amount || ''}
              onChange={(e) =>
                updateField(entry.id, 'amount', parseInt(e.target.value) || 0)
              }
              className={`w-[52px] shrink-0 rounded-lg border bg-gray-50 px-2 py-2.5 text-sm text-right focus:border-blue-500 focus:bg-white focus:outline-none ${
                missingAmount ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
            <select
              value={entry.unit}
              onChange={(e) => updateField(entry.id, 'unit', e.target.value as Unit)}
              className="w-[68px] shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-1 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
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
        );
      })}
      {showErrors && (
        <p className="text-xs text-red-500">科目名と量を入力してください</p>
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
