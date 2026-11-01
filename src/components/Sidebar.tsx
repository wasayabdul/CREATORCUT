import React from 'react';
import {
  Scissors,
  Maximize2,
  MessageSquareText,
  Type,
  Volume2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ActiveTab,
  AspectRatio,
  AudioSettings,
  CopyrightSafetyState,
  FitMode,
  Subtitle,
  SubtitleStyle,
  TextOverlay,
  TrimRange,
  VideoMetadata,
} from '../types';
import { TrimmingPanel } from './panels/TrimmingPanel';
import { AspectRatioPanel } from './panels/AspectRatioPanel';
import { SubtitlesPanel } from './panels/SubtitlesPanel';
import { TextOverlayPanel } from './panels/TextOverlayPanel';
import { AudioPanel } from './panels/AudioPanel';
import { CopyrightSafetyPanel } from './panels/CopyrightSafetyPanel';
import { evaluateCopyrightRisk } from '../utils/copyrightReport';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  // Trimming props
  duration: number;
  currentTime: number;
  trimRange: TrimRange;
  onUpdateTrim: (trim: TrimRange) => void;
  onSetInPoint: () => void;
  onSetOutPoint: () => void;
  onResetTrim: () => void;
  onSeek: (time: number) => void;
  // Aspect ratio props
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  fitMode: FitMode;
  setFitMode: (mode: FitMode) => void;
  // Subtitles props
  subtitles: Subtitle[];
  setSubtitles: React.Dispatch<React.SetStateAction<Subtitle[]>>;
  subtitleStyle: SubtitleStyle;
  setSubtitleStyle: React.Dispatch<React.SetStateAction<SubtitleStyle>>;
  selectedSubtitleId: string | null;
  setSelectedSubtitleId: (id: string | null) => void;
  videoFilename?: string;
  // Text Overlay props
  textOverlays: TextOverlay[];
  setTextOverlays: React.Dispatch<React.SetStateAction<TextOverlay[]>>;
  selectedOverlayId: string | null;
  setSelectedOverlayId: (id: string | null) => void;
  // Audio props
  audioSettings: AudioSettings;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettings>>;
  // Copyright Safety props
  safetyState: CopyrightSafetyState;
  setSafetyState: React.Dispatch<React.SetStateAction<CopyrightSafetyState>>;
  metadata: VideoMetadata | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  duration,
  currentTime,
  trimRange,
  onUpdateTrim,
  onSetInPoint,
  onSetOutPoint,
  onResetTrim,
  onSeek,
  aspectRatio,
  setAspectRatio,
  fitMode,
  setFitMode,
  subtitles,
  setSubtitles,
  subtitleStyle,
  setSubtitleStyle,
  selectedSubtitleId,
  setSelectedSubtitleId,
  videoFilename,
  textOverlays,
  setTextOverlays,
  selectedOverlayId,
  setSelectedOverlayId,
  audioSettings,
  setAudioSettings,
  safetyState,
  setSafetyState,
  metadata,
}) => {
  const assessment = evaluateCopyrightRisk(safetyState);

  const tabs: {
    id: ActiveTab;
    label: string;
    icon: typeof Scissors;
    badge?: number;
    badgeDot?: string;
  }[] = [
    { id: 'trim', label: 'Trim & Cut', icon: Scissors },
    { id: 'ratio', label: 'Aspect Ratio', icon: Maximize2 },
    {
      id: 'subtitles',
      label: 'Subtitles',
      icon: MessageSquareText,
      badge: subtitles.length > 0 ? subtitles.length : undefined,
    },
    {
      id: 'text',
      label: 'Text Overlays',
      icon: Type,
      badge: textOverlays.length > 0 ? textOverlays.length : undefined,
    },
    { id: 'audio', label: 'Audio & Volume', icon: Volume2 },
    {
      id: 'copyright',
      label: 'Copyright Safety',
      icon: assessment.level === 'low' ? ShieldCheck : ShieldAlert,
      badgeDot:
        assessment.level === 'low'
          ? 'bg-emerald-400'
          : assessment.level === 'moderate'
          ? 'bg-amber-400'
          : 'bg-rose-500',
    },
  ];

  return (
    <aside
      className={`h-full border-r border-slate-800 bg-slate-950 flex transition-all duration-200 z-20 ${
        isCollapsed ? 'w-14' : 'w-80 sm:w-96'
      }`}
    >
      {/* Icon Navigation Column */}
      <div className="w-14 flex-shrink-0 border-r border-slate-800/80 bg-slate-950 flex flex-col items-center py-3 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !isCollapsed;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={tab.label}
            >
              <Icon className="w-4 h-4" />
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center shadow">
                  {tab.badge}
                </span>
              )}
              {tab.badgeDot && (
                <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${tab.badgeDot} ring-2 ring-slate-950`} />
              )}
            </button>
          );
        })}

        {/* Collapse / Expand Toggle at Bottom */}
        <div className="mt-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Tab Content */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header of Active Tab */}
          <div className="h-12 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/40">
            <span className="font-heading font-semibold text-xs tracking-wide uppercase text-slate-200">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'trim' && (
              <TrimmingPanel
                duration={duration}
                currentTime={currentTime}
                trimRange={trimRange}
                onUpdateTrim={onUpdateTrim}
                onSetInPoint={onSetInPoint}
                onSetOutPoint={onSetOutPoint}
                onResetTrim={onResetTrim}
                onSeek={onSeek}
              />
            )}

            {activeTab === 'ratio' && (
              <AspectRatioPanel
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                fitMode={fitMode}
                setFitMode={setFitMode}
              />
            )}

            {activeTab === 'subtitles' && (
              <SubtitlesPanel
                subtitles={subtitles}
                setSubtitles={setSubtitles}
                subtitleStyle={subtitleStyle}
                setSubtitleStyle={setSubtitleStyle}
                currentTime={currentTime}
                duration={duration}
                onSeek={onSeek}
                selectedSubtitleId={selectedSubtitleId}
                setSelectedSubtitleId={setSelectedSubtitleId}
                videoFilename={videoFilename}
              />
            )}

            {activeTab === 'text' && (
              <TextOverlayPanel
                textOverlays={textOverlays}
                setTextOverlays={setTextOverlays}
                selectedOverlayId={selectedOverlayId}
                setSelectedOverlayId={setSelectedOverlayId}
                currentTime={currentTime}
                duration={duration}
                onSeek={onSeek}
              />
            )}

            {activeTab === 'audio' && (
              <AudioPanel
                audioSettings={audioSettings}
                setAudioSettings={setAudioSettings}
              />
            )}

            {activeTab === 'copyright' && (
              <CopyrightSafetyPanel
                safetyState={safetyState}
                setSafetyState={setSafetyState}
                metadata={metadata}
              />
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
