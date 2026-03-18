'use client';

import { DAY_NAMES } from '@/lib/types';
import { useRef } from 'react';

interface Props {
  startDate: string;
  onChange: (date: string) => void;
}

export default function DateSetting({ startDate, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  let label = '日付を選択';
  if (startDate) {
    const d = new Date(startDate + 'T00:00:00');
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const dow = DAY_NAMES[d.getDay()];
    label = `${m}月${day}日(${dow})`;
  }

  const openPicker = () => {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPicker}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
      >
        {label}
      </button>
      <input
        ref={inputRef}
        type="date"
        value={startDate}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
}
