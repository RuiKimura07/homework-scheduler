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

const levelInactive: Record<DistributionLevel, string> = {
  '多め': 'text-red-400 border-gray-200 hover:bg-red-50 hover:border-red-200',
  '均等': 'text-blue-400 border-gray-200 hover:bg-blue-50 hover:border-blue-200',
  '少なめ': 'text-green-400 border-gray-200 hover:bg-green-50 hover:border-green-200',
  '無し': 'text-gray-400 border-gray-200 hover:bg-gray-100',
};

const levelActive: Record<DistributionLevel, string> = {
  '多め': 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-200',
  '均等': 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-200',
  '少なめ': 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200',
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
      <div className="flex items-center gap-2 mb-1 px-0.5">
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
            {DISTRIBUTION_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setLevel(i, level)}
                className={`flex-1 rounded-md border py-2.5 text-[11px] font-bold transition-all ${
                  day.level === level
                    ? levelActive[level]
                    : levelInactive[level] + ' bg-white'
                }`}
              >
                {day.level === level ? level : ''}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
