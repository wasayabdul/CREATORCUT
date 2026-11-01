import React, { useRef, useState } from 'react';
import {
  Upload,
  Film,
  Sparkles,
  Play,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { VideoMetadata } from '../types';
import { SAMPLE_CLIPS, generateSyntheticTestClip } from '../utils/sampleClips';
import { formatBytes } from '../utils/timeFormat';

interface EmptyStateProps {
  onVideoLoaded: (metadata: VideoMetadata) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onVideoLoaded,
  isLoading,
  setIsLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse video file metadata
  const processFile = (file: File) => {
    setErrorMsg(null);
    setIsLoading(true);

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid video file (.mp4, .webm, .mov, etc.)');
      setIsLoading(false);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;

    tempVideo.onloadedmetadata = () => {
      onVideoLoaded({
        name: file.name,
        size: file.size,
        duration: tempVideo.duration,
        width: tempVideo.videoWidth,
        height: tempVideo.videoHeight,
        aspectRatio: tempVideo.videoWidth / tempVideo.videoHeight,
        url: objectUrl,
        file,
      });
      setIsLoading(false);
    };

    tempVideo.onerror = () => {
      setErrorMsg('Failed to decode video metadata. Please try another video.');
      setIsLoading(false);
    };
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Load preset sample clip
  const handleLoadSample = (sampleUrl: string, title: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    const tempVideo = document.createElement('video');
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.src = sampleUrl;

    tempVideo.onloadedmetadata = () => {
      onVideoLoaded({
        name: title,
        size: 8_500_000,
        duration: tempVideo.duration || 15,
        width: tempVideo.videoWidth || 1280,
        height: tempVideo.videoHeight || 720,
        aspectRatio: (tempVideo.videoWidth || 1280) / (tempVideo.videoHeight || 720),
        url: sampleUrl,
      });
      setIsLoading(false);
    };

    tempVideo.onerror = async () => {
      // If external CDN blocked in some network, fallback instantly to synthetic generator!
      try {
        const synthetic = await generateSyntheticTestClip(10, '16:9');
        onVideoLoaded({
          name: `${title} (Studio Render)`,
          size: synthetic.file.size,
          duration: synthetic.duration,
          width: synthetic.width,
          height: synthetic.height,
          aspectRatio: synthetic.width / synthetic.height,
          url: synthetic.url,
          file: synthetic.file,
        });
      } catch {
        setErrorMsg('Could not load sample video. Please upload a local file.');
      }
      setIsLoading(false);
    };
  };

  // Generate synthetic test clip right now in memory
  const handleGenerateSynthetic = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const synthetic = await generateSyntheticTestClip(10, '16:9');
      onVideoLoaded({
        name: 'Studio Test Clip (1080p).mp4',
        size: synthetic.file.size,
        duration: synthetic.duration,
        width: synthetic.width,
        height: synthetic.height,
        aspectRatio: synthetic.width / synthetic.height,
        url: synthetic.url,
        file: synthetic.file,
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to generate test clip.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#07090e] select-none relative overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute top-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        {/* Hero Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen In-Browser Video Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cut, Subtitle & Export in{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Seconds
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            100% client-side video editing. Trim videos, switch aspect ratios (16:9,
            9:16, 1:1), add Urdu Nastaliq & English subtitles, and export true MP4 files.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/25 mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-white mb-1">
            Choose a video or drag & drop here
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Supports MP4, MOV, WebM, MKV • Processed locally in your browser
          </p>

          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all inline-flex items-center gap-2"
          >
            <FileVideo className="w-4 h-4" />
            <span>Select Video File</span>
          </button>
        </div>

        {/* Sample Clips Row */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              Or Try A Sample Project
            </span>
            <button
              onClick={handleGenerateSynthetic}
              disabled={isLoading}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Studio Test Video</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_CLIPS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleLoadSample(sample.url, sample.title)}
                disabled={isLoading}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-left transition-all group flex flex-col justify-between h-24"
              >
                <div>
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                    {sample.tag}
                  </span>
                  <h4 className="text-xs font-semibold text-white mt-1.5 truncate group-hover:text-blue-400 transition-colors">
                    {sample.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{sample.duration}s clip</span>
                  <Play className="w-3 h-3 fill-slate-500 group-hover:fill-blue-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-400">
          <div className="p-2">
            <span className="font-semibold text-slate-200 block">⚡ Real-Time Trim</span>
            Dual-handle timeline scrub
          </div>
          <div className="p-2">
            <span className="font-semibold text-slate-200 block">📐 Multi-Aspect</span>
            16:9, 9:16 Shorts, 1:1 Square
          </div>
          <div className="p-2">
            <span className="font-semibold text-slate-200 block">🌐 Urdu & English</span>
            Nastaliq script & SRT export
          </div>
          <div className="p-2">
            <span className="font-semibold text-slate-200 block">🎬 Local MP4 Export</span>
            Zero upload to servers
          </div>
        </div>
      </div>
    </div>
  );
};
