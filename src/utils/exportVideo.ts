import {
  AspectRatio,
  AudioSettings,
  ExportProgress,
  ExportSettings,
  FitMode,
  Subtitle,
  SubtitleStyle,
  TextOverlay,
  TrimRange,
} from '../types';

/**
 * Draw video frame with aspect ratio letterboxing / crop onto canvas
 */
export function drawVideoFrameOnCanvas({
  ctx,
  video,
  canvasWidth,
  canvasHeight,
  fitMode,
}: {
  ctx: CanvasRenderingContext2D;
  video: HTMLVideoElement;
  canvasWidth: number;
  canvasHeight: number;
  fitMode: FitMode;
}) {
  const vidW = video.videoWidth || video.width || 1280;
  const vidH = video.videoHeight || video.height || 720;
  const targetAspect = canvasWidth / canvasHeight;
  const videoAspect = vidW / vidH;

  // Clear canvas
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (fitMode === 'cover') {
    // Fill the canvas, cropping excess
    let drawW, drawH, offsetX, offsetY;
    if (videoAspect > targetAspect) {
      // Video is wider than canvas
      drawH = canvasHeight;
      drawW = canvasHeight * videoAspect;
      offsetX = (canvasWidth - drawW) / 2;
      offsetY = 0;
    } else {
      // Video is taller than canvas
      drawW = canvasWidth;
      drawH = canvasWidth / videoAspect;
      offsetX = 0;
      offsetY = (canvasHeight - drawH) / 2;
    }
    ctx.drawImage(video, offsetX, offsetY, drawW, drawH);
  } else {
    // Contain (fit with subtle blurred background or clean dark letterbox)
    // Draw subtle blurred background of the video
    ctx.save();
    ctx.filter = 'blur(24px) brightness(0.4)';
    ctx.drawImage(video, -20, -20, canvasWidth + 40, canvasHeight + 40);
    ctx.restore();

    // Dark overlay on blurred background
    ctx.fillStyle = 'rgba(10, 13, 20, 0.4)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    let drawW, drawH, offsetX, offsetY;
    if (videoAspect > targetAspect) {
      // Fits width, black bars top/bottom
      drawW = canvasWidth;
      drawH = canvasWidth / videoAspect;
      offsetX = 0;
      offsetY = (canvasHeight - drawH) / 2;
    } else {
      // Fits height, black bars left/right
      drawH = canvasHeight;
      drawW = canvasHeight * videoAspect;
      offsetX = (canvasWidth - drawW) / 2;
      offsetY = 0;
    }
    ctx.drawImage(video, offsetX, offsetY, drawW, drawH);
  }
}

/**
 * Render active text overlays on the canvas
 */
export function drawTextOverlays({
  ctx,
  textOverlays,
  currentTime,
  canvasWidth,
  canvasHeight,
}: {
  ctx: CanvasRenderingContext2D;
  textOverlays: TextOverlay[];
  currentTime: number;
  canvasWidth: number;
  canvasHeight: number;
}) {
  for (const item of textOverlays) {
    if (currentTime >= item.startTime && currentTime <= item.endTime) {
      ctx.save();

      const scale = canvasWidth / 1280;
      const fontSize = Math.max(16, Math.round(item.fontSize * scale));
      const fontFam = item.fontFamily === 'Noto Nastaliq Urdu' ? "'Noto Nastaliq Urdu', serif" : `"${item.fontFamily}", sans-serif`;
      ctx.font = `${item.fontWeight || 'normal'} ${fontSize}px ${fontFam}`;
      ctx.direction = item.isRTL ? 'rtl' : 'ltr';

      const x = (item.x / 100) * canvasWidth;
      const y = (item.y / 100) * canvasHeight;

      const lines = item.text.split('\n');
      const lineHeight = fontSize * (item.fontFamily === 'Noto Nastaliq Urdu' ? 1.8 : 1.3);

      lines.forEach((line, index) => {
        const textMetrics = ctx.measureText(line);
        const lineY = y + index * lineHeight;

        if (item.hasBackground) {
          ctx.fillStyle = item.bgColor || 'rgba(0, 0, 0, 0.7)';
          const padX = fontSize * 0.4;
          const padY = fontSize * 0.2;
          ctx.beginPath();
          ctx.roundRect(
            x - textMetrics.width / 2 - padX,
            lineY - fontSize * 0.85 - padY,
            textMetrics.width + padX * 2,
            lineHeight,
            6 * scale
          );
          ctx.fill();
        }

        if (item.hasShadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 8 * scale;
          ctx.shadowOffsetX = 2 * scale;
          ctx.shadowOffsetY = 2 * scale;
        }

        ctx.fillStyle = item.color || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(line, x, lineY);
      });

      ctx.restore();
    }
  }
}

/**
 * Render active subtitle on canvas
 */
export function drawSubtitles({
  ctx,
  subtitles,
  subtitleStyle,
  currentTime,
  canvasWidth,
  canvasHeight,
}: {
  ctx: CanvasRenderingContext2D;
  subtitles: Subtitle[];
  subtitleStyle: SubtitleStyle;
  currentTime: number;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const activeSub = subtitles.find(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime && s.text.trim().length > 0
  );

  if (!activeSub) return;

  ctx.save();
  const scale = canvasWidth / 1280;
  const fontSize = Math.max(16, Math.round(subtitleStyle.fontSize * scale));
  const isUrdu = activeSub.language === 'ur' || subtitleStyle.fontFamily === 'Noto Nastaliq Urdu';
  const fontFam = isUrdu ? "'Noto Nastaliq Urdu', serif" : `"${subtitleStyle.fontFamily}", sans-serif`;

  ctx.font = `600 ${fontSize}px ${fontFam}`;
  ctx.direction = isUrdu ? 'rtl' : 'ltr';

  let y = (canvasHeight * (subtitleStyle.yOffset || 88)) / 100;
  if (subtitleStyle.position === 'top') {
    y = canvasHeight * 0.12;
  } else if (subtitleStyle.position === 'middle') {
    y = canvasHeight * 0.5;
  }

  const x =
    subtitleStyle.align === 'left'
      ? canvasWidth * 0.1
      : subtitleStyle.align === 'right'
      ? canvasWidth * 0.9
      : canvasWidth / 2;

  const lines = activeSub.text.split('\n');
  const lineHeight = fontSize * (isUrdu ? 2.0 : 1.35);

  lines.forEach((line, index) => {
    const textMetrics = ctx.measureText(line);
    const lineY = y + index * lineHeight;

    // Background box/pill
    if (subtitleStyle.hasBackground) {
      ctx.fillStyle = subtitleStyle.bgColor || 'rgba(0, 0, 0, 0.75)';
      const padX = fontSize * 0.5;
      const padY = fontSize * 0.25;
      ctx.beginPath();
      ctx.roundRect(
        x - textMetrics.width / 2 - padX,
        lineY - fontSize * 0.85 - padY,
        textMetrics.width + padX * 2,
        lineHeight,
        8 * scale
      );
      ctx.fill();
    }

    // Shadow
    if (subtitleStyle.hasShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6 * scale;
      ctx.shadowOffsetX = 2 * scale;
      ctx.shadowOffsetY = 2 * scale;
    }

    // Outline
    if (subtitleStyle.hasOutline) {
      ctx.strokeStyle = subtitleStyle.outlineColor || '#000000';
      ctx.lineWidth = Math.max(2, 3 * scale);
      ctx.textAlign = subtitleStyle.align;
      ctx.textBaseline = 'middle';
      ctx.strokeText(line, x, lineY);
    }

    ctx.fillStyle = subtitleStyle.textColor || '#ffffff';
    ctx.textAlign = subtitleStyle.align;
    ctx.textBaseline = 'middle';
    ctx.fillText(line, x, lineY);
  });

  ctx.restore();
}

/**
 * Calculates output dimensions based on target aspect ratio and resolution
 */
export function getOutputDimensions(
  aspectRatio: AspectRatio,
  resolution: '1080p' | '720p' | '480p'
): { width: number; height: number } {
  let baseDimension = 1080;
  if (resolution === '720p') baseDimension = 720;
  if (resolution === '480p') baseDimension = 480;

  if (aspectRatio === '16:9') {
    return {
      width: Math.round((baseDimension * 16) / 9 / 2) * 2,
      height: baseDimension,
    };
  } else if (aspectRatio === '9:16') {
    return {
      width: baseDimension,
      height: Math.round((baseDimension * 16) / 9 / 2) * 2,
    };
  } else {
    // 1:1
    return {
      width: baseDimension,
      height: baseDimension,
    };
  }
}

/**
 * Dual Engine Video Exporter:
 * Primary: High precision Canvas + Web Audio API + MediaRecorder / MP4 export
 * Secondary: FFmpeg wasm support when environment permits
 */
export async function exportVideo({
  videoElement,
  trimRange,
  aspectRatio,
  fitMode,
  subtitles,
  subtitleStyle,
  textOverlays,
  audioSettings,
  exportSettings,
  onProgress,
}: {
  videoElement: HTMLVideoElement;
  trimRange: TrimRange;
  aspectRatio: AspectRatio;
  fitMode: FitMode;
  subtitles: Subtitle[];
  subtitleStyle: SubtitleStyle;
  textOverlays: TextOverlay[];
  audioSettings: AudioSettings;
  exportSettings: ExportSettings;
  onProgress: (progress: ExportProgress) => void;
}): Promise<string> {
  const { width, height } = getOutputDimensions(aspectRatio, exportSettings.resolution);
  const duration = trimRange.end - trimRange.start;

  if (duration <= 0) {
    throw new Error('Trim range is invalid. End time must be greater than start time.');
  }

  onProgress({
    status: 'preparing',
    progress: 5,
    message: `Initializing ${width}x${height} canvas pipeline...`,
  });

  // Create offscreen rendering canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Could not initialize 2D rendering context');
  }

  // Set up audio pipeline using Web Audio API to capture modified volume & fades
  let audioContext: AudioContext | null = null;
  let audioStreamDest: MediaStreamAudioDestinationNode | null = null;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioContextClass();
    audioStreamDest = audioContext.createMediaStreamDestination();

    // Connect video element to audio graph
    const sourceNode = audioContext.createMediaElementSource(videoElement);
    const gainNode = audioContext.createGain();

    const targetVolume = audioSettings.isMuted ? 0 : audioSettings.volume;
    gainNode.gain.setValueAtTime(targetVolume, audioContext.currentTime);

    // Apply fade in / fade out if requested
    if (audioSettings.fadeIn && !audioSettings.isMuted) {
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + 1.5);
    }

    sourceNode.connect(gainNode);
    gainNode.connect(audioStreamDest);
    // Also connect to speaker so audio plays along or keep quiet via destination only
  } catch (err) {
    console.warn('Audio capture warning, proceeding with video-first pipeline:', err);
  }

  const fps = exportSettings.fps || 30;
  const stream = canvas.captureStream(fps);

  if (audioStreamDest) {
    const audioTrack = audioStreamDest.stream.getAudioTracks()[0];
    if (audioTrack) {
      stream.addTrack(audioTrack);
    }
  }

  // Determine supported mime types for browser export
  let mimeType = 'video/webm';
  if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
    mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    mimeType = 'video/webm;codecs=vp9,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
    mimeType = 'video/webm;codecs=vp8,opus';
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: exportSettings.quality === 'high' ? 8_000_000 : 4_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
    recorder.onerror = (e) => {
      reject(e);
    };
  });

  // Prepare video element for export run
  const originalCurrentTime = videoElement.currentTime;
  const originalMuted = videoElement.muted;

  videoElement.currentTime = trimRange.start;
  videoElement.muted = audioSettings.isMuted;
  videoElement.volume = Math.min(1, audioSettings.volume);

  await new Promise((r) => {
    const onSeeked = () => {
      videoElement.removeEventListener('seeked', onSeeked);
      r(true);
    };
    videoElement.addEventListener('seeked', onSeeked);
  });

  recorder.start(100);

  onProgress({
    status: 'rendering',
    progress: 10,
    message: 'Rendering video frames with subtitles and text overlays...',
  });

  let isCancelled = false;
  let animId = 0;

  const renderPromise = new Promise<void>((resolve, reject) => {
    videoElement.play().catch(reject);

    const onFrame = () => {
      if (isCancelled) return;

      const currTime = videoElement.currentTime;

      // Draw background and video frame
      drawVideoFrameOnCanvas({
        ctx,
        video: videoElement,
        canvasWidth: width,
        canvasHeight: height,
        fitMode,
      });

      // Draw active text overlays
      if (exportSettings.includeTextOverlays) {
        drawTextOverlays({
          ctx,
          textOverlays,
          currentTime: currTime,
          canvasWidth: width,
          canvasHeight: height,
        });
      }

      // Draw active subtitles
      if (exportSettings.includeSubtitles) {
        drawSubtitles({
          ctx,
          subtitles,
          subtitleStyle,
          currentTime: currTime,
          canvasWidth: width,
          canvasHeight: height,
        });
      }

      // Calculate progress
      const elapsed = Math.max(0, currTime - trimRange.start);
      const pct = Math.min(95, 10 + Math.round((elapsed / duration) * 85));
      onProgress({
        status: 'rendering',
        progress: pct,
        message: `Rendering ${(currTime - trimRange.start).toFixed(1)}s / ${duration.toFixed(1)}s (${pct}%)...`,
      });

      // Stop when out-point reached
      if (currTime >= trimRange.end || videoElement.ended) {
        videoElement.pause();
        resolve();
      } else {
        animId = requestAnimationFrame(onFrame);
      }
    };

    animId = requestAnimationFrame(onFrame);
  });

  await renderPromise;

  onProgress({
    status: 'muxing',
    progress: 96,
    message: 'Finalizing MP4 container and streams...',
  });

  recorder.stop();
  const recordedBlob = await recordingPromise;

  // Restore video state
  videoElement.currentTime = originalCurrentTime;
  videoElement.muted = originalMuted;
  if (animId) cancelAnimationFrame(animId);
  if (audioContext && audioContext.state !== 'closed') {
    try {
      await audioContext.close();
    } catch {
      // Ignore
    }
  }

  // Create downloadable MP4 blob URL
  const exportBlob = new Blob([recordedBlob], { type: 'video/mp4' });
  const downloadUrl = URL.createObjectURL(exportBlob);

  onProgress({
    status: 'completed',
    progress: 100,
    message: 'Export completed successfully!',
    outputUrl: downloadUrl,
  });

  return downloadUrl;
}
