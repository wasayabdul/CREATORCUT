import React from 'react';
import { Monitor, Smartphone, Square, Check, Maximize2, Crop } from 'lucide-react';
import { AspectRatio, FitMode } from '../../types';

interface AspectRatioPanelProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  fitMode: FitMode;
  setFitMode: (mode: FitMode) => void;
}

export const AspectRatioPanel: React.FC<AspectRatioPanelProps> = ({
  aspectRatio,
  setAspectRatio,
  fitMode,
  setFitMode,
}) => {
  const ratios: {
    id: AspectRatio;
    name: string;
    sub: string;
    icon: typeof Monitor;
    platforms: string;
  }[] = [
    {
      id: '9:16',
      name: 'Vertical (9:16)',
      sub: '1080 × 1920',
      icon: Smartphone,
      platforms: 'TikTok, Instagram Reels, YouTube Shorts',
    },
    {
      id: '16:9',
      name: 'Landscape (16:9)',
      sub: '1920 × 1080',
      icon: Monitor,
      platforms: 'YouTube, Television, Desktop, Vlogs',
    },
    {
      id: '1:1',
      name: 'Square (1:1)',
      sub: '1080 × 1080',
      icon: Square,
      platforms: 'Instagram Feed, LinkedIn, Twitter/X',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Aspect Ratio Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Canvas Aspect Ratio
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          {ratios.map((item) => {
            const Icon = item.icon;
            const isSelected = aspectRatio === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setAspectRatio(item.id)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {item.sub}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {item.platforms}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fit Mode Toggle */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Frame Fit Mode
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setFitMode('contain')}
            className={`p-3 rounded-xl border text-left transition-all ${
              fitMode === 'contain'
                ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-slate-200">
              <Maximize2 className="w-4 h-4 text-blue-400" />
              <span>Contain (Fit)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Show full video with subtle studio background blur. Zero cropping.
            </p>
          </button>

          <button
            onClick={() => setFitMode('cover')}
            className={`p-3 rounded-xl border text-left transition-all ${
              fitMode === 'cover'
                ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs text-slate-200">
              <Crop className="w-4 h-4 text-indigo-400" />
              <span>Cover (Fill)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Fill entire frame dynamically. Center-crops excess edges.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
