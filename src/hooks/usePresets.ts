'use client';

import { useState, useEffect, useCallback } from 'react';
import { Preset, SubjectEntry, DistributionLevel, generateId } from '@/lib/types';
import { loadPresets, savePresets } from '@/lib/storage';

interface SavePresetOptions {
  name: string;
  subjects: SubjectEntry[];
  numDays: number;
  dayLevels: DistributionLevel[];
}

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const addPreset = useCallback(
    (opts: SavePresetOptions) => {
      const newPreset: Preset = {
        id: generateId(),
        name: opts.name,
        subjects: opts.subjects.map((s) => ({ ...s, id: generateId() })),
        numDays: opts.numDays,
        dayLevels: opts.dayLevels,
      };
      const updated = [...presets, newPreset];
      setPresets(updated);
      savePresets(updated);
    },
    [presets]
  );

  const updatePreset = useCallback(
    (id: string, opts: SavePresetOptions) => {
      const updated = presets.map((p) =>
        p.id === id
          ? {
              ...p,
              subjects: opts.subjects.map((s) => ({ ...s, id: generateId() })),
              numDays: opts.numDays,
              dayLevels: opts.dayLevels,
            }
          : p
      );
      setPresets(updated);
      savePresets(updated);
    },
    [presets]
  );

  const deletePreset = useCallback(
    (id: string) => {
      const updated = presets.filter((p) => p.id !== id);
      setPresets(updated);
      savePresets(updated);
    },
    [presets]
  );

  const reload = useCallback(() => {
    setPresets(loadPresets());
  }, []);

  return { presets, addPreset, updatePreset, deletePreset, reload };
}
