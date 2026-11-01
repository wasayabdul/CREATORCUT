import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from './types';
import { useVideoPlayer } from './hooks/useVideoPlayer';
import { Header } from './components/Header';
import { VideoCanvas } from './components/VideoCanvas';
import { PlaybackControls } from './components/PlaybackControls';
import { Timeline } from './components/Timeline';
import { Sidebar } from './components/Sidebar';
import { EmptyState } from './components/EmptyState';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { downloadSRTFile } from './utils/srtParser';
import { INITIAL_CHECKLIST } from './utils/copyrightReport';

export default function App() {
  // Video Metadata & File
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [fitMode, setFitMode] = useState<FitMode>('contain');

  // Trimming State
  const [trimRange, setTrimRange] = useState<TrimRange>({ start: 0, end: 10 });

  // Subtitles State
  const [subtitles, setSubtitles] = useState<Subtitle[]>([
    {
      id: 'sub_init_1',
      startTime: 0.5,
      endTime: 3.5,
      text: 'خوش آمدید! Welcome to CreatorCut',
      language: 'ur',
    },
    {
      id: 'sub_init_2',
      startTime: 3.8,
      endTime: 7.0,
      text: 'Trim videos & style Urdu Nastaliq subtitles',
      language: 'en',
    },
  ]);

  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontFamily: 'Noto Nastaliq Urdu',
    fontSize: 34,
    textColor: '#ffffff',
    bgColor: 'rgba(0, 0, 0, 0.75)',
    hasBackground: true,
    position: 'bottom',
    yOffset: 88,
    hasOutline: true,
    outlineColor: '#000000',
    hasShadow: true,
    align: 'center',
  });

  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(null);

  // Text Overlays State
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([
    {
      id: 'txt_welcome',
      text: 'CreatorCut Studio',
      startTime: 0,
      endTime: 4.5,
      x: 50,
      y: 18,
      fontSize: 28,
      color: '#ffffff',
      bgColor: 'rgba(37, 99, 235, 0.9)',
      hasBackground: true,
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: 'bold',
      isRTL: false,
      hasShadow: true,
    },
  ]);

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // Audio Settings
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    volume: 1.0,
    isMuted: false,
    fadeIn: false,
    fadeOut: false,
  });

  // Copyright Safety State
  const [copyrightSafetyState, setCopyrightSafetyState] = useState<CopyrightSafetyState>({
    videoDeclaration: {
      trackType: 'video',
      name: 'Main Video Track',
      sourceType: 'original',
      creatorName: 'Self / Project Creator',
      sourceUrl: '',
      licenseProof: '',
      commercialUsePermitted: true,
      attributionRequired: false,
      attributionText: '',
    },
    audioDeclaration: {
      trackType: 'audio',
      name: 'Embedded Audio',
      sourceType: 'original',
      creatorName: 'Original Soundtrack',
      sourceUrl: '',
      licenseProof: '',
      commercialUsePermitted: true,
      attributionRequired: false,
      attributionText: '',
    },
    fontDeclaration: {
      fontName: 'Inter / Noto Nastaliq Urdu',
      isCommercialSafe: true,
      license: 'SIL Open Font License 1.1',
    },
    checklist: INITIAL_CHECKLIST,
    activeSafeMusic: null,
  });

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('trim');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Video Controller Hook
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLooping,
    setIsLooping,
    isLoading,
    setIsLoading,
    togglePlay,
    pause,
    play,
    seekTo,
    stepFrame,
    setInPointAtPlayhead,
    setOutPointAtPlayhead,
    resetTrim,
  } = useVideoPlayer(trimRange, setTrimRange, audioSettings);

  // When a video is selected or loaded
  const handleVideoLoaded = (meta: VideoMetadata) => {
    setMetadata(meta);
    setTrimRange({
      start: 0,
      end: meta.duration || 10,
    });
    setCopyrightSafetyState((prev) => ({
      ...prev,
      videoDeclaration: {
        ...prev.videoDeclaration,
        name: meta.name,
      },
      audioDeclaration: {
        ...prev.audioDeclaration,
        name: prev.activeSafeMusic ? prev.activeSafeMusic.title : `${meta.name} (Audio)`,
      },
    }));
    // Set appropriate initial aspect ratio
    if (meta.aspectRatio > 1.2) {
      setAspectRatio('16:9');
    } else if (meta.aspectRatio < 0.8) {
      setAspectRatio('9:16');
    } else {
      setAspectRatio('1:1');
    }
  };

  // Split / Cut clip at current playhead position
  const handleSplitAtPlayhead = () => {
    if (currentTime <= trimRange.start || currentTime >= trimRange.end) return;
    // Set out point to current playhead as cut
    setTrimRange((prev) => ({
      start: prev.start,
      end: currentTime,
    }));
  };

  // Update text overlay position directly from canvas drag
  const handleUpdateOverlayPosition = (id: string, x: number, y: number) => {
    setTextOverlays((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === '[') {
        e.preventDefault();
        setInPointAtPlayhead();
      } else if (e.key === ']') {
        e.preventDefault();
        setOutPointAtPlayhead();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(e.shiftKey ? -30 : -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepFrame(e.shiftKey ? 30 : 1);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setAudioSettings((prev) => ({ ...prev, isMuted: !prev.isMuted }));
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsLooping((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSplitAtPlayhead();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsExportModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsExportModalOpen(false);
        setIsShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    setInPointAtPlayhead,
    setOutPointAtPlayhead,
    stepFrame,
    setIsLooping,
    handleSplitAtPlayhead,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* Hidden Video Source Element */}
      {metadata && (
        <video
          ref={videoRef}
          src={metadata.url}
          crossOrigin="anonymous"
          playsInline
          preload="auto"
          className="hidden"
        />
      )}

      {/* Global Header */}
      <Header
        metadata={metadata}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenUpload={() => setMetadata(null)}
        onDownloadSRT={() =>
          downloadSRTFile(subtitles, metadata?.name || 'creatorcut')
        }
        subtitlesCount={subtitles.length}
        safetyState={copyrightSafetyState}
        onOpenCopyrightSafety={() => {
          setActiveTab('copyright');
          setIsSidebarCollapsed(false);
        }}
      />

      {/* Main Workspace Area */}
      {!metadata ? (
        <EmptyState
          onVideoLoaded={handleVideoLoaded}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Middle Stage: Sidebar + Video Canvas */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left Tooling Sidebar */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              duration={duration}
              currentTime={currentTime}
              trimRange={trimRange}
              onUpdateTrim={setTrimRange}
              onSetInPoint={setInPointAtPlayhead}
              onSetOutPoint={setOutPointAtPlayhead}
              onResetTrim={resetTrim}
              onSeek={seekTo}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              fitMode={fitMode}
              setFitMode={setFitMode}
              subtitles={subtitles}
              setSubtitles={setSubtitles}
              subtitleStyle={subtitleStyle}
              setSubtitleStyle={setSubtitleStyle}
              selectedSubtitleId={selectedSubtitleId}
              setSelectedSubtitleId={setSelectedSubtitleId}
              videoFilename={metadata?.name}
              textOverlays={textOverlays}
              setTextOverlays={setTextOverlays}
              selectedOverlayId={selectedOverlayId}
              setSelectedOverlayId={setSelectedOverlayId}
              audioSettings={audioSettings}
              setAudioSettings={setAudioSettings}
              safetyState={copyrightSafetyState}
              setSafetyState={setCopyrightSafetyState}
              metadata={metadata}
            />

            {/* Center Canvas Preview Stage */}
            <VideoCanvas
              videoRef={videoRef}
              aspectRatio={aspectRatio}
              fitMode={fitMode}
              subtitles={subtitles}
              subtitleStyle={subtitleStyle}
              textOverlays={textOverlays}
              selectedOverlayId={selectedOverlayId}
              onSelectOverlay={setSelectedOverlayId}
              onUpdateOverlayPosition={handleUpdateOverlayPosition}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              currentTime={currentTime}
            />
          </div>

          {/* Transport Controls Bar */}
          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            currentTime={currentTime}
            duration={duration}
            trimRange={trimRange}
            isLooping={isLooping}
            onToggleLoop={() => setIsLooping(!isLooping)}
            onStepFrame={stepFrame}
            onSetInPoint={setInPointAtPlayhead}
            onSetOutPoint={setOutPointAtPlayhead}
            onResetTrim={resetTrim}
            onSplitAtPlayhead={handleSplitAtPlayhead}
            audioSettings={audioSettings}
            onUpdateAudio={(u) => setAudioSettings((prev) => ({ ...prev, ...u }))}
          />

          {/* Bottom Multi-Track Timeline */}
          <Timeline
            duration={duration}
            currentTime={currentTime}
            trimRange={trimRange}
            subtitles={subtitles}
            textOverlays={textOverlays}
            onSeek={seekTo}
            onUpdateTrim={setTrimRange}
            onSelectSubtitle={(id) => {
              setSelectedSubtitleId(id);
              setActiveTab('subtitles');
              setIsSidebarCollapsed(false);
            }}
            onSelectOverlay={(id) => {
              setSelectedOverlayId(id);
              setActiveTab('text');
              setIsSidebarCollapsed(false);
            }}
            selectedSubtitleId={selectedSubtitleId}
            selectedOverlayId={selectedOverlayId}
          />
        </div>
      )}

      {/* Export MP4 Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        videoElement={videoRef.current}
        trimRange={trimRange}
        aspectRatio={aspectRatio}
        fitMode={fitMode}
        subtitles={subtitles}
        subtitleStyle={subtitleStyle}
        textOverlays={textOverlays}
        audioSettings={audioSettings}
        videoFilename={metadata?.name}
        safetyState={copyrightSafetyState}
        metadata={metadata}
        onNavigateToCopyright={() => {
          setActiveTab('copyright');
          setIsSidebarCollapsed(false);
        }}
      />

      {/* Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
