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
    const totalAmount =
      subject.inputMode === 'range'
        ? subject.rangeEnd - subject.rangeStart + 1
        : subject.amount;

    const amounts = distributeAmount(totalAmount, weights, totalWeight);

    if (subject.inputMode === 'range') {
      // Convert amounts to ranges
      let cursor = subject.rangeStart;
      for (let i = 0; i < days.length; i++) {
        const count = amounts[i];
        daySchedules[i].assignments.push({
          subjectId: subject.id,
          amount: count,
          rangeStart: count > 0 ? cursor : 0,
          rangeEnd: count > 0 ? cursor + count - 1 : 0,
        });
        cursor += count;
      }
    } else {
      for (let i = 0; i < days.length; i++) {
        daySchedules[i].assignments.push({
          subjectId: subject.id,
          amount: amounts[i],
        });
      }
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

  const raw = weights.map((w) => (total * w) / totalWeight);
  const floored = raw.map((v) => Math.floor(v));
  let remainder = total - floored.reduce((sum, v) => sum + v, 0);

  const fractions = raw.map((v, i) => ({
    index: i,
    fraction: v - Math.floor(v),
  }));

  fractions.sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < remainder; i++) {
    floored[fractions[i].index] += 1;
  }

  return floored;
}
