import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Scissors,
  BookmarkCheck,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AudioSettings, TrimRange } from '../types';
import { formatFullTimecode, formatTime } from '../utils/timeFormat';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  trimRange: TrimRange;
  isLooping: boolean;
  onToggleLoop: () => void;
  onStepFrame: (frames: number) => void;
  onSetInPoint: () => void;
  onSetOutPoint: () => void;
  onResetTrim: () => void;
  onSplitAtPlayhead: () => void;
  audioSettings: AudioSettings;
  onUpdateAudio: (audio: Partial<AudioSettings>) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  trimRange,
  isLooping,
  onToggleLoop,
  onStepFrame,
  onSetInPoint,
  onSetOutPoint,
  onResetTrim,
  onSplitAtPlayhead,
  audioSettings,
  onUpdateAudio,
}) => {
  const trimmedDuration = Math.max(0, trimRange.end - trimRange.start);

  return (
    <div className="h-12 border-t border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 flex items-center justify-between select-none">
      {/* Left: Precise Timecode & Trim Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-1.5 font-mono text-sm">
          <span className="text-white font-semibold">
            {formatFullTimecode(currentTime)}
          </span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400 text-xs">
            {formatFullTimecode(duration)}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <span className="text-slate-500">Trim:</span>
          <span className="font-semibold text-blue-400">
            {trimmedDuration.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Center: Playhead & Playback Transport Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Step Backward 1 Frame */}
        <button
          onClick={() => onStepFrame(-1)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Step Backward 1 Frame (Left Arrow)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Play / Pause Toggle Button */}
        <button
          onClick={onTogglePlay}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 ml-0.5 fill-white" />
          )}
        </button>

        {/* Step Forward 1 Frame */}
        <button
          onClick={() => onStepFrame(1)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Step Forward 1 Frame (Right Arrow)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-1 hidden sm:block" />

        {/* Set In-Point Button */}
        <button
          onClick={onSetInPoint}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-blue-400 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-md transition-colors"
          title="Set In-Point at Playhead ([)"
        >
          <span className="font-mono text-blue-400 font-bold">[</span>
          <span>Set In</span>
        </button>

        {/* Set Out-Point Button */}
        <button
          onClick={onSetOutPoint}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-blue-400 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-md transition-colors"
          title="Set Out-Point at Playhead (])"
        >
          <span>Set Out</span>
          <span className="font-mono text-blue-400 font-bold">]</span>
        </button>

        {/* Split at Playhead */}
        <button
          onClick={onSplitAtPlayhead}
          className="hidden md:flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
          title="Split / Cut at playhead (S)"
        >
          <Scissors className="w-3.5 h-3.5 text-amber-400" />
          <span>Cut</span>
        </button>

        {/* Reset Trim */}
        <button
          onClick={onResetTrim}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Trim to Full Length"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Loop & Quick Volume */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLoop}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            isLooping
              ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          title={isLooping ? 'Looping Trimmed Range (On)' : 'Looping Off'}
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Volume Mute Toggle */}
        <button
          onClick={() => onUpdateAudio({ isMuted: !audioSettings.isMuted })}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            audioSettings.isMuted
              ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
          title={audioSettings.isMuted ? 'Unmute (M)' : 'Mute (M)'}
        >
          {audioSettings.isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
