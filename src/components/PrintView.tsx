'use client';

import { useState, useEffect } from 'react';
import { ScheduleResult, formatDate, DistributionLevel } from '@/lib/types';

type Orientation = 'landscape' | 'portrait';

interface Props {
  result: ScheduleResult;
  studentName: string;
  editedAmounts: Record<string, Record<number, number>>;
  comment: string;
  onCommentChange?: (value: string) => void;
}

export default function PrintView({ result, studentName, editedAmounts, comment, onCommentChange }: Props) {
  const { days, subjects } = result;
  const [showPreview, setShowPreview] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>('landscape');

  // Dynamically inject @page orientation
  useEffect(() => {
    if (!onCommentChange) return; // Only the interactive instance manages the style
    const id = 'print-orientation-style';
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = `@media print { @page { size: ${orientation} !important; margin: 8mm !important; } }`;
  }, [orientation, onCommentChange]);

  const getAmount = (subjectId: string, dayIndex: number): number => {
    if (editedAmounts[subjectId]?.[dayIndex] !== undefined) {
      return editedAmounts[subjectId][dayIndex];
    }
    return days[dayIndex].assignments.find((a) => a.subjectId === subjectId)?.amount ?? 0;
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  const handlePrint = () => {
    window.print();
  };

  // Shared print content renderer
  const renderPrintContent = (isPreview: boolean) => (
    <div className={isPreview ? '' : 'print-content'}>
      {/* Header */}
      <div style={{ marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #111' }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>宿題スケジュール</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#555' }}>
          {studentName && <span>生徒名: {studentName}</span>}
          <span>作成日: {dateStr}</span>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 12 }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #999', background: '#f3f3f3', padding: '4px 6px', textAlign: 'left', fontSize: 10 }}>
              日付
            </th>
            {subjects.map((s) => (
              <th key={s.id} style={{ border: '1px solid #999', background: '#f3f3f3', padding: '4px 6px', textAlign: 'center', fontSize: 10 }}>
                {s.subject}
                <br />
                <span style={{ fontSize: 8, fontWeight: 400, color: '#888' }}>{s.material}</span>
              </th>
            ))}
            <th style={{ border: '1px solid #999', background: '#f3f3f3', padding: '4px 6px', textAlign: 'center', fontSize: 9, width: 28 }}>
              完了
            </th>
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIdx) => {
            const isOff = day.level === '無し';
            return (
              <tr key={dayIdx} style={{ background: isOff ? '#f9f9f9' : 'white' }}>
                <td style={{ border: '1px solid #999', padding: '4px 6px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{formatDate(day.date)}</div>
                  <div style={{ fontSize: 9, color: '#888' }}>{day.level}</div>
                </td>
                {subjects.map((subject) => {
                  const amount = getAmount(subject.id, dayIdx);
                  const assignment = days[dayIdx].assignments.find((a) => a.subjectId === subject.id);
                  const isRange = subject.inputMode === 'range';
                  let label = '-';
                  if (amount > 0) {
                    if (isRange && assignment?.rangeStart) {
                      label = assignment.rangeStart === assignment.rangeEnd
                        ? `No.${assignment.rangeStart}`
                        : `No.${assignment.rangeStart}~${assignment.rangeEnd}`;
                    } else {
                      label = `${amount}${subject.unit}`;
                    }
                  }
                  return (
                    <td key={subject.id} style={{ border: '1px solid #999', padding: '4px 6px', textAlign: 'center', color: isOff && amount === 0 ? '#ccc' : '#111' }}>
                      {label}
                    </td>
                  );
                })}
                <td style={{ border: '1px solid #999', padding: '4px 6px', textAlign: 'center' }}>
                  <div style={{ width: 16, height: 16, border: '1.5px solid #999', borderRadius: 3, margin: '0 auto' }} />
                </td>
              </tr>
            );
          })}
          {/* Total row */}
          <tr style={{ background: '#f3f3f3', fontWeight: 600 }}>
            <td style={{ border: '1px solid #999', padding: '4px 6px' }}>合計</td>
            {subjects.map((subject) => {
              let total = 0;
              for (let i = 0; i < days.length; i++) {
                total += getAmount(subject.id, i);
              }
              return (
                <td key={subject.id} style={{ border: '1px solid #999', padding: '4px 6px', textAlign: 'center' }}>
                  {subject.inputMode === 'range'
                    ? `No.${subject.rangeStart}~${subject.rangeEnd}`
                    : `${total}${subject.unit}`}
                </td>
              );
            })}
            <td style={{ border: '1px solid #999' }} />
          </tr>
        </tbody>
      </table>

      {/* Comment */}
      {comment && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: '#333' }}>
            先生からのコメント
          </div>
          <div style={{ border: '1.5px solid #333', borderRadius: 4, minHeight: 50, padding: '6px 8px', fontSize: 11, whiteSpace: 'pre-wrap' }}>
            {comment}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Comment input (screen only) */}
      {onCommentChange && (
        <div className="space-y-1.5 mb-4 print:hidden">
          <label className="block text-xs font-medium text-gray-500">先生からのコメント</label>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="印刷時に表示されるコメントを入力..."
            rows={3}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none resize-y"
          />
        </div>
      )}

      {/* Orientation toggle */}
      {onCommentChange && (
        <div className="flex gap-2 mb-3 print:hidden">
          <label className="block text-xs font-medium text-gray-500 self-center shrink-0">用紙向き</label>
          <div className="flex flex-1 gap-1">
            <button
              onClick={() => setOrientation('landscape')}
              className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                orientation === 'landscape'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              A4 横
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                orientation === 'portrait'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              A4 縦
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {onCommentChange && (
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex-1 rounded-lg border py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              showPreview
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="3" />
              <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" />
            </svg>
            プレビュー
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 rounded-lg bg-gray-800 py-3 text-sm font-medium text-white hover:bg-gray-900 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 5.5V1.5h8V5.5M4 12H2.5A1.5 1.5 0 0 1 1 10.5V7A1.5 1.5 0 0 1 2.5 5.5h11A1.5 1.5 0 0 1 15 7v3.5a1.5 1.5 0 0 1-1.5 1.5H12" />
              <rect x="4" y="9.5" width="8" height="5" />
            </svg>
            印刷する
          </button>
        </div>
      )}

      {/* Preview */}
      {showPreview && onCommentChange && (
        <div className="mt-4 print:hidden">
          <div
            className={`mx-auto border border-gray-300 bg-white shadow-sm overflow-auto ${
              orientation === 'landscape'
                ? 'max-w-full aspect-[297/210]'
                : 'max-w-[320px] aspect-[210/297]'
            }`}
            style={{ padding: orientation === 'landscape' ? '12px 16px' : '16px 12px' }}
          >
            <div style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '142%' }}>
              {renderPrintContent(true)}
            </div>
          </div>
        </div>
      )}

      {/* Actual print content (hidden on screen) */}
      <div className="hidden print:block">
        {renderPrintContent(false)}
      </div>
    </div>
  );
}
