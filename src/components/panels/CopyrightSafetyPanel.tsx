import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Music,
  Film,
  FileText,
  Download,
  Copy,
  ExternalLink,
  Play,
  Square,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  FolderLock,
} from 'lucide-react';
import {
  ChecklistStatus,
  CopyrightSafetyState,
  MediaSourceClassification,
  SafeMusicTrack,
  VideoMetadata,
} from '../../types';
import {
  COPYRIGHT_LEGAL_NOTICE,
  downloadCopyrightReport,
  evaluateCopyrightRisk,
} from '../../utils/copyrightReport';
import { SAFE_MUSIC_LIBRARY, safeMusicPlayer } from '../../utils/safeMusicLibrary';

interface CopyrightSafetyPanelProps {
  safetyState: CopyrightSafetyState;
  setSafetyState: React.Dispatch<React.SetStateAction<CopyrightSafetyState>>;
  metadata: VideoMetadata | null;
  onOpenExportModal?: () => void;
}

export const CopyrightSafetyPanel: React.FC<CopyrightSafetyPanelProps> = ({
  safetyState,
  setSafetyState,
  metadata,
  onOpenExportModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'checker' | 'checklist' | 'music' | 'report'>('checker');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [copiedAttribution, setCopiedAttribution] = useState(false);

  const assessment = evaluateCopyrightRisk(safetyState);

  // Play / Pause safe music preview
  const handleTogglePlayMusic = (track: SafeMusicTrack) => {
    if (playingTrackId === track.id) {
      safeMusicPlayer.stop();
      setPlayingTrackId(null);
    } else {
      safeMusicPlayer.playTrack(track, () => {
        setPlayingTrackId(null);
      });
      setPlayingTrackId(track.id);
    }
  };

  // Apply selected safe music track to project audio declaration
  const handleApplySafeMusic = (track: SafeMusicTrack) => {
    setSafetyState((prev) => ({
      ...prev,
      activeSafeMusic: track,
      audioDeclaration: {
        ...prev.audioDeclaration,
        name: track.title,
        sourceType: track.licenseName.includes('Public Domain') ? 'royalty-free' : 'creative-commons',
        creatorName: track.artist,
        sourceUrl: track.sourceUrl,
        licenseProof: track.licenseName,
        commercialUsePermitted: true,
        attributionRequired: !track.licenseName.includes('Public Domain'),
        attributionText: track.attributionText,
      },
      checklist: prev.checklist.map((item) => {
        if (item.category === 'music') {
          return {
            ...item,
            status: 'verified',
            notes: `Verified: ${track.title} (${track.licenseName})`,
          };
        }
        if (item.category === 'attribution') {
          return {
            ...item,
            status: track.licenseName.includes('Public Domain') ? 'na' : 'verified',
            notes: track.licenseName.includes('Public Domain') ? 'Public Domain (No credit required)' : 'Attribution prepared for video description',
          };
        }
        return item;
      }),
    }));
  };

  // Copy attribution helper
  const handleCopyAttribution = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAttribution(true);
    setTimeout(() => setCopiedAttribution(false), 2000);
  };

  // Update Checklist Item Status
  const handleUpdateChecklistStatus = (itemId: string, status: ChecklistStatus) => {
    setSafetyState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    }));
  };

  return (
    <div className="flex flex-col h-full select-none text-slate-200">
      {/* Risk Header Banner */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {assessment.level === 'low' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : assessment.level === 'moderate' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Copyright Safety
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${assessment.badgeClass}`}>
                {assessment.badgeText}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Risk Score: {assessment.score}/100 • {assessment.verifiedCount} of {safetyState.checklist.length} checks verified
            </p>
          </div>
        </div>

        <button
          onClick={() => downloadCopyrightReport(safetyState, metadata)}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          title="Download Safety Report (.txt)"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/70 p-1.5 gap-1 text-[11px] font-medium overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('checker')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
            activeSubTab === 'checker'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Checker</span>
        </button>

        <button
          onClick={() => setActiveSubTab('checklist')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
            activeSubTab === 'checklist'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Checklist ({assessment.verifiedCount}/{safetyState.checklist.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('music')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
            activeSubTab === 'music'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Music className="w-3.5 h-3.5 text-indigo-400" />
          <span>Safe Music</span>
        </button>

        <button
          onClick={() => setActiveSubTab('report')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
            activeSubTab === 'report'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: COPYRIGHT CHECKER */}
        {activeSubTab === 'checker' && (
          <div className="space-y-4">
            {/* Automated Scan Clarification Notice */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Important Principle:</strong> CreatorCut inspects media file structures, metadata, and user license declarations. Automated scans cannot establish true copyright ownership or guarantee copyright-free status.
              </span>
            </div>

            {/* Uploaded File Track Inspector */}
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-blue-400" />
                Uploaded Media Track Inspector
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">FILE NAME:</span>
                  <span className="text-slate-200 truncate block">{metadata?.name || 'No video loaded'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DURATION / RESOLUTION:</span>
                  <span className="text-slate-200">
                    {(metadata?.duration || 0).toFixed(1)}s • {metadata?.width || 1280}x{metadata?.height || 720}
                  </span>
                </div>
              </div>
            </div>

            {/* AUDIO TRACK SOURCE DECLARATION */}
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  1. Audio & Music Source
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  safetyState.audioDeclaration.sourceType === 'unknown'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {safetyState.audioDeclaration.sourceType}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Specify Audio Rights:</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(
                    [
                      { id: 'original', label: 'Original Audio' },
                      { id: 'royalty-free', label: 'Royalty-Free' },
                      { id: 'creative-commons', label: 'Creative Commons' },
                      { id: 'licensed', label: 'Commercial License' },
                      { id: 'unknown', label: 'Unknown / Unverified' },
                    ] as const
                  ).map((src) => (
                    <button
                      key={src.id}
                      onClick={() =>
                        setSafetyState((prev) => ({
                          ...prev,
                          audioDeclaration: {
                            ...prev.audioDeclaration,
                            sourceType: src.id,
                          },
                        }))
                      }
                      className={`py-1.5 px-2 rounded-lg border text-left text-[11px] transition-all ${
                        safetyState.audioDeclaration.sourceType === src.id
                          ? src.id === 'unknown'
                            ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-semibold'
                            : 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* License Details & Proof Inputs */}
              {safetyState.audioDeclaration.sourceType !== 'unknown' && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Artist / Creator Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Self, Kevan Wood, ChillWave Studio"
                      value={safetyState.audioDeclaration.creatorName}
                      onChange={(e) =>
                        setSafetyState((prev) => ({
                          ...prev,
                          audioDeclaration: {
                            ...prev.audioDeclaration,
                            creatorName: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      License Proof / Certificate ID / Invoice
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Envato #98214, Epidemic Sound Sync ID, or CC BY 4.0"
                      value={safetyState.audioDeclaration.licenseProof}
                      onChange={(e) =>
                        setSafetyState((prev) => ({
                          ...prev,
                          audioDeclaration: {
                            ...prev.audioDeclaration,
                            licenseProof: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Media Source / Verification URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={safetyState.audioDeclaration.sourceUrl}
                      onChange={(e) =>
                        setSafetyState((prev) => ({
                          ...prev,
                          audioDeclaration: {
                            ...prev.audioDeclaration,
                            sourceUrl: e.target.value,
                          },
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={safetyState.audioDeclaration.commercialUsePermitted}
                        onChange={(e) =>
                          setSafetyState((prev) => ({
                            ...prev,
                            audioDeclaration: {
                              ...prev.audioDeclaration,
                              commercialUsePermitted: e.target.checked,
                            },
                          }))
                        }
                        className="w-3.5 h-3.5 accent-blue-600 rounded"
                      />
                      <span>Commercial Use Permitted</span>
                    </label>

                    <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={safetyState.audioDeclaration.attributionRequired}
                        onChange={(e) =>
                          setSafetyState((prev) => ({
                            ...prev,
                            audioDeclaration: {
                              ...prev.audioDeclaration,
                              attributionRequired: e.target.checked,
                            },
                          }))
                        }
                        className="w-3.5 h-3.5 accent-blue-600 rounded"
                      />
                      <span>Attribution Required</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* VIDEO FOOTAGE SOURCE DECLARATION */}
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-blue-400" />
                  2. Video Footage Ownership
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  safetyState.videoDeclaration.sourceType === 'unknown'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {safetyState.videoDeclaration.sourceType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {(
                  [
                    { id: 'original', label: '100% Original Footage' },
                    { id: 'licensed', label: 'Licensed Stock' },
                    { id: 'creative-commons', label: 'Creative Commons' },
                    { id: 'unknown', label: 'Unknown / Sourced' },
                  ] as const
                ).map((src) => (
                  <button
                    key={src.id}
                    onClick={() =>
                      setSafetyState((prev) => ({
                        ...prev,
                        videoDeclaration: {
                          ...prev.videoDeclaration,
                          sourceType: src.id,
                        },
                      }))
                    }
                    className={`py-1.5 px-2 rounded-lg border text-left text-[11px] transition-all ${
                      safetyState.videoDeclaration.sourceType === src.id
                        ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RISK & MISSING PERMISSIONS SUMMARY */}
            <div className={`p-3.5 rounded-xl border ${
              assessment.level === 'low'
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : assessment.level === 'moderate'
                ? 'bg-amber-950/20 border-amber-500/30'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {assessment.level === 'low' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  Detected Risks & Missing Permissions
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {assessment.warnings.length} flags
                </span>
              </div>

              {assessment.warnings.length === 0 ? (
                <p className="text-[11px] text-emerald-300">
                  ✓ All basic media declarations and licenses are properly documented.
                </p>
              ) : (
                <ul className="space-y-1.5 text-[11px]">
                  {assessment.warnings.map((warn, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-300">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: COPYRIGHT SAFETY CHECKLIST */}
        {activeSubTab === 'checklist' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Pre-Export Safety Checklist
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {assessment.verifiedCount} / {safetyState.checklist.length} Passed
              </span>
            </div>

            <div className="space-y-2.5">
              {safetyState.checklist.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {item.title}
                        {item.requiredForCommercial && (
                          <span className="text-[9px] font-semibold text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                            Commercial
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 border ${
                        item.status === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : item.status === 'missing'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : item.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Interactive status buttons */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => handleUpdateChecklistStatus(item.id, 'verified')}
                      className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                        item.status === 'verified'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      ✓ Verified
                    </button>
                    <button
                      onClick={() => handleUpdateChecklistStatus(item.id, 'pending')}
                      className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                        item.status === 'pending'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      ⏳ Pending
                    </button>
                    <button
                      onClick={() => handleUpdateChecklistStatus(item.id, 'missing')}
                      className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                        item.status === 'missing'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      ✗ Missing
                    </button>
                    <button
                      onClick={() => handleUpdateChecklistStatus(item.id, 'na')}
                      className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                        item.status === 'na'
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VERIFIED SAFE MUSIC LIBRARY */}
        {activeSubTab === 'music' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Verified Legally Reusable Music
              </span>
              <p className="text-[11px] text-slate-400">
                All tracks below are verified Creative Commons (CC BY 4.0) or Public Domain (CC0). Guaranteed zero Content ID strikes when properly credited.
              </p>
            </div>

            <div className="space-y-3">
              {SAFE_MUSIC_LIBRARY.map((track) => {
                const isPlaying = playingTrackId === track.id;
                const isApplied = safetyState.activeSafeMusic?.id === track.id;

                return (
                  <div
                    key={track.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isApplied
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {track.title}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            {track.genre}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Artist: <span className="text-slate-300">{track.artist}</span> • {track.duration}s
                        </p>
                      </div>

                      {/* Play Preview Button */}
                      <button
                        onClick={() => handleTogglePlayMusic(track)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isPlaying
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title={isPlaying ? 'Stop Preview' : 'Play Preview'}
                      >
                        {isPlaying ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-slate-300" />}
                      </button>
                    </div>

                    {/* License & Source Info */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-slate-300">{track.licenseName}</span>
                        <a
                          href={track.licenseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <a
                        href={track.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-300 flex items-center gap-1 ml-2"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    {/* Action Buttons: Apply & Copy Attribution */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => handleApplySafeMusic(track)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isApplied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isApplied ? 'Applied to Project' : 'Use This Audio Track'}</span>
                      </button>

                      <button
                        onClick={() => handleCopyAttribution(track.attributionText)}
                        className="py-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                        title="Copy Attribution Credit"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedAttribution ? 'Copied!' : 'Credit'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: EXPORT SAFETY REPORT */}
        {activeSubTab === 'report' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Audit Summary
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${assessment.badgeClass}`}>
                  {assessment.badgeText}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">VERIFIED</span>
                  <span className="font-bold text-emerald-400 text-sm">{assessment.verifiedCount}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">PENDING</span>
                  <span className="font-bold text-amber-400 text-sm">{assessment.pendingCount}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">MISSING</span>
                  <span className="font-bold text-rose-400 text-sm">{assessment.missingCount}</span>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Recommended Pre-Export Actions:
                </span>
                {assessment.recommendations.map((rec, i) => (
                  <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-blue-400 font-bold">→</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

              {/* Attribution Box */}
              {safetyState.audioDeclaration.attributionText && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-semibold">Copy Video Description Credit:</span>
                    <button
                      onClick={() => handleCopyAttribution(safetyState.audioDeclaration.attributionText)}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedAttribution ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 break-words">
                    {safetyState.audioDeclaration.attributionText}
                  </div>
                </div>
              )}

              {/* Download Report Button */}
              <button
                onClick={() => downloadCopyrightReport(safetyState, metadata)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Safety Checklist Report (.txt)</span>
              </button>
            </div>
          </div>
        )}

        {/* PROMINENT MANDATORY DISCLAIMER BOX */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>Legal Notice</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            {COPYRIGHT_LEGAL_NOTICE}
          </p>
        </div>
      </div>
    </div>
  );
};
