/**
 * Sample video presets and offline canvas-generated clip for instant testing
 */

export interface SampleClip {
  id: string;
  title: string;
  description: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  url: string;
  duration: number;
  width: number;
  height: number;
  tag: string;
}

export const SAMPLE_CLIPS: SampleClip[] = [
  {
    id: 'sample-landscape',
    title: 'Cinematic Nature & Waves (16:9)',
    description: 'Crisp scenic ocean drone footage with atmospheric movement',
    aspectRatio: '16:9',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 15,
    width: 1280,
    height: 720,
    tag: 'YouTube / Landscape',
  },
  {
    id: 'sample-action',
    title: 'Urban City & Action (16:9)',
    description: 'High energy fast-paced clip perfect for trimming & text overlays',
    aspectRatio: '16:9',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    duration: 15,
    width: 1280,
    height: 720,
    tag: 'Cinematic',
  },
  {
    id: 'sample-animals',
    title: 'Wildlife Documentary (16:9)',
    description: 'Smooth slow-motion clip, great for testing Urdu & English subtitles',
    aspectRatio: '16:9',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 60,
    width: 1280,
    height: 720,
    tag: 'Documentary',
  },
];

/**
 * Generates an instant high-definition procedural video in browser memory
 * with animated geometric visuals, countdown timer, audio synth chords,
 * and timecode! Guarantees 0-network dependency and instant testing.
 */
export async function generateSyntheticTestClip(
  durationSec = 10,
  aspectRatio: '16:9' | '9:16' | '1:1' = '16:9'
): Promise<{ file: File; url: string; width: number; height: number; duration: number }> {
  let width = 1280;
  let height = 720;
  if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '1:1') {
    width = 720;
    height = 720;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const fps = 30;
  const totalFrames = durationSec * fps;
  const stream = canvas.captureStream(fps);

  // Synthesize background audio tone using Web Audio API
  let audioContext: AudioContext | null = null;
  let dest: MediaStreamAudioDestinationNode | null = null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioContextClass();
    dest = audioContext.createMediaStreamDestination();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioContext.currentTime); // Concert A
    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    // Add audio track to stream
    const audioTrack = dest.stream.getAudioTracks()[0];
    if (audioTrack) {
      stream.addTrack(audioTrack);
    }
  } catch {
    // Audio synthesis fallback if blocked
  }

  const mimeType = MediaRecorder.isTypeSupported('video/mp4')
    ? 'video/mp4'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 4_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      if (audioContext) {
        audioContext.close();
      }
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  recorder.start();

  // Render procedural frames
  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps;
    const progress = frame / totalFrames;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    const hue1 = (frame * 1.5) % 360;
    const hue2 = (hue1 + 90) % 360;
    grad.addColorStop(0, `hsl(${hue1}, 65%, 16%)`);
    grad.addColorStop(1, `hsl(${hue2}, 70%, 10%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing animated circles
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < 4; i++) {
      const radius = 60 + i * 45 + Math.sin(time * 3 + i) * 20;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${(hue1 + i * 40) % 360}, 85%, 65%, 0.4)`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Grid lines for studio aesthetic
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    const badgeW = Math.min(width * 0.8, 480);
    const badgeH = 180;
    ctx.beginPath();
    ctx.roundRect(cx - badgeW / 2, cy - badgeH / 2, badgeW, badgeH, 16);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Studio Label
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CREATORCUT STUDIO', cx, cy - 35);

    // Countdown / Time
    const remaining = Math.max(0, durationSec - time).toFixed(1);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px "Inter", monospace';
    ctx.fillText(`00:${remaining.padStart(4, '0')}`, cx, cy + 15);

    // Progress bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(cx - 160, cy + 45, 320, 8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(cx - 160, cy + 45, 320 * progress, 8);

    // Watermark tag
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(`Aspect: ${aspectRatio} • Frame ${frame + 1}/${totalFrames}`, cx, cy + 70);

    // Give time to recorder
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  recorder.stop();
  const blob = await recordingPromise;
  const file = new File([blob], `sample_${aspectRatio.replace(':', 'x')}.mp4`, {
    type: blob.type || 'video/mp4',
  });
  const url = URL.createObjectURL(blob);

  return {
    file,
    url,
    width,
    height,
    duration: durationSec,
  };
}
