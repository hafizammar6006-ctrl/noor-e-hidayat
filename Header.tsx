import React from 'react';
import {
  BookOpen,
  DownloadCloud,
  Headphones,
  Search,
  SlidersHorizontal,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Reciter } from '../types/quran';
import { RECITERS } from '../data/surahs';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedReciter: Reciter;
  onSelectReciter: (r: Reciter) => void;
  downloadCount: number;
  onOpenDownloads: () => void;
  onOpenAudioTester: () => void;
  arabicFontSize: number;
  urduFontSize: number;
  onChangeArabicFontSize: (delta: number) => void;
  onChangeUrduFontSize: (delta: number) => void;
  isOnline: boolean;
  onBackToHome?: () => void;
  isReadingSurah: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedReciter,
  onSelectReciter,
  downloadCount,
  onOpenDownloads,
  onOpenAudioTester,
  arabicFontSize,
  urduFontSize,
  onChangeArabicFontSize,
  onChangeUrduFontSize,
  isOnline,
  onBackToHome,
  isReadingSurah,
}) => {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-emerald-950/60 shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div
            onClick={onBackToHome}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-amber-300 shadow-md shadow-emerald-900/40 border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-urdu text-amber-400 tracking-wide drop-shadow-sm">
                  نُورِ ہدایت
                </h1>
                <span className="text-[10px] font-sans-en font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                  القرآن الکریم
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-urdu hidden sm:block">
                مستند قراء کی مکمل سورت و انفرادی آیات کی تلاوت مع اردو ترجمہ
              </p>
            </div>
          </div>

          {/* Quick search input (if not reading surah) */}
          {!isReadingSurah && (
            <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="سورت کا نام یا نمبر تلاش کریں (مثلاً: الفاتحة، یٰسٓ، الملک، 67)..."
                className="w-full bg-stone-800/90 text-stone-100 placeholder-stone-500 text-sm font-urdu rounded-xl px-10 py-2 border border-emerald-900/50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-right"
              />
              <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3" />
            </div>
          )}

          {/* Action buttons & controls */}
          <div className="flex items-center gap-2">
            {/* Online/Offline indicator */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-urdu border ${
                isOnline
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
              }`}
              title={isOnline ? 'انٹرنیٹ فعال ہے' : 'آف لائن موڈ'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'آن لائن' : 'آف لائن'}</span>
            </div>

            {/* Qari Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedReciter.id}
                onChange={(e) => {
                  const r = RECITERS.find((x) => x.id === e.target.value);
                  if (r) onSelectReciter(r);
                }}
                className="bg-stone-800 text-amber-300 font-urdu text-xs sm:text-sm rounded-xl px-3 py-2 pr-8 border border-emerald-800/60 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer appearance-none text-right"
                title="منتخب قاری برائے تلاوت"
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-stone-900 text-stone-100">
                    {r.nameUrdu}
                  </option>
                ))}
              </select>
              <Volume2 className="w-4 h-4 text-emerald-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Audio Testing and Verification Button */}
            <button
              onClick={onOpenAudioTester}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600/20 to-amber-500/10 hover:from-amber-600/30 hover:to-amber-500/20 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-urdu font-medium transition-all shadow-sm"
              title="آڈیو تصدیق اور ٹیسٹنگ ٹول"
            >
              <Headphones className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">آڈیو تصدیق</span>
            </button>

            {/* Offline Downloads modal button */}
            <button
              onClick={onOpenDownloads}
              className="relative p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-emerald-300 hover:bg-stone-700/80 border border-emerald-900/50 transition-all"
              title="آف لائن ڈاؤن لوڈز"
            >
              <DownloadCloud className="w-4 h-4" />
              {downloadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-stone-900 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {downloadCount}
                </span>
              )}
            </button>

            {/* Settings & Font Size Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-amber-300 hover:bg-stone-700/80 border border-emerald-900/50 transition-all"
              title="فونٹ سائز ترتیبات"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {!isReadingSurah && (
          <div className="mt-3 md:hidden relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="سورت کا نام یا نمبر تلاش کریں..."
              className="w-full bg-stone-800 text-stone-100 placeholder-stone-500 text-sm font-urdu rounded-xl px-10 py-2 border border-emerald-900/50 focus:outline-none focus:border-amber-500 transition-all text-right"
            />
            <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3" />
          </div>
        )}

        {/* Font size settings dropdown panel */}
        {showSettings && (
          <div className="mt-3 p-4 bg-stone-800/95 border border-emerald-800/50 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-300 font-urdu">عربی خط کا سائز:</span>
              <div className="flex items-center gap-1.5 bg-stone-900 px-2 py-1 rounded-lg border border-stone-700">
                <button
                  onClick={() => onChangeArabicFontSize(-2)}
                  className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="text-xs font-mono w-6 text-center text-amber-300">{arabicFontSize}</span>
                <button
                  onClick={() => onChangeArabicFontSize(2)}
                  className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-300 font-urdu">اردو ترجمہ کا سائز:</span>
              <div className="flex items-center gap-1.5 bg-stone-900 px-2 py-1 rounded-lg border border-stone-700">
                <button
                  onClick={() => onChangeUrduFontSize(-1)}
                  className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="text-xs font-mono w-6 text-center text-amber-300">{urduFontSize}</span>
                <button
                  onClick={() => onChangeUrduFontSize(1)}
                  className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-xs text-stone-400 font-urdu">
              قاری: <span className="text-emerald-400 font-semibold">{selectedReciter.nameUrdu}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
