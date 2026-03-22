'use client';

import {
  ScheduleResult,
  formatDate,
  DistributionLevel,
  EditedRanges,
} from '@/lib/types';

interface Props {
  result: ScheduleResult;
  editedAmounts: Record<string, Record<number, number>>;
  onEditedAmountsChange: (amounts: Record<string, Record<number, number>>) => void;
  editedRanges: EditedRanges;
  onEditedRangesChange: (ranges: EditedRanges) => void;
  onReset: () => void;
}

const levelBg: Record<DistributionLevel, string> = {
  '多め': 'bg-red-50/60',
  '均等': 'bg-blue-50/60',
  '少なめ': 'bg-emerald-50/60',
  '無し': 'bg-gray-50',
};

const levelDot: Record<DistributionLevel, string> = {
  '多め': 'bg-red-400',
  '均等': 'bg-blue-400',
  '少なめ': 'bg-emerald-400',
  '無し': 'bg-gray-300',
};

export default function ScheduleCalendar({
  result,
  editedAmounts,
  onEditedAmountsChange,
  editedRanges,
  onEditedRangesChange,
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

  const getRange = (subjectId: string, dayIndex: number): { start: number; end: number } => {
    if (editedRanges[subjectId]?.[dayIndex]) {
      return editedRanges[subjectId][dayIndex];
    }
    const assignment = days[dayIndex].assignments.find((a) => a.subjectId === subjectId);
    return { start: assignment?.rangeStart ?? 0, end: assignment?.rangeEnd ?? 0 };
  };

  const setRange = (subjectId: string, dayIndex: number, start: number, end: number) => {
    const updated = { ...editedRanges };
    if (!updated[subjectId]) updated[subjectId] = {};
    updated[subjectId] = { ...updated[subjectId], [dayIndex]: { start, end } };
    onEditedRangesChange(updated);

    // Also update amount to match
    const amount = start > 0 && end >= start ? end - start + 1 : 0;
    setAmount(subjectId, dayIndex, amount);
  };

  const getSubjectTotal = (subjectId: string): number => {
    let total = 0;
    for (let i = 0; i < days.length; i++) {
      total += getAmount(subjectId, i);
    }
    return total;
  };

  const hasEdits = Object.keys(editedAmounts).length > 0 || Object.keys(editedRanges).length > 0;

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
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1v4h4M13 13V9H9" />
              <path d="M11.5 5.5A5.5 5.5 0 0 0 3 3L1 5M2.5 8.5A5.5 5.5 0 0 0 11 11l2-2" />
            </svg>
            自動配分に戻す
          </button>
        </div>
      )}

      {/* Schedule table */}
      <div className="rounded-lg border border-gray-200 overflow-x-auto -mx-4 px-4 scroll-hint scroll-hint-card" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full min-w-max text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left pl-3 pr-2 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[88px]">
                日付
              </th>
              {subjects.map((s) => (
                <th key={s.id} className="px-1.5 py-2.5 text-center text-[11px] font-bold text-gray-500">
                  <div className="leading-tight">{s.subject}</div>
                  <div className="font-normal text-gray-400 text-[9px] mt-0.5 leading-tight truncate max-w-[80px] mx-auto">{s.material}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, dayIdx) => (
              <tr key={dayIdx} className={`${levelBg[day.level]} border-b border-gray-100 last:border-b-0`}>
                <td className="pl-3 pr-2 py-2.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${levelDot[day.level]}`} />
                    <div>
                      <div className="text-[13px] font-bold text-gray-800 tabular-nums leading-tight">
                        {formatDate(day.date)}
                      </div>
                      <div className="text-[10px] text-gray-400 leading-tight">
                        {day.level}
                      </div>
                    </div>
                  </div>
                </td>
                {subjects.map((subject) => {
                  const amount = getAmount(subject.id, dayIdx);
                  const isRange = subject.inputMode === 'range';

                  if (isRange) {
                    const range = getRange(subject.id, dayIdx);
                    return (
                      <td key={subject.id} className="px-1 py-2 text-center align-middle">
                        <div className="flex items-center justify-center gap-0.5">
                          <input
                            type="number"
                            min={0}
                            value={range.start || ''}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              setRange(subject.id, dayIdx, v, range.end);
                            }}
                            className="w-9 rounded-md border border-gray-200 bg-white px-0.5 py-1 text-[12px] text-center tabular-nums focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 focus:outline-none"
                          />
                          <span className="text-[12px] text-gray-700 font-medium">~</span>
                          <input
                            type="number"
                            min={0}
                            value={range.end || ''}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              setRange(subject.id, dayIdx, range.start, v);
                            }}
                            className="w-9 rounded-md border border-gray-200 bg-white px-0.5 py-1 text-[12px] text-center tabular-nums focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 focus:outline-none"
                          />
                          <span className="text-[9px] text-gray-400">番</span>
                        </div>
                        {amount > 0 && (
                          <div className="text-[9px] text-gray-400 leading-tight mt-0.5">({amount}問)</div>
                        )}
                      </td>
                    );
                  }

                  return (
                    <td key={subject.id} className="px-1.5 py-2 text-center align-middle">
                      <div className="flex items-center justify-center gap-0.5">
                        <input
                          type="number"
                          min={0}
                          value={amount || ''}
                          onChange={(e) =>
                            setAmount(subject.id, dayIdx, parseInt(e.target.value) || 0)
                          }
                          className="w-11 rounded-md border border-gray-200 bg-white px-1 py-1 text-[13px] text-right tabular-nums focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-400 whitespace-nowrap">{subject.unit}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="space-y-1.5">
        {subjects.map((subject) => {
          const total = getSubjectTotal(subject.id);
          const originalTotal = subject.inputMode === 'range'
            ? subject.rangeEnd - subject.rangeStart + 1
            : subject.amount;
          const diff = total - originalTotal;
          const pct = originalTotal > 0 ? Math.min(100, (total / originalTotal) * 100) : 0;

          return (
            <div key={subject.id} className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-gray-600 w-[72px] shrink-0 truncate">
                {subject.subject}
              </span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    diff === 0 ? 'bg-emerald-400' : diff < 0 ? 'bg-blue-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-gray-500 w-12 text-right shrink-0">
                {total}/{originalTotal}
              </span>
              <span className="w-14 text-right shrink-0">
                {diff === 0 ? (
                  <span className="text-[11px] font-bold text-emerald-500">OK</span>
                ) : diff < 0 ? (
                  <span className="text-[11px] font-bold text-blue-500">-{Math.abs(diff)}</span>
                ) : (
                  <span className="text-[11px] font-bold text-red-500">+{diff}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {allMatch && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-700 text-center font-semibold">
          すべての科目が正しく配分されています
        </div>
      )}
    </div>
  );
}
