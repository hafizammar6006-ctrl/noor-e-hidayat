import React from 'react';
import { CheckCircle2, Download, Headphones, Play, Sparkles } from 'lucide-react';
import { SurahMeta } from '../types/quran';

interface SurahCardProps {
  surah: SurahMeta;
  onOpenSurah: (surahNumber: number) => void;
  onPlayFullSurah: (surah: SurahMeta) => void;
  onDownloadSurah: (surah: SurahMeta) => void;
  isCurrentPlayingSurah: boolean;
  isPlaying: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
}

export const SurahCard: React.FC<SurahCardProps> = ({
  surah,
  onOpenSurah,
  onPlayFullSurah,
  onDownloadSurah,
  isCurrentPlayingSurah,
  isPlaying,
  isDownloaded,
  isDownloading,
  downloadProgress,
}) => {
  return (
    <div
      className={`group relative bg-stone-900/90 rounded-2xl p-5 border transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between ${
        isCurrentPlayingSurah
          ? 'border-amber-500/80 bg-stone-900/95 ring-1 ring-amber-500/40 shadow-amber-500/10'
          : 'border-emerald-950/80 hover:border-emerald-600/50'
      }`}
    >
      {/* Top row: Number, Revelation type, and Arabic calligraphy */}
      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Surah Number Emblem */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-stone-800 border border-emerald-900/60 flex items-center justify-center font-mono text-emerald-400 font-bold text-sm shadow-inner group-hover:border-amber-500/50 transition-colors">
            {surah.number}
          </div>
          <div className="flex flex-col">
            <span
              className={`text-[11px] font-urdu px-2 py-0.5 rounded-md self-start border ${
                surah.revelationType === 'مکی'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
              }`}
            >
              {surah.revelationType} • {surah.numberOfAyahs} آیات
            </span>
            <span className="text-[11px] text-stone-400 font-sans-en mt-0.5">
              {surah.englishName}
            </span>
          </div>
        </div>

        {/* Arabic Name */}
        <div className="text-right">
          <h3 className="text-2xl font-bold font-arabic text-amber-400/95 tracking-wide drop-shadow-sm group-hover:text-amber-300 transition-colors">
            {surah.name}
          </h3>
          <p className="text-xs text-stone-400 font-urdu mt-0.5">{surah.urduName}</p>
        </div>
      </div>

      {/* Meaning & Details */}
      <div className="mb-4 text-right">
        <p className="text-xs text-stone-300 font-urdu">
          <span className="text-stone-500 ml-1">معنی:</span>
          {surah.urduMeaning}
        </p>
      </div>

      {/* Action buttons */}
      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2 mt-auto">
        {/* Full Surah Listen Button - Prominent Requirement 2 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayFullSurah(surah);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-urdu font-medium transition-all shadow-sm ${
            isCurrentPlayingSurah && isPlaying
              ? 'bg-amber-500 text-stone-950 font-bold shadow-amber-500/25 ring-2 ring-amber-400/50'
              : 'bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-100 border border-emerald-600/40'
          }`}
          title="پوری سورت کی مسلسل تلاوت سنیں"
        >
          {isCurrentPlayingSurah && isPlaying ? (
            <>
              <div className="flex items-center gap-0.5">
                <span className="w-1 bg-stone-950 animate-wave-1 rounded-full"></span>
                <span className="w-1 bg-stone-950 animate-wave-2 rounded-full"></span>
                <span className="w-1 bg-stone-950 animate-wave-3 rounded-full"></span>
              </div>
              <span>جاری ہے</span>
            </>
          ) : (
            <>
              <Headphones className="w-3.5 h-3.5 text-amber-300" />
              <span>پوری سورت سنیں</span>
            </>
          )}
        </button>

        {/* Read Surah with Ayahs button */}
        <button
          onClick={() => onOpenSurah(surah.number)}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-urdu bg-stone-800 hover:bg-stone-700/80 text-stone-300 hover:text-amber-300 border border-stone-700/60 transition-all"
          title="سورت کا مطالعہ مع ترجمہ و انفرادی آیات"
        >
          <span>مطالعہ</span>
        </button>

        {/* Offline Download button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isDownloading && !isDownloaded) {
              onDownloadSurah(surah);
            }
          }}
          disabled={isDownloading}
          className={`p-2 rounded-xl text-xs border transition-all ${
            isDownloaded
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 cursor-default'
              : isDownloading
              ? 'bg-stone-800 text-amber-400 border-amber-600/50 animate-pulse'
              : 'bg-stone-800 text-stone-400 hover:text-stone-200 border-stone-700 hover:border-emerald-600/50'
          }`}
          title={
            isDownloaded
              ? 'مکمل سورت ڈاؤن لوڈ ہو چکی ہے (آف لائن تیار)'
              : isDownloading
              ? `ڈاؤن لوڈ ہو رہی ہے: ${downloadProgress}%`
              : 'آف لائن سننے کے لیے ڈاؤن لوڈ کریں'
          }
        >
          {isDownloaded ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : isDownloading ? (
            <span className="text-[10px] font-mono font-bold">{downloadProgress}%</span>
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
