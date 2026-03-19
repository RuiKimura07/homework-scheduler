'use client';

import {
  DistributionLevel,
  DISTRIBUTION_LEVELS,
  DayDistribution,
  formatDate,
} from '@/lib/types';

interface Props {
  days: DayDistribution[];
  onChange: (days: DayDistribution[]) => void;
}

const levelActive: Record<DistributionLevel, string> = {
  '多め': 'bg-red-500 text-white border-red-500',
  '均等': 'bg-blue-500 text-white border-blue-500',
  '少なめ': 'bg-emerald-500 text-white border-emerald-500',
  '無し': 'bg-gray-400 text-white border-gray-400',
};

export default function DayConfig({ days, onChange }: Props) {
  const setLevel = (index: number, level: DistributionLevel) => {
    const updated = days.map((d, i) =>
      i === index ? { ...d, level } : d
    );
    onChange(updated);
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-0.5">
        <span className="w-[76px] shrink-0" />
        <div className="flex flex-1 gap-1.5">
          {DISTRIBUTION_LEVELS.map((level) => (
            <span key={level} className="flex-1 text-center text-[10px] font-medium text-gray-400">
              {level}
            </span>
          ))}
        </div>
      </div>
      {days.map((day, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-[76px] shrink-0 text-[13px] font-semibold text-gray-700 tabular-nums">
            {formatDate(day.date)}
          </span>
          <div className="flex flex-1 gap-1.5">
            {DISTRIBUTION_LEVELS.map((level) => {
              const isActive = day.level === level;
              return (
                <button
                  key={level}
                  onClick={() => setLevel(i, level)}
                  className={`flex-1 rounded-md border py-2.5 text-[11px] font-bold transition-all ${
                    isActive
                      ? levelActive[level]
                      : 'bg-gray-50 border-gray-100 text-gray-300 hover:bg-gray-100 hover:text-gray-500'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
