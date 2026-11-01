import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioSettings, TrimRange, VideoMetadata } from '../types';

export function useVideoPlayer(
  trimRange: TrimRange,
  setTrimRange: React.Dispatch<React.SetStateAction<TrimRange>>,
  audioSettings: AudioSettings
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync video audio properties
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = Math.max(0, Math.min(1, audioSettings.volume));
    videoRef.current.muted = audioSettings.isMuted;
  }, [audioSettings.volume, audioSettings.isMuted]);

  // Handle Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      // If current time is outside trim range, jump to trim start
      if (
        videoRef.current.currentTime < trimRange.start ||
        videoRef.current.currentTime >= trimRange.end
      ) {
        videoRef.current.currentTime = trimRange.start;
      }
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Play error:', err);
          setIsPlaying(false);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [trimRange.start, trimRange.end]);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const play = useCallback(() => {
    if (videoRef.current) {
      if (
        videoRef.current.currentTime < trimRange.start ||
        videoRef.current.currentTime >= trimRange.end
      ) {
        videoRef.current.currentTime = trimRange.start;
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [trimRange.start, trimRange.end]);

  // Seek to explicit timestamp
  const seekTo = useCallback(
    (time: number) => {
      if (!videoRef.current) return;
      const clamped = Math.max(0, Math.min(duration || 100, time));
      videoRef.current.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [duration]
  );

  // Step single or multiple frames (default 1 frame = 1/30s = ~0.033s)
  const stepFrame = useCallback(
    (frames = 1) => {
      if (!videoRef.current) return;
      videoRef.current.pause();
      setIsPlaying(false);
      const frameDelta = frames * (1 / 30);
      seekTo(videoRef.current.currentTime + frameDelta);
    },
    [seekTo]
  );

  // Set In-point at current playhead
  const setInPointAtPlayhead = useCallback(() => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setTrimRange((prev) => ({
      start: Math.max(0, Math.min(cur, prev.end - 0.2)),
      end: prev.end,
    }));
  }, [setTrimRange]);

  // Set Out-point at current playhead
  const setOutPointAtPlayhead = useCallback(() => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setTrimRange((prev) => ({
      start: prev.start,
      end: Math.min(duration, Math.max(cur, prev.start + 0.2)),
    }));
  }, [duration, setTrimRange]);

  // Reset trim to full video duration
  const resetTrim = useCallback(() => {
    setTrimRange({
      start: 0,
      end: duration,
    });
  }, [duration, setTrimRange]);

  // Video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const cur = video.currentTime;
      setCurrentTime(cur);

      // Check trim bounds
      if (cur >= trimRange.end) {
        if (isLooping) {
          video.currentTime = trimRange.start;
          video.play().catch(() => {});
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }
    };

    const handleLoadedMetadata = () => {
      const dur = video.duration;
      setDuration(dur);
      setIsLoading(false);
      // Auto-set trim end if unset
      setTrimRange((prev) => {
        if (prev.end === 0 || prev.end > dur) {
          return { start: prev.start, end: dur };
        }
        return prev;
      });
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (isLooping) {
        video.currentTime = trimRange.start;
        video.play().catch(() => {});
      } else {
        setIsPlaying(false);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [trimRange.start, trimRange.end, isLooping, setTrimRange]);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    isLooping,
    setIsLooping,
    isLoading,
    setIsLoading,
    error,
    setError,
    togglePlay,
    play,
    pause,
    seekTo,
    stepFrame,
    setInPointAtPlayhead,
    setOutPointAtPlayhead,
    resetTrim,
  };
}
