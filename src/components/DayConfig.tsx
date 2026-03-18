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

const levelColors: Record<DistributionLevel, string> = {
  '多め': 'bg-red-50 text-red-600 border-red-200',
  '均等': 'bg-blue-50 text-blue-600 border-blue-200',
  '少なめ': 'bg-green-50 text-green-600 border-green-200',
  '無し': 'bg-gray-50 text-gray-400 border-gray-200',
};

const levelColorsActive: Record<DistributionLevel, string> = {
  '多め': 'bg-red-500 text-white border-red-500',
  '均等': 'bg-blue-500 text-white border-blue-500',
  '少なめ': 'bg-green-500 text-white border-green-500',
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
    <div className="space-y-2">
      {days.map((day, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-[72px] shrink-0 text-sm font-medium text-gray-700">
            {formatDate(day.date)}
          </span>
          <div className="flex flex-1 gap-1">
            {DISTRIBUTION_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setLevel(i, level)}
                className={`flex-1 rounded-lg border px-1 py-2 text-xs font-medium transition-colors ${
                  day.level === level
                    ? levelColorsActive[level]
                    : levelColors[level] + ' hover:opacity-80'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
