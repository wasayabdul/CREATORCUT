import {
  Film,
  Download,
  FileText,
  Keyboard,
  Upload,
  Maximize2,
  Sliders,
  Sparkles,
  Smartphone,
  Square,
  Monitor,
  ShieldCheck,
  ShieldAlert,
  Shield,
} from 'lucide-react';
import { AspectRatio, CopyrightSafetyState, Subtitle, VideoMetadata } from '../types';
import { evaluateCopyrightRisk } from '../utils/copyrightReport';

interface HeaderProps {
  metadata: VideoMetadata | null;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  onOpenUpload: () => void;
  onDownloadSRT: () => void;
  subtitlesCount: number;
  safetyState?: CopyrightSafetyState;
  onOpenCopyrightSafety?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  aspectRatio,
  setAspectRatio,
  onOpenExport,
  onOpenShortcuts,
  onOpenUpload,
  onDownloadSRT,
  subtitlesCount,
  safetyState,
  onOpenCopyrightSafety,
}) => {
  const assessment = safetyState ? evaluateCopyrightRisk(safetyState) : null;
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Branding & Clip Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                CreatorCut
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            {metadata && (
              <span className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                {metadata.name}
              </span>
            )}
          </div>
        </div>

        {/* Action: Change Clip */}
        {metadata && (
          <button
            onClick={onOpenUpload}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-colors"
            title="Import different video"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Switch Clip</span>
          </button>
        )}
      </div>

      {/* Center: Aspect Ratio Selector */}
      {metadata && (
        <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg shadow-inner">
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              aspectRatio === '16:9'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="16:9 Landscape (YouTube / TV)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">16:9</span>
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              aspectRatio === '9:16'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="9:16 Vertical (TikTok / Reels / Shorts)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">9:16</span>
          </button>
          <button
            onClick={() => setAspectRatio('1:1')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              aspectRatio === '1:1'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="1:1 Square (Instagram / Posts)"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden md:inline">1:1</span>
          </button>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {metadata && (
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}

        {/* Copyright Safety Badge */}
        {metadata && assessment && onOpenCopyrightSafety && (
          <button
            onClick={onOpenCopyrightSafety}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${assessment.badgeClass}`}
            title="Open Copyright Safety Center"
          >
            {assessment.level === 'low' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden xl:inline">Copyright:</span>
            <span>{assessment.level === 'low' ? 'Protected' : 'Review Needed'}</span>
          </button>
        )}

        {/* SRT Download Button */}
        {metadata && subtitlesCount > 0 && (
          <button
            onClick={onDownloadSRT}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg transition-colors"
            title="Download SRT subtitle file"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export SRT ({subtitlesCount})</span>
          </button>
        )}

        {/* Primary Export MP4 Button */}
        {metadata ? (
          <button
            onClick={onOpenExport}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MP4</span>
          </button>
        ) : (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Open Video</span>
          </button>
        )}
      </div>
    </header>
  );
};
