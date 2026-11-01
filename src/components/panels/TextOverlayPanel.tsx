import React from 'react';
import {
  Type,
  Plus,
  Trash2,
  Move,
  Bold,
  Sparkles,
  Layers,
  Play,
} from 'lucide-react';
import { TextOverlay } from '../../types';

interface TextOverlayPanelProps {
  textOverlays: TextOverlay[];
  setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlay[]>>;
  selectedOverlayId: string | null;
  setSelectedOverlayId: (id: string | null) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export const TextOverlayPanel: React.FC<TextOverlayPanelProps> = ({
  textOverlays,
  setTextOverlays,
  selectedOverlayId,
  setSelectedOverlayId,
  currentTime,
  duration,
  onSeek,
}) => {
  // Add new blank overlay
  const handleAddOverlay = (preset?: Partial<TextOverlay>) => {
    const start = currentTime;
    const end = Math.min(duration, start + 4.0);

    const newOverlay: TextOverlay = {
      id: 'txt_' + Math.random().toString(36).substring(2, 9),
      text: preset?.text || 'New Text Overlay',
      startTime: Number(start.toFixed(2)),
      endTime: Number(end.toFixed(2)),
      x: preset?.x ?? 50,
      y: preset?.y ?? 50,
      fontSize: preset?.fontSize ?? 36,
      color: preset?.color || '#ffffff',
      bgColor: preset?.bgColor || 'rgba(0, 0, 0, 0.75)',
      hasBackground: preset?.hasBackground ?? true,
      fontFamily: preset?.fontFamily || 'Inter',
      fontWeight: preset?.fontWeight || 'bold',
      isRTL: preset?.isRTL || false,
      hasShadow: preset?.hasShadow ?? true,
      animation: 'none',
    };

    setTextOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const deleteOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  const activeOverlay = textOverlays.find((o) => o.id === selectedOverlayId);

  return (
    <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)] select-none">
      {/* Add Button & Quick Presets */}
      <div className="space-y-3">
        <button
          onClick={() => handleAddOverlay()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Text Layer</span>
        </button>

        {/* Quick Style Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick Presets
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() =>
                handleAddOverlay({
                  text: '⚡ BREAKING NEWS',
                  y: 18,
                  fontSize: 32,
                  color: '#ffffff',
                  bgColor: '#dc2626',
                  hasBackground: true,
                })
              }
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-left truncate"
            >
              🚨 Breaking News
            </button>
            <button
              onClick={() =>
                handleAddOverlay({
                  text: '@creator • Subscribe',
                  y: 84,
                  fontSize: 28,
                  color: '#38bdf8',
                  bgColor: 'rgba(15, 23, 42, 0.85)',
                  hasBackground: true,
                })
              }
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-left truncate"
            >
              📱 Social Handle
            </button>
            <button
              onClick={() =>
                handleAddOverlay({
                  text: 'خوش آمدید',
                  y: 50,
                  fontSize: 44,
                  color: '#facc15',
                  hasBackground: false,
                  fontFamily: 'Noto Nastaliq Urdu',
                  isRTL: true,
                })
              }
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-left truncate font-urdu text-sm"
            >
              ✨ اردو عنوان (Title)
            </button>
            <button
              onClick={() =>
                handleAddOverlay({
                  text: 'WATCH TILL END 👇',
                  y: 12,
                  fontSize: 30,
                  color: '#fde047',
                  bgColor: '#000000',
                  hasBackground: true,
                })
              }
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-left truncate"
            >
              👇 Hook Callout
            </button>
          </div>
        </div>
      </div>

      {/* Selected Overlay Editor */}
      {activeOverlay ? (
        <div className="bg-slate-900/90 rounded-xl p-3.5 border border-blue-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              Edit Selected Text
            </span>
            <button
              onClick={() => deleteOverlay(activeOverlay.id)}
              className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
              title="Delete text layer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text input */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Content</label>
            <textarea
              value={activeOverlay.text}
              onChange={(e) => updateOverlay(activeOverlay.id, { text: e.target.value })}
              rows={2}
              className={`w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none ${
                activeOverlay.isRTL ? 'font-urdu text-sm text-right' : ''
              }`}
            />
          </div>

          {/* Font & RTL Mode */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Font</label>
              <select
                value={activeOverlay.fontFamily}
                onChange={(e) => {
                  const font = e.target.value;
                  updateOverlay(activeOverlay.id, {
                    fontFamily: font,
                    isRTL: font === 'Noto Nastaliq Urdu',
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
              >
                <option value="Inter">Inter (Clean)</option>
                <option value="Noto Nastaliq Urdu">Urdu Nastaliq</option>
                <option value="Plus Jakarta Sans">Jakarta</option>
                <option value="Outfit">Outfit</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Direction
              </label>
              <button
                onClick={() =>
                  updateOverlay(activeOverlay.id, { isRTL: !activeOverlay.isRTL })
                }
                className={`w-full py-1 px-2 rounded border text-xs font-medium transition-all ${
                  activeOverlay.isRTL
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {activeOverlay.isRTL ? 'RTL (Urdu/Arabic)' : 'LTR (English)'}
              </button>
            </div>
          </div>

          {/* Font Size & Position X/Y */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Font Size</span>
              <span className="font-mono text-white">{activeOverlay.fontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="96"
              value={activeOverlay.fontSize}
              onChange={(e) =>
                updateOverlay(activeOverlay.id, { fontSize: parseInt(e.target.value) })
              }
              className="w-full accent-blue-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          {/* Interactive coordinates */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">X Position ({activeOverlay.x}%)</span>
              <input
                type="range"
                min="5"
                max="95"
                value={activeOverlay.x}
                onChange={(e) =>
                  updateOverlay(activeOverlay.id, { x: parseInt(e.target.value) })
                }
                className="w-full accent-blue-500 bg-slate-800 rounded h-1 cursor-pointer"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Y Position ({activeOverlay.y}%)</span>
              <input
                type="range"
                min="5"
                max="95"
                value={activeOverlay.y}
                onChange={(e) =>
                  updateOverlay(activeOverlay.id, { y: parseInt(e.target.value) })
                }
                className="w-full accent-blue-500 bg-slate-800 rounded h-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Color & Background Pill */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Color:</span>
              <input
                type="color"
                value={activeOverlay.color}
                onChange={(e) =>
                  updateOverlay(activeOverlay.id, { color: e.target.value })
                }
                className="w-6 h-6 rounded bg-transparent cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={activeOverlay.hasBackground}
                onChange={(e) =>
                  updateOverlay(activeOverlay.id, { hasBackground: e.target.checked })
                }
                className="w-3.5 h-3.5 accent-blue-600 rounded"
              />
              <span>Backdrop Pill</span>
            </label>
          </div>

          {/* Timing Start & End */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <span>In:</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max={activeOverlay.endTime}
                value={Number(activeOverlay.startTime.toFixed(2))}
                onChange={(e) =>
                  updateOverlay(activeOverlay.id, {
                    startTime: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-14 bg-slate-950 border border-slate-800 rounded px-1 text-center text-xs font-mono text-white"
              />
              <span>s</span>
            </div>

            <div className="flex items-center gap-1">
              <span>Out:</span>
              <input
                type="number"
                step="0.1"
                min={activeOverlay.startTime}
                max={duration}
                value={Number(activeOverlay.endTime.toFixed(2))}
                onChange={(e) =>
                  updateOverlay(activeOverlay.id, {
                    endTime: parseFloat(e.target.value) || duration,
                  })
                }
                className="w-14 bg-slate-950 border border-slate-800 rounded px-1 text-center text-xs font-mono text-white"
              />
              <span>s</span>
            </div>

            <button
              onClick={() => onSeek(activeOverlay.startTime)}
              className="ml-auto p-1 text-slate-400 hover:text-white"
              title="Jump to time"
            >
              <Play className="w-3 h-3 fill-slate-400" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Layer Stack */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          All Layers ({textOverlays.length})
        </h4>

        {textOverlays.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">No text layers yet</p>
        ) : (
          <div className="space-y-1.5">
            {textOverlays.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedOverlayId(item.id)}
                className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  selectedOverlayId === item.id
                    ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Type className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{item.text}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500 flex-shrink-0 ml-2">
                  {item.startTime.toFixed(1)}s - {item.endTime.toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
