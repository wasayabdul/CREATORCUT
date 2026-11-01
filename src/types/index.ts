export type AspectRatio = '16:9' | '9:16' | '1:1';
export type FitMode = 'contain' | 'cover';

export interface TrimRange {
  start: number; // in seconds
  end: number;   // in seconds
}

export type SubtitleLanguage = 'en' | 'ur' | 'roman-ur';

export interface Subtitle {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
  language: SubtitleLanguage;
}

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;       // in px (scaled to canvas)
  textColor: string;
  bgColor: string;        // rgba or hex
  hasBackground: boolean;
  position: 'bottom' | 'middle' | 'top';
  yOffset: number;        // percentage from top (0-100)
  hasOutline: boolean;
  outlineColor: string;
  hasShadow: boolean;
  align: 'center' | 'left' | 'right';
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  fontSize: number;
  color: string;
  bgColor: string;
  hasBackground: boolean;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '800';
  isRTL: boolean;
  hasShadow: boolean;
  animation?: 'none' | 'fade' | 'pop';
}

export interface AudioSettings {
  volume: number; // 0 to 2 (0% to 200%)
  isMuted: boolean;
  fadeIn: boolean;
  fadeOut: boolean;
}

export interface VideoMetadata {
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
  url: string;
  file?: File;
}

export type ActiveTab = 'trim' | 'ratio' | 'subtitles' | 'text' | 'audio' | 'copyright' | 'export';

export type MediaSourceClassification =
  | 'original'
  | 'royalty-free'
  | 'creative-commons'
  | 'licensed'
  | 'unknown';

export type CopyrightRiskLevel = 'low' | 'moderate' | 'high';

export type ChecklistStatus = 'verified' | 'pending' | 'missing' | 'na';

export interface CopyrightChecklistItem {
  id: string;
  title: string;
  category: 'music' | 'footage' | 'images' | 'fonts' | 'commercial' | 'attribution';
  description: string;
  status: ChecklistStatus;
  notes?: string;
  requiredForCommercial: boolean;
}

export interface MediaTrackDeclaration {
  trackType: 'video' | 'audio';
  name: string;
  sourceType: MediaSourceClassification;
  creatorName: string;
  sourceUrl: string;
  licenseProof: string; // Certificate ID, invoice, license key, or written permission
  commercialUsePermitted: boolean;
  attributionRequired: boolean;
  attributionText: string;
}

export interface SafeMusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // in seconds
  licenseName: string; // e.g. "CC BY 4.0", "CC0 Public Domain"
  licenseUrl: string;
  sourceUrl: string;
  attributionText: string;
  audioUrl?: string;
  bpm: number;
}

export interface CopyrightSafetyState {
  videoDeclaration: MediaTrackDeclaration;
  audioDeclaration: MediaTrackDeclaration;
  fontDeclaration: {
    fontName: string;
    isCommercialSafe: boolean;
    license: string;
  };
  checklist: CopyrightChecklistItem[];
  activeSafeMusic: SafeMusicTrack | null;
}


export interface ExportSettings {
  resolution: '1080p' | '720p' | '480p';
  fps: 30 | 60;
  quality: 'high' | 'medium';
  filename: string;
  includeSubtitles: boolean;
  includeTextOverlays: boolean;
  engine: 'canvas-muxer' | 'ffmpeg-wasm';
}

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'rendering' | 'muxing' | 'completed' | 'error';
  progress: number; // 0 - 100
  message: string;
  outputUrl?: string;
  error?: string;
}
