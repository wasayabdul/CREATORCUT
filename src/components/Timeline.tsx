import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Film,
  Type,
  MessageSquare,
  Volume2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Scissors,
} from 'lucide-react';
import { Subtitle, TextOverlay, TrimRange } from '../types';
import { formatTime } from '../utils/timeFormat';

interface TimelineProps {
  duration: number;
  currentTime: number;
  trimRange: TrimRange;
  subtitles: Subtitle[];
  textOverlays: TextOverlay[];
  onSeek: (time: number) => void;
  onUpdateTrim: (newTrim: TrimRange) => void;
  onSelectSubtitle?: (id: string) => void;
  onSelectOverlay?: (id: string) => void;
  selectedSubtitleId?: string | null;
  selectedOverlayId?: string | null;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  trimRange,
  subtitles,
  textOverlays,
  onSeek,
  onUpdateTrim,
  onSelectSubtitle,
  onSelectOverlay,
  selectedSubtitleId,
  selectedOverlayId,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tracksRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // 1x to 3x
  const [isScrubbingPlayhead, setIsScrubbingPlayhead] = useState(false);
  const [activeTrimDrag, setActiveTrimDrag] = useState<'start' | 'end' | 'middle' | null>(null);
  const [dragStartInfo, setDragStartInfo] = useState<{ mouseX: number; trim: TrimRange } | null>(null);

  const effectiveDuration = Math.max(duration, 1);

  // Convert mouse X client coordinate to video timestamp
  const getTimeFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!tracksRef.current) return 0;
      const rect = tracksRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      return pct * effectiveDuration;
    },
    [effectiveDuration]
  );

  // Playhead scrubbing
  const handlePlayheadScrubStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScrubbingPlayhead(true);
    onSeek(getTimeFromEvent(e));
  };

  // Trim handle drag start
  const handleTrimStartDrag = (e: React.MouseEvent, type: 'start' | 'end' | 'middle') => {
    e.stopPropagation();
    setActiveTrimDrag(type);
    setDragStartInfo({
      mouseX: e.clientX,
      trim: { ...trimRange },
    });
  };

  // Mouse move and up handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbingPlayhead) {
        onSeek(getTimeFromEvent(e));
      } else if (activeTrimDrag && dragStartInfo && tracksRef.current) {
        const rect = tracksRef.current.getBoundingClientRect();
        const deltaX = e.clientX - dragStartInfo.mouseX;
        const deltaTime = (deltaX / rect.width) * effectiveDuration;

        if (activeTrimDrag === 'start') {
          const newStart = Math.max(
            0,
            Math.min(dragStartInfo.trim.start + deltaTime, dragStartInfo.trim.end - 0.2)
          );
          onUpdateTrim({ start: newStart, end: trimRange.end });
        } else if (activeTrimDrag === 'end') {
          const newEnd = Math.min(
            effectiveDuration,
            Math.max(dragStartInfo.trim.end + deltaTime, dragStartInfo.trim.start + 0.2)
          );
          onUpdateTrim({ start: trimRange.start, end: newEnd });
        } else if (activeTrimDrag === 'middle') {
          const len = dragStartInfo.trim.end - dragStartInfo.trim.start;
          let newStart = dragStartInfo.trim.start + deltaTime;
          let newEnd = dragStartInfo.trim.end + deltaTime;

          if (newStart < 0) {
            newStart = 0;
            newEnd = len;
          }
          if (newEnd > effectiveDuration) {
            newEnd = effectiveDuration;
            newStart = effectiveDuration - len;
          }
          onUpdateTrim({ start: newStart, end: newEnd });
        }
      }
    };

    const handleMouseUp = () => {
      setIsScrubbingPlayhead(false);
      setActiveTrimDrag(null);
      setDragStartInfo(null);
    };

    if (isScrubbingPlayhead || activeTrimDrag) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isScrubbingPlayhead,
    activeTrimDrag,
    dragStartInfo,
    effectiveDuration,
    getTimeFromEvent,
    onSeek,
    onUpdateTrim,
    trimRange.start,
    trimRange.end,
  ]);

  // Generate tick markers on ruler
  const tickCount = Math.max(6, Math.floor(12 * zoomLevel));
  const ticks = Array.from({ length: tickCount + 1 }).map((_, i) => {
    const time = (i / tickCount) * effectiveDuration;
    const pct = (i / tickCount) * 100;
    return { time, pct };
  });

  const playheadPct = Math.max(0, Math.min(100, (currentTime / effectiveDuration) * 100));
  const trimStartPct = Math.max(0, Math.min(100, (trimRange.start / effectiveDuration) * 100));
  const trimEndPct = Math.max(0, Math.min(100, (trimRange.end / effectiveDuration) * 100));
  const trimWidthPct = Math.max(0, trimEndPct - trimStartPct);

  return (
    <div
      ref={containerRef}
      className="h-56 bg-slate-950 border-t border-slate-800 flex flex-col select-none overflow-hidden"
    >
      {/* Timeline Toolbar */}
      <div className="h-9 px-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-blue-400" />
            Tracks
          </span>
          <span className="text-[11px] text-slate-500">
            Click ruler or video to scrub playhead
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
            disabled={zoomLevel <= 1}
            className="p-1 hover:text-white disabled:opacity-40 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-slate-400 w-8 text-center">
            {zoomLevel.toFixed(1)}x
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
            disabled={zoomLevel >= 3}
            className="p-1 hover:text-white disabled:opacity-40 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Track Body */}
      <div className="flex-1 flex overflow-x-auto relative">
        {/* Track Headers (Left sidebar) */}
        <div className="w-28 sm:w-36 flex-shrink-0 bg-slate-900/90 border-r border-slate-800/80 flex flex-col text-[11px] font-medium text-slate-400 z-20">
          {/* Ruler header */}
          <div className="h-7 border-b border-slate-800 flex items-center px-3 text-slate-500 font-mono text-[10px]">
            TIME
          </div>
          {/* Video track header */}
          <div className="h-11 border-b border-slate-800/60 flex items-center gap-2 px-3 hover:text-slate-200">
            <Film className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate">Video & Trim</span>
          </div>
          {/* Subtitles track header */}
          <div className="h-10 border-b border-slate-800/60 flex items-center gap-2 px-3 hover:text-slate-200">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Subtitles</span>
          </div>
          {/* Text Overlays track header */}
          <div className="h-10 flex items-center gap-2 px-3 hover:text-slate-200">
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Text Layers</span>
          </div>
        </div>

        {/* Tracks Area (Scrollable by zoom) */}
        <div
          ref={tracksRef}
          style={{ width: `${100 * zoomLevel}%` }}
          className="relative flex-1 min-w-full flex flex-col bg-[#0b0e14] cursor-pointer"
          onMouseDown={handlePlayheadScrubStart}
        >
          {/* 1. Timecode Ruler */}
          <div className="h-7 border-b border-slate-800 bg-slate-950/80 relative flex items-center">
            {ticks.map((t, idx) => (
              <div
                key={idx}
                style={{ left: `${t.pct}%` }}
                className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none transform -translate-x-1/2"
              >
                <div className="w-[1px] h-2 bg-slate-700" />
                <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                  {formatTime(t.time, true)}
                </span>
              </div>
            ))}
          </div>

          {/* 2. Video Track & Visual Trim Handles */}
          <div className="h-11 border-b border-slate-800/60 relative bg-slate-900/40 overflow-hidden">
            {/* Simulated Thumbnails / Filmstrip pattern */}
            <div className="absolute inset-0 flex items-center opacity-30 pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-8 mx-0.5 rounded-sm bg-gradient-to-b from-blue-900/40 to-slate-800/60 border border-slate-700/40"
                />
              ))}
            </div>

            {/* Out-of-trim Dimming: Left */}
            <div
              style={{ width: `${trimStartPct}%` }}
              className="absolute left-0 top-0 bottom-0 bg-black/60 backdrop-blur-[1px] border-r border-amber-500/40 pointer-events-none z-10"
            />

            {/* Active Trimmed Region Box */}
            <div
              style={{
                left: `${trimStartPct}%`,
                width: `${trimWidthPct}%`,
              }}
              className="absolute top-0 bottom-0 border-t-2 border-b-2 border-blue-500 bg-blue-500/10 z-10 cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => handleTrimStartDrag(e, 'middle')}
              title="Drag to shift trim window"
            >
              {/* Left Trim Handle (In-Point) */}
              <div
                onMouseDown={(e) => handleTrimStartDrag(e, 'start')}
                className="absolute left-0 top-0 bottom-0 w-3 bg-blue-500 hover:bg-blue-400 cursor-ew-resize flex items-center justify-center shadow-lg transition-colors group z-20"
                title={`In-Point: ${trimRange.start.toFixed(2)}s`}
              >
                <div className="w-1 h-4 bg-white/80 rounded-full" />
              </div>

              {/* Right Trim Handle (Out-Point) */}
              <div
                onMouseDown={(e) => handleTrimStartDrag(e, 'end')}
                className="absolute right-0 top-0 bottom-0 w-3 bg-blue-500 hover:bg-blue-400 cursor-ew-resize flex items-center justify-center shadow-lg transition-colors group z-20"
                title={`Out-Point: ${trimRange.end.toFixed(2)}s`}
              >
                <div className="w-1 h-4 bg-white/80 rounded-full" />
              </div>

              {/* Duration badge in center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/70 px-1.5 py-0.5 rounded border border-blue-400/30 shadow-sm">
                  {(trimRange.end - trimRange.start).toFixed(1)}s
                </span>
              </div>
            </div>

            {/* Out-of-trim Dimming: Right */}
            <div
              style={{
                left: `${trimEndPct}%`,
                width: `${Math.max(0, 100 - trimEndPct)}%`,
              }}
              className="absolute top-0 bottom-0 bg-black/60 backdrop-blur-[1px] border-l border-amber-500/40 pointer-events-none z-10"
            />
          </div>

          {/* 3. Subtitles Track */}
          <div className="h-10 border-b border-slate-800/60 relative bg-slate-900/20">
            {subtitles.map((sub) => {
              const startPct = (sub.startTime / effectiveDuration) * 100;
              const widthPct =
                ((sub.endTime - sub.startTime) / effectiveDuration) * 100;
              const isSelected = selectedSubtitleId === sub.id;

              return (
                <div
                  key={sub.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectSubtitle) onSelectSubtitle(sub.id);
                  }}
                  style={{
                    left: `${startPct}%`,
                    width: `${Math.max(2, widthPct)}%`,
                  }}
                  className={`absolute top-1 bottom-1 rounded-md px-1.5 flex items-center text-[10px] font-medium truncate cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-500/50 z-20'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/90 z-10'
                  }`}
                  title={`${sub.text} (${sub.startTime.toFixed(1)}s - ${sub.endTime.toFixed(1)}s)`}
                >
                  <span className="truncate">
                    {sub.language === 'ur' ? 'اردو: ' : ''}
                    {sub.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 4. Text Overlays Track */}
          <div className="h-10 relative bg-slate-900/20">
            {textOverlays.map((item) => {
              const startPct = (item.startTime / effectiveDuration) * 100;
              const widthPct =
                ((item.endTime - item.startTime) / effectiveDuration) * 100;
              const isSelected = selectedOverlayId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectOverlay) onSelectOverlay(item.id);
                  }}
                  style={{
                    left: `${startPct}%`,
                    width: `${Math.max(2, widthPct)}%`,
                  }}
                  className={`absolute top-1 bottom-1 rounded-md px-1.5 flex items-center text-[10px] font-medium truncate cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-200 ring-2 ring-amber-400/50 z-20'
                      : 'bg-amber-950/70 text-amber-300 border-amber-500/40 hover:bg-amber-900/80 z-10'
                  }`}
                  title={`${item.text} (${item.startTime.toFixed(1)}s - ${item.endTime.toFixed(1)}s)`}
                >
                  <Type className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                  <span className="truncate">{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* Vertical Playhead Needle */}
          <div
            style={{ left: `${playheadPct}%` }}
            className="absolute top-0 bottom-0 pointer-events-none z-30 transform -translate-x-1/2 flex flex-col items-center"
          >
            {/* Playhead Head Marker */}
            <div className="w-3.5 h-3.5 bg-rose-500 rotate-45 transform origin-center shadow-lg -mt-1.5 border border-white/60 pointer-events-auto cursor-ew-resize" />
            {/* Playhead Line */}
            <div className="w-[2px] flex-1 bg-rose-500 shadow-sm shadow-rose-500/60" />
          </div>
        </div>
      </div>
    </div>
  );
};
