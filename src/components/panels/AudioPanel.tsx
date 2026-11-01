import React from 'react';
import { Volume2, VolumeX, Volume1, Sliders, Waves } from 'lucide-react';
import { AudioSettings } from '../../types';

interface AudioPanelProps {
  audioSettings: AudioSettings;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettings>>;
}

export const AudioPanel: React.FC<AudioPanelProps> = ({
  audioSettings,
  setAudioSettings,
}) => {
  const volumePercent = Math.round(audioSettings.volume * 100);

  return (
    <div className="p-4 space-y-6 select-none">
      {/* Volume Slider Card */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            {audioSettings.isMuted || audioSettings.volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : audioSettings.volume > 1 ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Volume1 className="w-4 h-4 text-blue-400" />
            )}
            Master Volume
          </span>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
              audioSettings.volume > 1
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : audioSettings.isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}
          >
            {audioSettings.isMuted ? 'MUTED' : `${volumePercent}%`}
          </span>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={audioSettings.isMuted ? 0 : audioSettings.volume}
            onChange={(e) =>
              setAudioSettings((prev) => ({
                ...prev,
                volume: parseFloat(e.target.value),
                isMuted: false,
              }))
            }
            className="w-full accent-blue-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0% (Silent)</span>
            <span>100% (Normal)</span>
            <span className="text-emerald-500">200% (Boost)</span>
          </div>
        </div>

        {/* Mute Button */}
        <button
          onClick={() =>
            setAudioSettings((prev) => ({ ...prev, isMuted: !prev.isMuted }))
          }
          className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
            audioSettings.isMuted
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {audioSettings.isMuted ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Unmute Video</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Mute Audio</span>
            </>
          )}
        </button>
      </div>

      {/* Audio Transitions & Effects */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-blue-400" />
          Fades & Transitions
        </h3>

        <div className="space-y-2">
          {/* Fade In */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
            <div>
              <span className="text-xs font-medium text-slate-200 block">
                Audio Fade In (1.5s)
              </span>
              <span className="text-[11px] text-slate-500">
                Smoothly ramps volume from silence at video start
              </span>
            </div>
            <input
              type="checkbox"
              checked={audioSettings.fadeIn}
              onChange={(e) =>
                setAudioSettings((prev) => ({ ...prev, fadeIn: e.target.checked }))
              }
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </label>

          {/* Fade Out */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
            <div>
              <span className="text-xs font-medium text-slate-200 block">
                Audio Fade Out (1.5s)
              </span>
              <span className="text-[11px] text-slate-500">
                Gradually fades down audio before the clip ends
              </span>
            </div>
            <input
              type="checkbox"
              checked={audioSettings.fadeOut}
              onChange={(e) =>
                setAudioSettings((prev) => ({ ...prev, fadeOut: e.target.checked }))
              }
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
