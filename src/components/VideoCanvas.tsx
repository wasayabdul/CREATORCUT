import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AspectRatio,
  AudioSettings,
  FitMode,
  Subtitle,
  SubtitleStyle,
  TextOverlay,
} from '../types';
import {
  drawSubtitles,
  drawTextOverlays,
  drawVideoFrameOnCanvas,
  getOutputDimensions,
} from '../utils/exportVideo';
import { Play, Pause, Maximize, Move } from 'lucide-react';

interface VideoCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  aspectRatio: AspectRatio;
  fitMode: FitMode;
  subtitles: Subtitle[];
  subtitleStyle: SubtitleStyle;
  textOverlays: TextOverlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string | null) => void;
  onUpdateOverlayPosition: (id: string, x: number, y: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
}

export const VideoCanvas: React.FC<VideoCanvasProps> = ({
  videoRef,
  aspectRatio,
  fitMode,
  subtitles,
  subtitleStyle,
  textOverlays,
  selectedOverlayId,
  onSelectOverlay,
  onUpdateOverlayPosition,
  isPlaying,
  onTogglePlay,
  currentTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingOverlayId, setDraggingOverlayId] = useState<string | null>(null);

  // Setup canvas size based on aspect ratio
  const { width: targetWidth, height: targetHeight } = getOutputDimensions(
    aspectRatio,
    '720p'
  );

  // Continuous render loop when playing or seeking
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      // 1. Draw video background & frame
      if (video.readyState >= 2) {
        drawVideoFrameOnCanvas({
          ctx,
          video,
          canvasWidth: targetWidth,
          canvasHeight: targetHeight,
          fitMode,
        });
      } else {
        // Placeholder dark background
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // 2. Draw Text Overlays
      drawTextOverlays({
        ctx,
        textOverlays,
        currentTime: video.currentTime || currentTime,
        canvasWidth: targetWidth,
        canvasHeight: targetHeight,
      });

      // 3. Highlight selected text overlay with a sleek bounding box
      if (selectedOverlayId) {
        const activeItem = textOverlays.find(
          (o) =>
            o.id === selectedOverlayId &&
            currentTime >= o.startTime &&
            currentTime <= o.endTime
        );
        if (activeItem) {
          const x = (activeItem.x / 100) * targetWidth;
          const y = (activeItem.y / 100) * targetHeight;
          const scale = targetWidth / 1280;
          const fontSize = Math.max(16, Math.round(activeItem.fontSize * scale));

          ctx.save();
          ctx.font = `${activeItem.fontWeight || 'normal'} ${fontSize}px "${activeItem.fontFamily}"`;
          const metrics = ctx.measureText(activeItem.text);
          const boxW = metrics.width + 24 * scale;
          const boxH = fontSize * 1.6;

          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2 * scale;
          ctx.setLineDash([6 * scale, 4 * scale]);
          ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
          ctx.restore();
        }
      }

      // 4. Draw Subtitles
      drawSubtitles({
        ctx,
        subtitles,
        subtitleStyle,
        currentTime: video.currentTime || currentTime,
        canvasWidth: targetWidth,
        canvasHeight: targetHeight,
      });

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    isPlaying,
    currentTime,
    aspectRatio,
    fitMode,
    subtitles,
    subtitleStyle,
    textOverlays,
    selectedOverlayId,
    targetWidth,
    targetHeight,
    videoRef,
  ]);

  // Handle direct on-canvas mouse drag to reposition active text overlays
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicked near an overlay
    const hitOverlay = textOverlays.find((item) => {
      const isVisible = currentTime >= item.startTime && currentTime <= item.endTime;
      if (!isVisible) return false;
      const distX = Math.abs(item.x - clickX);
      const distY = Math.abs(item.y - clickY);
      return distX < 15 && distY < 10;
    });

    if (hitOverlay) {
      onSelectOverlay(hitOverlay.id);
      setIsDragging(true);
      setDraggingOverlayId(hitOverlay.id);
    } else {
      onSelectOverlay(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggingOverlayId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const newY = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    onUpdateOverlayPosition(draggingOverlayId, Math.round(newX), Math.round(newY));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggingOverlayId(null);
  };

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  // Compute container aspect ratio class
  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-video'
      : aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : 'aspect-square';

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full flex items-center justify-center bg-[#07090e] p-3 sm:p-6 overflow-hidden select-none"
    >
      {/* Background Studio Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Canvas Frame Box */}
      <div
        className={`relative ${aspectClass} max-h-full max-w-full rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-800/80 group flex items-center justify-center bg-black`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className="w-full h-full object-contain cursor-pointer"
          onClick={() => {
            if (!isDragging) onTogglePlay();
          }}
        />

        {/* Center Play Overlay Icon when paused */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all opacity-85 group-hover:opacity-100"
            title="Play (Space)"
          >
            <Play className="w-7 h-7 ml-1 fill-white" />
          </button>
        )}

        {/* Top-Right Canvas Overlay Info */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-slate-700/50">
            {aspectRatio} • {fitMode}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-1 rounded bg-black/60 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/50 pointer-events-auto"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drag Hint for Selected Overlay */}
        {selectedOverlayId && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-[11px] font-medium text-white shadow-md pointer-events-none">
            <Move className="w-3 h-3 animate-pulse" />
            <span>Drag text overlay to reposition</span>
          </div>
        )}
      </div>
    </div>
  );
};
