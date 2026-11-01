import React from 'react';
import { Scissors, RotateCcw, Clock, ArrowRight, Play, Check } from 'lucide-react';
import { TrimRange } from '../../types';
import { formatTime } from '../../utils/timeFormat';

interface TrimmingPanelProps {
  duration: number;
  currentTime: number;
  trimRange: TrimRange;
  onUpdateTrim: (trim: TrimRange) => void;
  onSetInPoint: () => void;
  onSetOutPoint: () => void;
  onResetTrim: () => void;
  onSeek: (time: number) => void;
}

export const TrimmingPanel: React.FC<TrimmingPanelProps> = ({
  duration,
  currentTime,
  trimRange,
  onUpdateTrim,
  onSetInPoint,
  onSetOutPoint,
  onResetTrim,
  onSeek,
}) => {
  const trimmedDuration = Math.max(0, trimRange.end - trimRange.start);

  const handleStartChange = (val: number) => {
    const clamped = Math.max(0, Math.min(val, trimRange.end - 0.2));
    onUpdateTrim({ start: clamped, end: trimRange.end });
  };

  const handleEndChange = (val: number) => {
    const clamped = Math.min(duration, Math.max(val, trimRange.start + 0.2));
    onUpdateTrim({ start: trimRange.start, end: clamped });
  };

  // Quick trim presets
  const applyPreset = (type: 'first5' | 'first10' | 'middle' | 'last5') => {
    if (duration <= 0) return;
    if (type === 'first5') {
      onUpdateTrim({ start: 0, end: Math.min(duration, 5) });
      onSeek(0);
    } else if (type === 'first10') {
      onUpdateTrim({ start: 0, end: Math.min(duration, 10) });
      onSeek(0);
    } else if (type === 'middle') {
      const mid = duration / 2;
      const span = Math.min(duration, 10) / 2;
      onUpdateTrim({ start: Math.max(0, mid - span), end: Math.min(duration, mid + span) });
      onSeek(Math.max(0, mid - span));
    } else if (type === 'last5') {
      onUpdateTrim({ start: Math.max(0, duration - 5), end: duration });
      onSeek(Math.max(0, duration - 5));
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Trimmed Duration</span>
          <span className="font-mono text-base font-bold text-blue-400">
            {trimmedDuration.toFixed(2)}s
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{
              width: `${(trimmedDuration / Math.max(duration, 1)) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>In: {formatTime(trimRange.start, true)}</span>
          <span>Out: {formatTime(trimRange.end, true)}</span>
          <span>Total: {formatTime(duration, true)}</span>
        </div>
      </div>

      {/* Numerical In & Out Point Inputs */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          Precise Cut Points
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* In-Point */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-slate-400">Start (In)</label>
              <button
                onClick={onSetInPoint}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Set at Playhead
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                min="0"
                max={trimRange.end - 0.2}
                value={Number(trimRange.start.toFixed(2))}
                onChange={(e) => handleStartChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-500">sec</span>
            </div>
          </div>

          {/* Out-Point */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-slate-400">End (Out)</label>
              <button
                onClick={onSetOutPoint}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Set at Playhead
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                min={trimRange.start + 0.2}
                max={duration}
                value={Number(trimRange.end.toFixed(2))}
                onChange={(e) => handleEndChange(parseFloat(e.target.value) || duration)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-500">sec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Trim Shortcuts */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Quick Clip Presets
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => applyPreset('first5')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-left transition-colors flex items-center justify-between"
          >
            <span>First 5s Hook</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
          <button
            onClick={() => applyPreset('first10')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-left transition-colors flex items-center justify-between"
          >
            <span>First 10s Teaser</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
          <button
            onClick={() => applyPreset('middle')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-left transition-colors flex items-center justify-between"
          >
            <span>Center 10s</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
          <button
            onClick={() => applyPreset('last5')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-left transition-colors flex items-center justify-between"
          >
            <span>Final 5s Outro</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Reset Trim */}
      <div className="pt-2">
        <button
          onClick={onResetTrim}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Trim to Full Length</span>
        </button>
      </div>
    </div>
  );
};
