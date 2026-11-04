import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Headphones,
  Pause,
  Play,
  Share2,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { Ayah, PlaybackMode, Reciter, SurahMeta } from '../types/quran';

interface SurahReaderProps {
  surah: SurahMeta;
  ayahs: Ayah[];
  isLoadingAyahs: boolean;
  selectedReciter: Reciter;
  currentPlaybackMode: PlaybackMode | null;
  activeSurahNumber: number | null;
  activeAyahNumber: number | null;
  isPlaying: boolean;
  arabicFontSize: number;
  urduFontSize: number;
  onBack: () => void;
  onPlayFullSurah: (surah: SurahMeta) => void;
  onPlaySingleAyah: (surah: SurahMeta, ayah: Ayah) => void;
  onTogglePlayPause: () => void;
  onDownloadSurah: (surah: SurahMeta) => void;
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  onSelectPreviousSurah?: () => void;
  onSelectNextSurah?: () => void;
}

export const SurahReader: React.FC<SurahReaderProps> = ({
  surah,
  ayahs,
  isLoadingAyahs,
  selectedReciter,
  currentPlaybackMode,
  activeSurahNumber,
  activeAyahNumber,
  isPlaying,
  arabicFontSize,
  urduFontSize,
  onBack,
  onPlayFullSurah,
  onPlaySingleAyah,
  onTogglePlayPause,
  onDownloadSurah,
  isDownloaded,
  isDownloading,
  downloadProgress,
  onSelectPreviousSurah,
  onSelectNextSurah,
}) => {
  const [copiedAyah, setCopiedAyah] = React.useState<number | null>(null);

  const isFullSurahActive =
    activeSurahNumber === surah.number && currentPlaybackMode === 'full_surah';

  const copyAyahText = (ayah: Ayah) => {
    const textToCopy = `${ayah.text}\n${ayah.translation}\n[سورۃ ${surah.name} : آیت ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(ayah.numberInSurah);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 px-4 sm:px-6">
      {/* Top Navigation & Surah Header Bar */}
      <div className="flex items-center justify-between py-4 mb-6 border-b border-emerald-950">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-urdu border border-stone-700/80 transition-all"
        >
          <ArrowRight className="w-4 h-4 text-emerald-400" />
          <span>تمام سورتوں کی فہرست</span>
        </button>

        {/* Prev / Next Surah controls */}
        <div className="flex items-center gap-2">
          {onSelectPreviousSurah && surah.number > 1 && (
            <button
              onClick={onSelectPreviousSurah}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-urdu border border-stone-700/60 transition-all"
              title="پچھلی سورت"
            >
              <ChevronRight className="w-4 h-4" />
              <span>پچھلی سورت</span>
            </button>
          )}
          {onSelectNextSurah && surah.number < 114 && (
            <button
              onClick={onSelectNextSurah}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-urdu border border-stone-700/60 transition-all"
              title="اگلی سورت"
            >
              <span>اگلی سورت</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Surah Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-800/90 via-stone-900/95 to-stone-950 p-6 sm:p-8 border border-emerald-900/70 shadow-2xl mb-8">
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-urdu mb-3">
            <span>سورت نمبر {surah.number}</span>
            <span>•</span>
            <span>{surah.revelationType}</span>
            <span>•</span>
            <span>{surah.numberOfAyahs} آیات</span>
            <span>•</span>
            <span>پارہ {surah.juz}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold font-arabic text-amber-400 drop-shadow-md mb-2">
            {surah.name}
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold font-urdu text-stone-200 mb-1">
            {surah.urduName}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-urdu mb-6">
            معنی و مفہوم: <span className="text-amber-200/90">{surah.urduMeaning}</span>
          </p>

          {/* PROMINENT FULL SURAH AUDIO BUTTON - Requirement 2 */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-stone-800/80">
            <button
              onClick={() => {
                if (isFullSurahActive) {
                  onTogglePlayPause();
                } else {
                  onPlayFullSurah(surah);
                }
              }}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-urdu font-bold transition-all transform active:scale-95 shadow-lg ${
                isFullSurahActive && isPlaying
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/30 ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-900/50'
              }`}
              title="پوری سورت کی مکمل اور مسلسل تلاوت سنیں"
            >
              {isFullSurahActive && isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>مکمل تلاوت موقوف کریں (Pause)</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current text-amber-300" />
                  <span>پوری سورت سنیں (مکمل آڈیو)</span>
                </>
              )}
            </button>

            {/* Offline download button */}
            <button
              onClick={() => {
                if (!isDownloading && !isDownloaded) {
                  onDownloadSurah(surah);
                }
              }}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-urdu font-medium border transition-all ${
                isDownloaded
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 cursor-default shadow-sm'
                  : isDownloading
                  ? 'bg-stone-800 text-amber-300 border-amber-600/60 animate-pulse'
                  : 'bg-stone-800/90 hover:bg-stone-700 text-stone-200 border-emerald-900/80 hover:border-emerald-600'
              }`}
              title={
                isDownloaded
                  ? 'یہ سورت پہلے سے ڈاؤن لوڈ ہے، بغیر انٹرنیٹ بھی سنی جا سکتی ہے'
                  : 'مکمل سورت کو آف لائن سننے کے لیے ڈاؤن لوڈ کریں'
              }
            >
              {isDownloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ڈاؤن لوڈ شدہ (آف لائن دستیاب)</span>
                </>
              ) : isDownloading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></span>
                  <span>ڈاؤن لوڈنگ: {downloadProgress}%</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>آف لائن کے لیے ڈاؤن لوڈ کریں</span>
                </>
              )}
            </button>
          </div>

          {/* Current Reciter badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-stone-950/60 border border-stone-800 text-xs text-stone-300 font-urdu">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>منتخب قاری:</span>
            <span className="text-amber-300 font-semibold">{selectedReciter.nameUrdu}</span>
          </div>
        </div>
      </div>

      {/* Bismillah Calligraphy (Shown for all except Surah At-Tawbah #9) */}
      {surah.number !== 9 && (
        <div className="text-center my-8 py-5 bg-stone-900/60 rounded-2xl border border-emerald-950/80">
          <p className="text-3xl sm:text-4xl font-arabic text-amber-300/90 tracking-wide select-none drop-shadow">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-xs text-stone-400 font-urdu mt-2">
            شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
          </p>
        </div>
      )}

      {/* Ayahs List */}
      {isLoadingAyahs ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-300 font-urdu text-sm">قرآنی آیات اور اردو ترجمہ لوڈ ہو رہا ہے...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ayahs.map((ayah) => {
            const isThisAyahActive =
              activeSurahNumber === surah.number &&
              activeAyahNumber === ayah.numberInSurah &&
              currentPlaybackMode === 'single_ayah';

            return (
              <div
                key={ayah.numberInSurah}
                id={`ayah-${ayah.numberInSurah}`}
                className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-300 border ${
                  isThisAyahActive
                    ? 'bg-stone-800/90 border-amber-500/90 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/10'
                    : 'bg-stone-900/80 hover:bg-stone-850 border-emerald-950/80 hover:border-emerald-800/60'
                }`}
              >
                {/* Ayah Top Meta & Actions Bar */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-800/80">
                  {/* Ayah Badge */}
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-stone-800 border border-emerald-900/60 flex items-center justify-center text-xs font-mono font-bold text-amber-300 shadow-inner">
                      {ayah.numberInSurah}
                    </span>
                    <span className="text-[11px] text-stone-400 font-urdu">
                      آیت نمبر {ayah.numberInSurah}
                    </span>
                  </div>

                  {/* Actions for this Ayah */}
                  <div className="flex items-center gap-2">
                    {/* REQUIREMENT 1: "صرف یہ آیت سنیں" (Single Ayah Play) */}
                    <button
                      onClick={() => onPlaySingleAyah(surah, ayah)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-urdu font-medium transition-all shadow-sm ${
                        isThisAyahActive && isPlaying
                          ? 'bg-amber-500 text-stone-950 font-bold ring-2 ring-amber-300'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
                      }`}
                      title="صرف اسی ایک آیت کی تلاوت سنیں"
                    >
                      {isThisAyahActive && isPlaying ? (
                        <>
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 bg-stone-950 animate-wave-1 rounded-full"></span>
                            <span className="w-1 bg-stone-950 animate-wave-2 rounded-full"></span>
                            <span className="w-1 bg-stone-950 animate-wave-3 rounded-full"></span>
                          </div>
                          <span>تلاوت جاری ہے</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-amber-400 fill-current" />
                          <span>صرف یہ آیت سنیں</span>
                        </>
                      )}
                    </button>

                    {/* Copy Ayah text */}
                    <button
                      onClick={() => copyAyahText(ayah)}
                      className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700/60 transition-colors"
                      title="آیت اور ترجمہ کاپی کریں"
                    >
                      {copiedAyah === ayah.numberInSurah ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Text (Clickable to play this ayah) */}
                <div
                  onClick={() => onPlaySingleAyah(surah, ayah)}
                  className="cursor-pointer text-right mb-4 select-text"
                  title="اس آیت کی تلاوت سننے کے لیے کلک کریں"
                >
                  <p
                    className="font-arabic leading-loose text-amber-100 tracking-wide transition-colors group-hover:text-amber-200"
                    style={{ fontSize: `${arabicFontSize}px`, lineHeight: 2.2 }}
                  >
                    {ayah.text}
                    <span className="inline-block text-amber-500 mx-2 text-2xl align-middle font-mono select-none">
                      ۝{ayah.numberInSurah}
                    </span>
                  </p>
                </div>

                {/* Urdu Translation */}
                <div className="text-right pt-3 border-t border-stone-800/60">
                  <p
                    className="font-urdu leading-relaxed text-stone-300 font-normal"
                    style={{ fontSize: `${urduFontSize}px`, lineHeight: 1.9 }}
                  >
                    {ayah.translation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
