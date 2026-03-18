'use client';

import { useState, useEffect, useCallback } from 'react';
import { Preset, SubjectEntry, generateId } from '@/lib/types';
import { loadPresets, savePresets } from '@/lib/storage';

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const addPreset = useCallback(
    (name: string, subjects: SubjectEntry[]) => {
      const newPreset: Preset = {
        id: generateId(),
        name,
        subjects: subjects.map((s) => ({ ...s, id: generateId() })),
      };
      const updated = [...presets, newPreset];
      setPresets(updated);
      savePresets(updated);
    },
    [presets]
  );

  const updatePreset = useCallback(
    (id: string, subjects: SubjectEntry[]) => {
      const updated = presets.map((p) =>
        p.id === id
          ? { ...p, subjects: subjects.map((s) => ({ ...s, id: generateId() })) }
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

  return { presets, addPreset, updatePreset, deletePreset };
}
