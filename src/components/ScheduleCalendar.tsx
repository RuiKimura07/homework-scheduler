'use client';

import {
  ScheduleResult,
  formatDate,
  DistributionLevel,
} from '@/lib/types';

interface Props {
  result: ScheduleResult;
  onEditedAmountsChange: (amounts: Record<string, Record<number, number>>) => void;
  editedAmounts: Record<string, Record<number, number>>;
  onReset: () => void;
}

const levelBg: Record<DistributionLevel, string> = {
  '多め': 'bg-red-50',
  '均等': 'bg-blue-50',
  '少なめ': 'bg-green-50',
  '無し': 'bg-gray-50',
};

const levelText: Record<DistributionLevel, string> = {
  '多め': 'text-red-500',
  '均等': 'text-blue-500',
  '少なめ': 'text-green-500',
  '無し': 'text-gray-400',
};

export default function ScheduleCalendar({
  result,
  editedAmounts,
  onEditedAmountsChange,
  onReset,
}: Props) {
  const { days, subjects } = result;

  const getAmount = (subjectId: string, dayIndex: number): number => {
    if (editedAmounts[subjectId]?.[dayIndex] !== undefined) {
      return editedAmounts[subjectId][dayIndex];
    }
    return days[dayIndex].assignments.find((a) => a.subjectId === subjectId)?.amount ?? 0;
  };

  const setAmount = (subjectId: string, dayIndex: number, value: number) => {
    const updated = { ...editedAmounts };
    if (!updated[subjectId]) updated[subjectId] = {};
    updated[subjectId] = { ...updated[subjectId], [dayIndex]: value };
    onEditedAmountsChange(updated);
  };

  const getSubjectTotal = (subjectId: string): number => {
    let total = 0;
    for (let i = 0; i < days.length; i++) {
      total += getAmount(subjectId, i);
    }
    return total;
  };

  const hasEdits = Object.keys(editedAmounts).length > 0;

  const allMatch = subjects.every((s) => {
    const orig = s.inputMode === 'range' ? s.rangeEnd - s.rangeStart + 1 : s.amount;
    return getSubjectTotal(s.id) === orig;
  });

  return (
    <div className="space-y-3">
      {hasEdits && (
        <div className="flex justify-end">
          <button
            onClick={onReset}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1v4h4M13 13V9H9" />
              <path d="M11.5 5.5A5.5 5.5 0 0 0 3 3L1 5M2.5 8.5A5.5 5.5 0 0 0 11 11l2-2" />
            </svg>
            自動配分に戻す
          </button>
        </div>
      )}

      {/* Schedule table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-2.5 py-2 text-xs font-semibold text-gray-500 whitespace-nowrap">
                日付
              </th>
              {subjects.map((s) => (
                <th key={s.id} className="px-2 py-2 text-center text-xs font-semibold text-gray-500">
                  <div>{s.subject}</div>
                  <div className="font-normal text-gray-400 text-[10px]">{s.material}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, dayIdx) => (
              <tr key={dayIdx} className={`${levelBg[day.level]} border-b border-gray-100 last:border-b-0`}>
                <td className="px-2.5 py-2 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-800">
                    {formatDate(day.date)}
                  </div>
                  <div className={`text-[10px] font-medium ${levelText[day.level]}`}>
                    {day.level}
                  </div>
                </td>
                {subjects.map((subject) => {
                  const amount = getAmount(subject.id, dayIdx);
                  const assignment = days[dayIdx].assignments.find((a) => a.subjectId === subject.id);
                  const isRange = subject.inputMode === 'range';
                  const hasEditsForThis = editedAmounts[subject.id]?.[dayIdx] !== undefined;

                  return (
                    <td key={subject.id} className="px-2 py-1.5 text-center">
                      {isRange && !hasEditsForThis && assignment?.rangeStart ? (
                        <div className="text-sm font-medium text-gray-800">
                          {assignment.rangeStart === assignment.rangeEnd
                            ? `No.${assignment.rangeStart}`
                            : `No.${assignment.rangeStart}~${assignment.rangeEnd}`}
                          <div className="text-[10px] text-gray-400">({amount}問)</div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-0.5">
                          <input
                            type="number"
                            min={0}
                            value={amount || ''}
                            onChange={(e) =>
                              setAmount(subject.id, dayIdx, parseInt(e.target.value) || 0)
                            }
                            className="w-12 rounded border border-gray-200 bg-white px-1 py-1 text-sm text-right focus:border-blue-400 focus:outline-none"
                          />
                          <span className="text-[10px] text-gray-400">{isRange ? '問' : subject.unit}</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5">
          <span className="text-xs font-semibold text-gray-500">配分サマリー</span>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {subjects.map((subject, idx) => {
              const total = getSubjectTotal(subject.id);
              const originalTotal = subject.inputMode === 'range'
                ? subject.rangeEnd - subject.rangeStart + 1
                : subject.amount;
              const diff = total - originalTotal;
              return (
                <tr key={subject.id} className={idx < subjects.length - 1 ? 'border-b border-gray-100' : ''}>
                  <td className="px-3 py-2 font-medium text-gray-700">
                    {subject.subject}
                    <span className="ml-1 text-xs text-gray-400">{subject.material}</span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-500 text-xs">
                    {total} / {originalTotal}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-medium w-20">
                    {diff === 0 ? (
                      <span className="text-green-600">&#10003;</span>
                    ) : diff < 0 ? (
                      <span className="text-blue-600">残り{Math.abs(diff)}</span>
                    ) : (
                      <span className="text-red-600">+{diff} 超過</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {allMatch && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-xs text-green-700 text-center font-medium">
          すべての科目が正しく配分されています
        </div>
      )}
    </div>
  );
}
