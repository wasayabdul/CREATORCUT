import React, { useRef, useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  FileDown,
  Upload,
  Play,
  Palette,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Globe,
} from 'lucide-react';
import { Subtitle, SubtitleLanguage, SubtitleStyle } from '../../types';
import {
  downloadSRTFile,
  parseSRTFile,
  SUBTITLE_PRESETS,
} from '../../utils/srtParser';
import { formatTime } from '../../utils/timeFormat';

interface SubtitlesPanelProps {
  subtitles: Subtitle[];
  setSubtitles: React.Dispatch<React.SetStateAction<Subtitle[]>>;
  subtitleStyle: SubtitleStyle;
  setSubtitleStyle: React.Dispatch<React.SetStateAction<SubtitleStyle>>;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  selectedSubtitleId: string | null;
  setSelectedSubtitleId: (id: string | null) => void;
  videoFilename?: string;
}

export const SubtitlesPanel: React.FC<SubtitlesPanelProps> = ({
  subtitles,
  setSubtitles,
  subtitleStyle,
  setSubtitleStyle,
  currentTime,
  duration,
  onSeek,
  selectedSubtitleId,
  setSelectedSubtitleId,
  videoFilename = 'creatorcut_video',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'styling'>('editor');
  const [currentLang, setCurrentLang] = useState<SubtitleLanguage>('en');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add subtitle at current video playhead
  const handleAddSubtitle = (customText = '', customLang: SubtitleLanguage = currentLang) => {
    const start = currentTime;
    const end = Math.min(duration, start + 3.0);
    const newSub: Subtitle = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      startTime: Number(start.toFixed(2)),
      endTime: Number(end.toFixed(2)),
      text:
        customText ||
        (customLang === 'ur'
          ? 'یہاں اپنا اردو متن لکھیں...'
          : customLang === 'roman-ur'
          ? 'Yahan Roman Urdu mein likhein...'
          : 'Type your subtitle text here...'),
      language: customLang,
    };

    setSubtitles((prev) => [...prev, newSub].sort((a, b) => a.startTime - b.startTime));
    setSelectedSubtitleId(newSub.id);
  };

  // Add one of the curated presets
  const handleAddPreset = (text: string, subDuration: number) => {
    const start = currentTime;
    const end = Math.min(duration, start + subDuration);
    const newSub: Subtitle = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      startTime: Number(start.toFixed(2)),
      endTime: Number(end.toFixed(2)),
      text,
      language: currentLang,
    };

    setSubtitles((prev) => [...prev, newSub].sort((a, b) => a.startTime - b.startTime));
    setSelectedSubtitleId(newSub.id);
  };

  // Auto-generate evenly timed empty subtitle tracks across the video
  const handleAutoGenerateTimedTrack = () => {
    const chunkDuration = 3.5;
    const totalChunks = Math.min(20, Math.floor(duration / chunkDuration));
    if (totalChunks <= 0) return;

    const newSubs: Subtitle[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const s = i * chunkDuration;
      const e = Math.min(duration, (i + 1) * chunkDuration);
      newSubs.push({
        id: 'sub_' + Math.random().toString(36).substring(2, 9),
        startTime: Number(s.toFixed(2)),
        endTime: Number(e.toFixed(2)),
        text:
          currentLang === 'ur'
            ? `جملہ نمبر ${i + 1}`
            : currentLang === 'roman-ur'
            ? `Dialogue part ${i + 1}`
            : `Subtitle line ${i + 1}`,
        language: currentLang,
      });
    }
    setSubtitles(newSubs);
  };

  // Update a subtitle field
  const updateSubtitle = (id: string, updates: Partial<Subtitle>) => {
    setSubtitles((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub))
    );
  };

  // Delete a subtitle
  const deleteSubtitle = (id: string) => {
    setSubtitles((prev) => prev.filter((sub) => sub.id !== id));
    if (selectedSubtitleId === id) setSelectedSubtitleId(null);
  };

  // Handle SRT Import from user's disk
  const handleImportSRT = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseSRTFile(content, currentLang);
        if (parsed.length > 0) {
          setSubtitles(parsed);
          setSelectedSubtitleId(parsed[0].id);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export SRT
  const handleExportSRT = () => {
    downloadSRTFile(subtitles, `${videoFilename}_subtitles`);
  };

  return (
    <div className="flex flex-col h-full select-none">
      {/* Sub-Tabs: Subtitles List vs Styling */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 gap-2">
        <button
          onClick={() => setActiveSubTab('editor')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'editor'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Subtitles ({subtitles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('styling')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'styling'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Style & Typography</span>
        </button>
      </div>

      {/* Tab 1: Subtitles Editor */}
      {activeSubTab === 'editor' ? (
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)]">
          {/* Language Mode Toggle */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Active Language
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentLang === 'ur'
                  ? 'Urdu Nastaliq RTL'
                  : currentLang === 'roman-ur'
                  ? 'Roman Urdu'
                  : 'English'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setCurrentLang('en')}
                className={`py-1 px-2 rounded-md text-xs font-medium transition-all ${
                  currentLang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => {
                  setCurrentLang('ur');
                  setSubtitleStyle((prev) => ({
                    ...prev,
                    fontFamily: 'Noto Nastaliq Urdu',
                  }));
                }}
                className={`py-1 px-2 rounded-md text-xs font-medium transition-all font-urdu ${
                  currentLang === 'ur'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                اردو (Urdu)
              </button>
              <button
                onClick={() => setCurrentLang('roman-ur')}
                className={`py-1 px-2 rounded-md text-xs font-medium transition-all ${
                  currentLang === 'roman-ur'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Roman Urdu
              </button>
            </div>
          </div>

          {/* Quick Preset Phrases Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Quick {currentLang.toUpperCase()} Phrases
              </span>
              <span className="text-[10px] text-slate-500">Click to insert</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUBTITLE_PRESETS[currentLang].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(preset.text, preset.duration)}
                  className={`text-[11px] px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors truncate max-w-full ${
                    currentLang === 'ur' ? 'font-urdu' : ''
                  }`}
                >
                  + {preset.text}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row: Add, Import, Export, Auto-split */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleAddSubtitle()}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subtitle (+3s)</span>
            </button>

            <button
              onClick={handleAutoGenerateTimedTrack}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
              title="Generate evenly spaced subtitle blocks across video"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto Timeline Track</span>
            </button>
          </div>

          {/* Import / Export SRT Toolbar */}
          <div className="flex items-center justify-between pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept=".srt"
              onChange={handleImportSRT}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import .SRT file</span>
            </button>

            {subtitles.length > 0 && (
              <button
                onClick={handleExportSRT}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download .SRT</span>
              </button>
            )}
          </div>

          {/* Subtitles List */}
          <div className="space-y-3 pt-2">
            {subtitles.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No subtitles added yet</p>
                <p className="text-[11px] text-slate-500">
                  Click 'Add Subtitle' or choose a quick phrase above
                </p>
              </div>
            ) : (
              subtitles.map((sub, index) => {
                const isUrdu = sub.language === 'ur';
                const isSelected = selectedSubtitleId === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubtitleId(sub.id)}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center">
                          {index + 1}
                        </span>
                        {/* Language Tag */}
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                            sub.language === 'ur'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : sub.language === 'roman-ur'
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {sub.language}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Seek button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSeek(sub.startTime);
                          }}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                          title="Seek to start"
                        >
                          <Play className="w-3 h-3 fill-slate-400" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSubtitle(sub.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded"
                          title="Delete subtitle"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Text Field */}
                    <textarea
                      value={sub.text}
                      onChange={(e) => updateSubtitle(sub.id, { text: e.target.value })}
                      dir={isUrdu ? 'rtl' : 'ltr'}
                      rows={2}
                      className={`w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none ${
                        isUrdu ? 'font-urdu text-sm' : ''
                      }`}
                      placeholder={
                        isUrdu
                          ? 'یہاں اپنا اردو متن درج کریں...'
                          : 'Enter subtitle text...'
                      }
                    />

                    {/* Timing controls */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <span>In:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max={sub.endTime}
                          value={Number(sub.startTime.toFixed(2))}
                          onChange={(e) =>
                            updateSubtitle(sub.id, {
                              startTime: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center text-xs font-mono text-white"
                        />
                        <span>s</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span>Out:</span>
                        <input
                          type="number"
                          step="0.1"
                          min={sub.startTime}
                          max={duration}
                          value={Number(sub.endTime.toFixed(2))}
                          onChange={(e) =>
                            updateSubtitle(sub.id, {
                              endTime: parseFloat(e.target.value) || duration,
                            })
                          }
                          className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center text-xs font-mono text-white"
                        />
                        <span>s</span>
                      </div>

                      <span className="ml-auto font-mono text-slate-500 text-[10px]">
                        {(sub.endTime - sub.startTime).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Subtitle Styling & Typography */
        <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-280px)]">
          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Font Family
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Noto Nastaliq Urdu', label: 'اردو نستعلیق', urdu: true },
                { name: 'Inter', label: 'Inter Clean', urdu: false },
                { name: 'Plus Jakarta Sans', label: 'Jakarta Bold', urdu: false },
                { name: 'Outfit', label: 'Outfit Modern', urdu: false },
              ].map((f) => (
                <button
                  key={f.name}
                  onClick={() =>
                    setSubtitleStyle((prev) => ({ ...prev, fontFamily: f.name }))
                  }
                  className={`p-2 rounded-lg border text-xs text-left transition-all ${
                    subtitleStyle.fontFamily === f.name
                      ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  } ${f.urdu ? 'font-urdu text-sm' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Font Size</span>
              <span className="font-mono text-blue-400">
                {subtitleStyle.fontSize}px
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="72"
              value={subtitleStyle.fontSize}
              onChange={(e) =>
                setSubtitleStyle((prev) => ({
                  ...prev,
                  fontSize: parseInt(e.target.value),
                }))
              }
              className="w-full accent-blue-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          {/* Text Color Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              {['#ffffff', '#fde047', '#38bdf8', '#34d399', '#f43f5e'].map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    setSubtitleStyle((prev) => ({ ...prev, textColor: color }))
                  }
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    subtitleStyle.textColor === color
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
              <input
                type="color"
                value={subtitleStyle.textColor}
                onChange={(e) =>
                  setSubtitleStyle((prev) => ({ ...prev, textColor: e.target.value }))
                }
                className="w-7 h-7 rounded-full bg-transparent cursor-pointer ml-1"
                title="Custom color"
              />
            </div>
          </div>

          {/* Background Pill & Outline */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Background Box (Pill)
              </span>
              <input
                type="checkbox"
                checked={subtitleStyle.hasBackground}
                onChange={(e) =>
                  setSubtitleStyle((prev) => ({
                    ...prev,
                    hasBackground: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Text Outline (Stroke)
              </span>
              <input
                type="checkbox"
                checked={subtitleStyle.hasOutline}
                onChange={(e) =>
                  setSubtitleStyle((prev) => ({
                    ...prev,
                    hasOutline: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                Drop Shadow
              </span>
              <input
                type="checkbox"
                checked={subtitleStyle.hasShadow}
                onChange={(e) =>
                  setSubtitleStyle((prev) => ({
                    ...prev,
                    hasShadow: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Vertical Position */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300">
              Vertical Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['bottom', 'middle', 'top'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() =>
                    setSubtitleStyle((prev) => ({
                      ...prev,
                      position: pos,
                      yOffset: pos === 'bottom' ? 88 : pos === 'middle' ? 50 : 14,
                    }))
                  }
                  className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                    subtitleStyle.position === pos
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
