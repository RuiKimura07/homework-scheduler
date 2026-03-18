import {
  SubjectEntry,
  DayDistribution,
  ScheduleResult,
  DaySchedule,
  Assignment,
  DISTRIBUTION_WEIGHTS,
} from './types';

export function calculateSchedule(
  subjects: SubjectEntry[],
  days: DayDistribution[]
): ScheduleResult {
  const weights = days.map((d) => DISTRIBUTION_WEIGHTS[d.level]);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const daySchedules: DaySchedule[] = days.map((d) => ({
    date: d.date,
    level: d.level,
    assignments: [],
  }));

  for (const subject of subjects) {
    const assignments = distributeAmount(subject.amount, weights, totalWeight);
    for (let i = 0; i < days.length; i++) {
      daySchedules[i].assignments.push({
        subjectId: subject.id,
        amount: assignments[i],
      });
    }
  }

  return { days: daySchedules, subjects };
}

function distributeAmount(
  total: number,
  weights: number[],
  totalWeight: number
): number[] {
  if (totalWeight === 0) {
    return weights.map(() => 0);
  }

  // Calculate raw (float) distribution
  const raw = weights.map((w) => (total * w) / totalWeight);

  // Floor each value
  const floored = raw.map((v) => Math.floor(v));
  let remainder = total - floored.reduce((sum, v) => sum + v, 0);

  // Get fractional parts with indices
  const fractions = raw.map((v, i) => ({
    index: i,
    fraction: v - Math.floor(v),
  }));

  // Sort by fractional part descending
  fractions.sort((a, b) => b.fraction - a.fraction);

  // Distribute remainder to days with largest fractional parts
  for (let i = 0; i < remainder; i++) {
    floored[fractions[i].index] += 1;
  }

  return floored;
}
