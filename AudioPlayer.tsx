import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FastForward,
  Headphones,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Repeat,
  Rewind,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { ActiveAudioTrack, PlaybackMode, Reciter } from '../types/quran';

interface AudioPlayerProps {
  activeTrack: ActiveAudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  isBuffering: boolean;
  errorMessage: string | null;
  playbackSpeed: number;
  isLooping: boolean;
  volume: number;
  isMuted: boolean;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  onSkipTime: (seconds: number) => void;
  onChangeSpeed: (speed: number) => void;
  onToggleLoop: () => void;
  onChangeVolume: (vol: number) => void;
  onToggleMute: () => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  onClosePlayer: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  activeTrack,
  isPlaying,
  currentTime,
  duration,
  isLoading,
  isBuffering,
  errorMessage,
  playbackSpeed,
  isLooping,
  volume,
  isMuted,
  onTogglePlayPause,
  onSeek,
  onSkipTime,
  onChangeSpeed,
  onToggleLoop,
  onChangeVolume,
  onToggleMute,
  onNextTrack,
  onPrevTrack,
  onClosePlayer,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!activeTrack && !errorMessage) return null;

  // Format seconds to mm:ss
  const formatTime = (sec: number): string => {
    if (isNaN(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900/98 border-t border-emerald-900/80 backdrop-blur-xl shadow-2xl transition-all">
      {/* If error: Display requirement 5 honest notification */}
      {errorMessage && (
        <div className="bg-red-950/90 border-b border-red-700/60 px-4 py-3 flex items-center justify-between text-red-200 text-xs sm:text-sm font-urdu">
          <div className="flex items-center gap-2 max-w-3xl">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="leading-relaxed">
              <strong className="text-red-300">اطلاع: </strong>
              {errorMessage}
            </p>
          </div>
          <button
            onClick={onClosePlayer}
            className="p-1 rounded-lg hover:bg-red-900/50 text-red-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTrack && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          {/* Top Scrubber & Time Display */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] font-mono text-stone-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            {/* Slider / Scrubber */}
            <div className="relative flex-1 flex items-center group cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400 group-hover:h-2 transition-all"
              />
              <div
                className="absolute left-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-lg pointer-events-none group-hover:h-2 transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <span className="text-[11px] font-mono text-stone-400 w-10 text-left">
              {formatTime(duration)}
            </span>
          </div>

          {/* Main Controls Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Info: Mode Badge & Track Details */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-stone-900 border border-emerald-600/50 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-inner">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-arabic font-bold text-amber-300 text-base leading-tight">
                      {activeTrack.surahNameArabic}
                    </h4>
                    {/* Explicit Mode Badge */}
                    <span
                      className={`text-[10px] font-urdu px-2 py-0.5 rounded-full border ${
                        activeTrack.mode === 'full_surah'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                      }`}
                    >
                      {activeTrack.mode === 'full_surah'
                        ? 'مکمل سورت کی اصل تلاوت'
                        : `صرف آیت نمبر ${activeTrack.ayahNumber}`}
                    </span>

                    {/* Offline playback badge */}
                    {activeTrack.isOffline && (
                      <span className="text-[10px] font-urdu px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>آف لائن</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 font-urdu mt-0.5">
                    {activeTrack.reciter.nameUrdu}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Controls: Rewind, Play/Pause, Forward, Navigation */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Previous Surah / Ayah */}
              {onPrevTrack && (
                <button
                  onClick={onPrevTrack}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                  title="پچھلی سورت"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}

              {/* Rewind -10s */}
              <button
                onClick={() => onSkipTime(-10)}
                className="p-1.5 sm:p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-stone-800 border border-transparent hover:border-stone-700 transition-all flex items-center gap-0.5 text-xs font-mono"
                title="۱۰ سیکنڈ پیچھے کریں"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px]">-10s</span>
              </button>

              {/* PLAY / PAUSE BUTTON */}
              <button
                onClick={onTogglePlayPause}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30 transform active:scale-95 transition-all"
                title={isPlaying ? 'وقفہ (Pause)' : 'چلائیں (Play)'}
              >
                {isLoading || isBuffering ? (
                  <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Fast Forward +10s */}
              <button
                onClick={() => onSkipTime(10)}
                className="p-1.5 sm:p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-stone-800 border border-transparent hover:border-stone-700 transition-all flex items-center gap-0.5 text-xs font-mono"
                title="۱۰ سیکنڈ آگے کریں"
              >
                <span className="text-[10px]">+10s</span>
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Next Surah / Ayah */}
              {onNextTrack && (
                <button
                  onClick={onNextTrack}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                  title="اگلی سورت"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right Controls: Speed, Loop, Volume, Close */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              {/* Playback speed toggle */}
              <div className="relative">
                <select
                  value={playbackSpeed}
                  onChange={(e) => onChangeSpeed(Number(e.target.value))}
                  className="bg-stone-800 text-stone-300 font-mono text-xs rounded-lg px-2 py-1 border border-stone-700 focus:outline-none cursor-pointer"
                  title="رفتار"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                </select>
              </div>

              {/* Loop / Repeat */}
              <button
                onClick={onToggleLoop}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isLooping
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
                title={isLooping ? 'تکرار فعال ہے' : 'تکرار بند ہے'}
              >
                <Repeat className="w-4 h-4" />
              </button>

              {/* Volume control */}
              <div className="hidden md:flex items-center gap-1.5">
                <button
                  onClick={onToggleMute}
                  className="text-stone-400 hover:text-stone-200 transition-colors p-1"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onChangeVolume(Number(e.target.value))}
                  className="w-16 h-1 bg-stone-700 rounded-lg appearance-none accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Close / Dismiss */}
              <button
                onClick={onClosePlayer}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors"
                title="پلیئر بند کریں"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
