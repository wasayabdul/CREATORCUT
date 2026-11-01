import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
  Play,
  RotateCcw,
  Cpu,
  Layers,
  FileVideo,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AspectRatio,
  AudioSettings,
  CopyrightSafetyState,
  ExportProgress,
  ExportSettings,
  FitMode,
  Subtitle,
  SubtitleStyle,
  TextOverlay,
  TrimRange,
  VideoMetadata,
} from '../types';
import { exportVideo } from '../utils/exportVideo';
import { formatTime } from '../utils/timeFormat';
import {
  COPYRIGHT_LEGAL_NOTICE,
  downloadCopyrightReport,
  evaluateCopyrightRisk,
} from '../utils/copyrightReport';
import { ShieldCheck, ShieldAlert, Shield, FileText, ExternalLink } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoElement: HTMLVideoElement | null;
  trimRange: TrimRange;
  aspectRatio: AspectRatio;
  fitMode: FitMode;
  subtitles: Subtitle[];
  subtitleStyle: SubtitleStyle;
  textOverlays: TextOverlay[];
  audioSettings: AudioSettings;
  videoFilename?: string;
  safetyState?: CopyrightSafetyState;
  metadata?: VideoMetadata | null;
  onNavigateToCopyright?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  videoElement,
  trimRange,
  aspectRatio,
  fitMode,
  subtitles,
  subtitleStyle,
  textOverlays,
  audioSettings,
  videoFilename = 'creatorcut_clip',
  safetyState,
  metadata,
  onNavigateToCopyright,
}) => {
  const assessment = safetyState ? evaluateCopyrightRisk(safetyState) : null;
  const [settings, setSettings] = useState<ExportSettings>({
    resolution: '720p',
    fps: 30,
    quality: 'high',
    filename: `${videoFilename.replace(/\.[^/.]+$/, '')}_edited.mp4`,
    includeSubtitles: true,
    includeTextOverlays: true,
    engine: 'canvas-muxer',
  });

  const [progress, setProgress] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const isExporting =
    progress.status === 'preparing' ||
    progress.status === 'rendering' ||
    progress.status === 'muxing';

  const handleStartExport = async () => {
    if (!videoElement) return;

    try {
      const outputUrl = await exportVideo({
        videoElement,
        trimRange,
        aspectRatio,
        fitMode,
        subtitles,
        subtitleStyle,
        textOverlays,
        audioSettings,
        exportSettings: settings,
        onProgress: (p) => setProgress(p),
      });

      // Confetti celebratory effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'],
        });
      } catch {
        // Safe fallback
      }
    } catch (err: unknown) {
      console.error('Export error:', err);
      const errMsg = err instanceof Error ? err.message : 'Video export failed';
      setProgress({
        status: 'error',
        progress: 0,
        message: 'Rendering failed',
        error: errMsg,
      });
    }
  };

  const handleDownload = () => {
    if (!progress.outputUrl) return;
    const a = document.createElement('a');
    a.href = progress.outputUrl;
    a.download = settings.filename || 'creatorcut_export.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  const trimmedDuration = Math.max(0, trimRange.end - trimRange.start);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="h-14 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Export Video</h2>
              <p className="text-[11px] text-slate-400">
                Duration: {trimmedDuration.toFixed(1)}s • Aspect: {aspectRatio}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!isExporting) onClose();
            }}
            disabled={isExporting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {progress.status === 'completed' && progress.outputUrl ? (
            /* Completed Screen with Preview */
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Export Ready!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your video has been rendered and encoded successfully.
                </p>
              </div>

              {/* Video Player Preview */}
              <div className="rounded-xl overflow-hidden bg-black border border-slate-800 max-h-56 flex items-center justify-center">
                <video
                  src={progress.outputUrl}
                  controls
                  autoPlay
                  className="max-h-52 w-auto object-contain"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() =>
                    setProgress({ status: 'idle', progress: 0, message: '' })
                  }
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Edit Again
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4</span>
                </button>
              </div>
            </div>
          ) : isExporting ? (
            /* Progress Screen */
            <div className="space-y-5 py-6 text-center">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
                <span className="font-mono text-sm font-bold text-white">
                  {progress.progress}%
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">
                  {progress.status === 'preparing'
                    ? 'Preparing Engine...'
                    : progress.status === 'rendering'
                    ? 'Rendering Video Frames...'
                    : 'Encoding & Muxing MP4...'}
                </h4>
                <p className="text-xs text-slate-400 font-mono">{progress.message}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Please keep this tab open while your video is processed locally.
              </p>
            </div>
          ) : (
            /* Configuration Settings Form */
            <div className="space-y-4">
              {/* Error Banner if any */}
              {progress.status === 'error' && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Export Error</span>
                    <span>{progress.error || 'Failed to export video'}</span>
                  </div>
                </div>
              )}

              {/* File Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Output Filename
                </label>
                <input
                  type="text"
                  value={settings.filename}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, filename: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Resolution & FPS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Resolution
                  </label>
                  <select
                    value={settings.resolution}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        resolution: e.target.value as ExportSettings['resolution'],
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="1080p">1080p (Full HD)</option>
                    <option value="720p">720p (Fast HD)</option>
                    <option value="480p">480p (Draft)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Frame Rate
                  </label>
                  <select
                    value={settings.fps}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        fps: parseInt(e.target.value) as 30 | 60,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={30}>30 FPS (Standard)</option>
                    <option value={60}>60 FPS (Smooth)</option>
                  </select>
                </div>
              </div>

              {/* Engine Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Export Engine</span>
                  <span className="text-[10px] text-blue-400 font-mono">
                    100% In-Browser
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() =>
                      setSettings((s) => ({ ...s, engine: 'canvas-muxer' }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      settings.engine === 'canvas-muxer'
                        ? 'bg-blue-600/15 border-blue-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">
                      ⚡ High-Speed Engine
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Reliable, instant audio sync & direct MP4 output
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setSettings((s) => ({ ...s, engine: 'ffmpeg-wasm' }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      settings.engine === 'ffmpeg-wasm'
                        ? 'bg-blue-600/15 border-blue-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">
                      🎞️ FFmpeg.wasm
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Advanced WebAssembly video pipeline
                    </div>
                  </button>
                </div>
              </div>

              {/* Inclusions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Burn-in Subtitles ({subtitles.length} cues)</span>
                  <input
                    type="checkbox"
                    checked={settings.includeSubtitles}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        includeSubtitles: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Burn-in Text Overlays ({textOverlays.length} layers)</span>
                  <input
                    type="checkbox"
                    checked={settings.includeTextOverlays}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        includeTextOverlays: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Copyright Safety Pre-Flight Assessment */}
              {assessment && safetyState && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {assessment.level === 'low' ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                      )}
                      Copyright Safety Pre-Flight
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${assessment.badgeClass}`}>
                      {assessment.badgeText}
                    </span>
                  </div>

                  {/* Checklist & Missing permissions card */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Completed Checks:</span>
                      <span className="font-mono text-white font-semibold">
                        {assessment.verifiedCount} of {safetyState.checklist.length} Verified
                      </span>
                    </div>

                    {assessment.warnings.length > 0 ? (
                      <div className="space-y-1 pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] font-semibold text-rose-400 block uppercase tracking-wider">
                          Potential Risks & Missing Permissions:
                        </span>
                        {assessment.warnings.slice(0, 2).map((w, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-300 pt-1 border-t border-slate-800/80">
                        ✓ All declarations and asset rights are documented.
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                      {onNavigateToCopyright && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToCopyright();
                          }}
                          className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          <span>Review in Safety Center</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => downloadCopyrightReport(safetyState, metadata || null)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 ml-auto"
                        title="Download Copyright Checklist Report"
                      >
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>Download Report (.txt)</span>
                      </button>
                    </div>
                  </div>

                  {/* Mandatory Copyright Disclaimer */}
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 text-[10px] text-slate-400 leading-relaxed font-sans">
                    <strong className="text-amber-400 block mb-0.5">CreatorCut Copyright Notice:</strong>
                    CreatorCut helps users identify potential copyright risks and organize licensing information. It does not provide legal advice and cannot guarantee that any video is free from copyright claims, Content ID matches, takedowns or strikes. Users are responsible for ensuring that they own or have obtained the necessary rights and permissions for all content they publish.
                  </div>
                </div>
              )}

              {/* Start Export Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartExport}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Render & Export MP4</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
