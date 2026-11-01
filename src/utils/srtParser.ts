import { Subtitle, SubtitleLanguage } from '../types';
import { formatSRTTime, parseSRTTime } from './timeFormat';

/**
 * Generate standard SubRip (.srt) text from Subtitle array
 */
export function generateSRTContent(subtitles: Subtitle[]): string {
  const sorted = [...subtitles].sort((a, b) => a.startTime - b.startTime);

  return sorted
    .map((sub, index) => {
      const idx = index + 1;
      const start = formatSRTTime(sub.startTime);
      const end = formatSRTTime(sub.endTime);
      return `${idx}\n${start} --> ${end}\n${sub.text.trim()}\n`;
    })
    .join('\n');
}

/**
 * Trigger immediate download of SRT file in the browser with proper UTF-8 BOM
 * to ensure Urdu and Arabic characters display correctly in VLC, Premiere, etc.
 */
export function downloadSRTFile(subtitles: Subtitle[], baseFilename = 'creatorcut_subtitles'): void {
  const srtContent = generateSRTContent(subtitles);
  // Add UTF-8 BOM (\uFEFF) so media players know it is UTF-8 encoded text for Urdu
  const blob = new Blob(['\uFEFF' + srtContent], { type: 'text/srt;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseFilename.replace(/\.[^/.]+$/, '')}.srt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse an SRT string into Subtitle items
 */
export function parseSRTFile(content: string, defaultLang: SubtitleLanguage = 'en'): Subtitle[] {
  // Normalize line endings
  const cleanContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const blocks = cleanContent.split(/\n\s*\n/);
  const results: Subtitle[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    // Line 0 is usually index (e.g. 1) or timestamp
    let timeLineIdx = 1;
    if (lines[0].includes('-->')) {
      timeLineIdx = 0;
    }

    const timeLine = lines[timeLineIdx];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
    const startTime = parseSRTTime(startStr);
    const endTime = parseSRTTime(endStr);

    const textLines = lines.slice(timeLineIdx + 1);
    const text = textLines.join('\n').trim();

    if (!text) continue;

    // Detect if text contains Urdu/Arabic characters
    const isUrduChar = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
    const detectedLang: SubtitleLanguage = isUrduChar ? 'ur' : defaultLang;

    results.push({
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      startTime,
      endTime,
      text,
      language: detectedLang,
    });
  }

  return results;
}

/**
 * Preset subtitle templates for English, Urdu, and Roman Urdu
 */
export const SUBTITLE_PRESETS = {
  en: [
    { text: "Welcome back to the channel!", duration: 2.5 },
    { text: "Don't forget to like and subscribe!", duration: 3 },
    { text: "Drop your thoughts in the comments below.", duration: 3.5 },
    { text: "Let's dive right into the video!", duration: 2.5 },
    { text: "Thanks for watching everyone!", duration: 2.5 },
  ],
  ur: [
    { text: "السلام علیکم اور خوش آمدید!", duration: 2.5 },
    { text: "ویڈیو کو لائک اور شیئر ضرور کریں!", duration: 3 },
    { text: "اپنی قیمتی رائے کمنٹس میں بتائیں۔", duration: 3.5 },
    { text: "چینل کو سبسکرائب کرنا نہ بھولیں!", duration: 3 },
    { text: "دیکھنے کا بہت بہت شکریہ!", duration: 2.5 },
  ],
  'roman-ur': [
    { text: "Salam dosto, CreatorCut mein welcome!", duration: 3 },
    { text: "Video ko like aur dosto k sath share karein!", duration: 3 },
    { text: "Comment section mein batayein kaisa laga?", duration: 3.5 },
    { text: "Channel ko subscribe karna mat bhooliye ga!", duration: 3 },
    { text: "Aap sab ka dekhne ka bohat shukriya!", duration: 2.5 },
  ],
};
