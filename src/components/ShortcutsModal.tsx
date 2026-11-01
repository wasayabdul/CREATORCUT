import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause Video' },
    { key: '[', desc: 'Set In-Point (Trim Start)' },
    { key: ']', desc: 'Set Out-Point (Trim End)' },
    { key: '← / →', desc: 'Step 1 Frame Backward / Forward' },
    { key: 'Shift + ← / →', desc: 'Jump 1 Second Backward / Forward' },
    { key: 'M', desc: 'Toggle Audio Mute' },
    { key: 'S', desc: 'Split / Cut Clip at Playhead' },
    { key: 'L', desc: 'Toggle Trim Loop' },
    { key: 'E', desc: 'Open MP4 Export Dialog' },
    { key: 'Esc', desc: 'Close Active Dialog' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="h-12 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-white font-semibold text-xs">
            <Keyboard className="w-4 h-4 text-blue-400" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {shortcuts.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0"
            >
              <span className="text-slate-300">{item.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 font-mono text-[11px] shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Press any shortcut key while editing to boost your editing workflow
        </div>
      </div>
    </div>
  );
};
