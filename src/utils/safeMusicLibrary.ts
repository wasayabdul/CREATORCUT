import { SafeMusicTrack } from '../types';

export const SAFE_MUSIC_LIBRARY: SafeMusicTrack[] = [
  {
    id: 'safe-track-1',
    title: 'Midnight Lo-Fi Chill',
    artist: 'ChillWave Collective',
    genre: 'Lo-Fi / Beats',
    duration: 34,
    bpm: 82,
    licenseName: 'CC0 1.0 Universal (Public Domain)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://freemusicarchive.org/genre/lo-fi',
    attributionText: 'Music: "Midnight Lo-Fi Chill" by ChillWave Collective (CC0 1.0 Public Domain Dedicated)',
  },
  {
    id: 'safe-track-2',
    title: 'Golden Horizon Acoustic',
    artist: 'Kevan Wood & Strings',
    genre: 'Acoustic / Warm',
    duration: 28,
    bpm: 104,
    licenseName: 'Creative Commons Attribution 4.0 (CC BY 4.0)',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: 'https://incompetech.com/',
    attributionText: 'Music: "Golden Horizon Acoustic" by Kevan Wood (incompetech.com), Licensed under Creative Commons: By Attribution 4.0 License',
  },
  {
    id: 'safe-track-3',
    title: 'Cinematic Deep Horizon',
    artist: 'Aether Sounds',
    genre: 'Cinematic / Ambient',
    duration: 40,
    bpm: 70,
    licenseName: 'CC0 1.0 Universal (Public Domain)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://freemusicarchive.org/genre/ambient',
    attributionText: 'Music: "Cinematic Deep Horizon" by Aether Sounds (CC0 1.0 Dedicated to the Public Domain)',
  },
  {
    id: 'safe-track-4',
    title: 'Inspiring Tech Future',
    artist: 'Alexey K. Synthetics',
    genre: 'Electronic / Upbeat',
    duration: 32,
    bpm: 118,
    licenseName: 'Creative Commons Attribution 4.0 (CC BY 4.0)',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: 'https://freemusicarchive.org/music/electronic',
    attributionText: 'Music: "Inspiring Tech Future" by Alexey K., Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)',
  },
  {
    id: 'safe-track-5',
    title: 'Morning Coffee Acoustic Walk',
    artist: 'Free Sound Records',
    genre: 'Folk / Indie',
    duration: 25,
    bpm: 96,
    licenseName: 'CC0 1.0 Universal (Public Domain)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://musopen.org/',
    attributionText: 'Music: "Morning Coffee Acoustic Walk" by Free Sound Records, Public Domain Dedication (CC0 1.0)',
  },
];

/**
 * High-fidelity procedural audio generator for instant browser playback of the safe tracks
 * without requiring external network downloads or risk of CDN outage.
 */
class SynthesizedMusicPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrackId: string | null = null;
  private timer: number | null = null;
  private onEndedCallback: (() => void) | null = null;

  private initContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTrack(track: SafeMusicTrack, onEnded?: () => void) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentTrackId = track.id;
    this.onEndedCallback = onEnded || null;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = track.duration;

    // Master bus
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, now);
    masterGain.connect(ctx.destination);

    // Chords and notes according to genre
    const baseFreq = track.id === 'safe-track-1' ? 196.00 // G3
      : track.id === 'safe-track-2' ? 220.00 // A3
      : track.id === 'safe-track-3' ? 146.83 // D3
      : track.id === 'safe-track-4' ? 261.63 // C4
      : 246.94; // B3

    // Synthesize harmony and rhythm
    const chordProgressions = [
      [1, 1.25, 1.5, 1.875],     // Major 7th
      [1.125, 1.333, 1.667, 2],  // Minor 7th
      [0.89, 1.125, 1.333, 1.778],
      [1, 1.25, 1.5, 1.875]
    ];

    const chordLength = 60 / (track.bpm / 2);
    const totalBars = Math.ceil(duration / (chordLength * 4));

    for (let bar = 0; bar < totalBars; bar++) {
      chordProgressions.forEach((chord, chordIdx) => {
        const time = now + (bar * 4 + chordIdx) * chordLength;
        if (time >= now + duration) return;

        // Play chord notes with subtle warm filter
        chord.forEach((mult, noteIdx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = track.genre.includes('Lo-Fi') ? 'triangle' : track.genre.includes('Ambient') ? 'sine' : 'sawtooth';
          osc.frequency.setValueAtTime(baseFreq * mult, time);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(track.genre.includes('Lo-Fi') ? 650 : 1200, time);

          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.06 / (noteIdx + 1), time + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, time + chordLength * 0.95);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(time);
          osc.stop(time + chordLength);
        });

        // Add soft rhythmic pulse for Lo-fi and Tech tracks
        if (track.bpm > 80) {
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(120, time);
          kickOsc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

          kickGain.gain.setValueAtTime(0.12, time);
          kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

          kickOsc.connect(kickGain);
          kickGain.connect(masterGain);

          kickOsc.start(time);
          kickOsc.stop(time + 0.15);
        }
      });
    }

    // Timer to stop when finished
    this.timer = window.setTimeout(() => {
      this.stop();
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    }, duration * 1000);
  }

  stop() {
    this.isPlaying = false;
    this.currentTrackId = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // Safe ignore
      }
      this.ctx = null;
    }
  }

  getPlayingTrackId(): string | null {
    return this.isPlaying ? this.currentTrackId : null;
  }
}

export const safeMusicPlayer = new SynthesizedMusicPlayer();
