'use client';

import { useState } from 'react';
import { Preset, SubjectEntry } from '@/lib/types';

interface Props {
  presets: Preset[];
  onLoad: (subjects: SubjectEntry[], name: string) => void;
  onSave: (name: string) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  currentName: string;
}

export default function PresetPanel({
  presets,
  onLoad,
  onSave,
  onUpdate,
  onDelete,
  currentName,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [confirmPreset, setConfirmPreset] = useState<Preset | null>(null);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => { setIsOpen(!isOpen); setShowSave(false); }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
            isOpen ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Z" />
            <circle cx="8" cy="5.5" r="1.5" />
            <path d="M5 12c0-1.657 1.343-3 3-3s3 1.343 3 3" />
          </svg>
          読み込み
        </button>
        <button
          onClick={() => { setShowSave(!showSave); setIsOpen(false); }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
            showSave ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12.5 14h-9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h7l3 3v8a1 1 0 0 1-1 1Z" />
            <path d="M10 2v3h3M5.5 9h5M5.5 11.5h5" />
          </svg>
          新規保存
        </button>
      </div>

      {/* Preset list */}
      {isOpen && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white">
          {presets.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              プリセットがありません
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50"
                >
                  <button
                    onClick={() => setConfirmPreset(preset)}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm font-medium text-gray-700">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {preset.subjects.map((s) => s.subject).join('・')}
                    </div>
                  </button>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => onUpdate(preset.id)}
                      title="上書き保存"
                      className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-500"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M10.5 12.5h-7a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1h5l3 3v7a1 1 0 0 1-1 1Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(preset.id)}
                      title="削除"
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4v7.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save form */}
      {showSave && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="プリセット名"
              value={saveName || currentName}
              onChange={(e) => setSaveName(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <button
              onClick={() => {
                const name = saveName || currentName;
                if (name.trim()) {
                  onSave(name.trim());
                  setSaveName('');
                  setShowSave(false);
                }
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      )}
      {/* Confirm dialog */}
      {confirmPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xs rounded-xl bg-white p-4 shadow-xl">
            <p className="text-sm font-medium text-gray-800 mb-1">
              「{confirmPreset.name}」を読み込みますか？
            </p>
            <p className="text-xs text-gray-400 mb-4">
              現在の入力内容は上書きされます
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmPreset(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  onLoad(confirmPreset.subjects, confirmPreset.name);
                  setConfirmPreset(null);
                  setIsOpen(false);
                }}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                読み込む
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
