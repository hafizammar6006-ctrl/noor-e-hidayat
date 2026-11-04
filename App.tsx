import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Filter,
  Flame,
  Globe,
  Headphones,
  Heart,
  History,
  Moon,
  Search,
  Sparkles,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  ActiveAudioTrack,
  Ayah,
  DownloadedSurahInfo,
  PlaybackMode,
  Reciter,
  SurahMeta,
} from './types/quran';
import { ALL_SURAHS, RECITERS } from './data/surahs';
import { fetchSurahAyahs } from './services/quranApi';
import {
  deleteDownloadedSurah,
  downloadSurahAudio,
  getPlayableAudioUrl,
  getSavedDownloads,
  isSurahDownloaded,
} from './services/audioCache';
import { Header } from './components/Header';
import { SurahCard } from './components/SurahCard';
import { SurahReader } from './components/SurahReader';
import { AudioPlayer } from './components/AudioPlayer';
import { AudioTesterModal } from './components/AudioTesterModal';
import { DownloadsModal } from './components/DownloadsModal';

export default function App() {
  // App state
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [currentAyahs, setCurrentAyahs] = useState<Ayah[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'makki' | 'madani' | 'bookmarks' | 'favorites'>('all');
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('noor_hidayat_bookmarks');
      return saved ? JSON.parse(saved) : [1, 36, 67, 112];
    } catch {
      return [1, 36, 67, 112];
    }
  });

  // Typography settings
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    const s = localStorage.getItem('noor_arabic_font_size');
    return s ? Number(s) : 28;
  });
  const [urduFontSize, setUrduFontSize] = useState<number>(() => {
    const s = localStorage.getItem('noor_urdu_font_size');
    return s ? Number(s) : 16;
  });

  // Selected authentic Qari
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(() => {
    const savedId = localStorage.getItem('noor_selected_reciter');
    const found = RECITERS.find((r) => r.id === savedId);
    return found || RECITERS[0]; // Sheikh Mishary Rashid Alafasy by default
  });

  // Audio Playback State
  const [activeTrack, setActiveTrack] = useState<ActiveAudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Offline downloads state
  const [downloads, setDownloads] = useState<DownloadedSurahInfo[]>([]);
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<number, number>>({});
  const [downloadingSurahs, setDownloadingSurahs] = useState<Record<number, boolean>>({});

  // Modals state
  const [isTesterOpen, setIsTesterOpen] = useState<boolean>(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Hidden HTML5 Audio Element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync downloads list
  const refreshDownloads = () => {
    setDownloads(getSavedDownloads());
  };

  useEffect(() => {
    refreshDownloads();
  }, []);

  // Save font sizes
  useEffect(() => {
    localStorage.setItem('noor_arabic_font_size', String(arabicFontSize));
  }, [arabicFontSize]);
  useEffect(() => {
    localStorage.setItem('noor_urdu_font_size', String(urduFontSize));
  }, [urduFontSize]);

  // Save selected reciter
  useEffect(() => {
    localStorage.setItem('noor_selected_reciter', selectedReciter.id);
  }, [selectedReciter]);

  // Fetch ayahs when reading a surah
  useEffect(() => {
    if (selectedSurahNumber !== null) {
      setIsLoadingAyahs(true);
      fetchSurahAyahs(selectedSurahNumber)
        .then((data) => {
          setCurrentAyahs(data);
          setIsLoadingAyahs(false);
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch((err) => {
          console.error(err);
          setIsLoadingAyahs(false);
        });
    }
  }, [selectedSurahNumber]);

  // Handle Audio Element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoadingAudio(false);
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onPlaying = () => {
      setIsBuffering(false);
      setIsLoadingAudio(false);
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    // REQUIREMENT 1 & 2: When audio finishes
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);

      // If playing in single_ayah mode: STOP! Do not continue to next ayah automatically.
      if (activeTrack?.mode === 'single_ayah') {
        // Paused after single ayah - user explicitly requested:
        // "آیت پر دبانے سے صرف اسی آیت کی تلاوت ہو"
        return;
      }

      // If looping is on in full_surah mode:
      if (isLooping && activeTrack?.mode === 'full_surah') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
    };

    // REQUIREMENT 5: If audio fails to load, give honest error message! Never mock with AI voice.
    const onError = () => {
      setIsLoadingAudio(false);
      setIsBuffering(false);
      setIsPlaying(false);
      const reciterName = activeTrack?.reciter.nameUrdu || selectedReciter.nameUrdu;
      setErrorMessage(
        `معذرت! منتخب قاری (${reciterName}) کی مکمل سورت کی اصل آڈیو سرور سے لوڈ نہیں ہو سکی۔ برائے مہربانی انٹرنیٹ کنکشن چیک کریں یا دوسرا قاری منتخب کریں۔ ہم کسی مصنوعی (AI) آواز کو قرآن کی تلاوت کا متبادل نہیں بناتے۔`
      );
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [activeTrack, isLooping, selectedReciter]);

  // REQUIREMENT 2: PLAY FULL SURAH CONTINUOUSLY
  const handlePlayFullSurah = async (surah: SurahMeta, reciterToUse = selectedReciter) => {
    setErrorMessage(null);
    setIsLoadingAudio(true);

    const onlineUrl = reciterToUse.fullSurahUrlPattern(surah.number);
    // Check if available offline in cache
    const { url: playableUrl, isOffline } = await getPlayableAudioUrl(onlineUrl);

    const track: ActiveAudioTrack = {
      mode: 'full_surah',
      surahNumber: surah.number,
      surahNameArabic: surah.name,
      surahNameUrdu: surah.urduName,
      reciter: reciterToUse,
      audioUrl: playableUrl,
      isOffline,
    };

    setActiveTrack(track);

    if (audioRef.current) {
      audioRef.current.src = playableUrl;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.load();
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Playback initiation error:', err);
        // If primary URL failed and backup exists:
        if (reciterToUse.fullSurahBackupUrlPattern) {
          const backupUrl = reciterToUse.fullSurahBackupUrlPattern(surah.number);
          try {
            audioRef.current.src = backupUrl;
            track.audioUrl = backupUrl;
            await audioRef.current.play();
            setIsPlaying(true);
            return;
          } catch {
            // failed backup
          }
        }
        setErrorMessage(
          `معذرت! اس سورت کی مکمل اصل آڈیو فی الوقت دستیاب نہیں ہو سکی۔ برائے مہربانی انٹرنیٹ کنکشن چیک کریں یا دوسرا قاری منتخب کریں۔`
        );
      }
    }
  };

  // REQUIREMENT 1: PLAY ONLY THIS SINGLE AYAH
  const handlePlaySingleAyah = async (surah: SurahMeta, ayah: Ayah, reciterToUse = selectedReciter) => {
    setErrorMessage(null);
    setIsLoadingAudio(true);

    // Single ayah authentic recitation URL from Islamic Network edition
    const ayahAudioUrl = `https://cdn.islamic.network/quran/audio/128/${reciterToUse.ayahAudioEdition}/${ayah.numberInQuran}.mp3`;
    // Backup: everyayah
    const paddedSurah = String(surah.number).padStart(3, '0');
    const paddedAyah = String(ayah.numberInSurah).padStart(3, '0');
    const backupAyahUrl = `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`;

    const { url: playableUrl, isOffline } = await getPlayableAudioUrl(ayahAudioUrl);

    const track: ActiveAudioTrack = {
      mode: 'single_ayah',
      surahNumber: surah.number,
      ayahNumber: ayah.numberInSurah,
      globalAyahNumber: ayah.numberInQuran,
      surahNameArabic: surah.name,
      surahNameUrdu: surah.urduName,
      reciter: reciterToUse,
      audioUrl: playableUrl,
      isOffline,
    };

    setActiveTrack(track);

    if (audioRef.current) {
      audioRef.current.src = playableUrl;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.load();
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        // Try backup URL
        try {
          audioRef.current.src = backupAyahUrl;
          track.audioUrl = backupAyahUrl;
          await audioRef.current.play();
          setIsPlaying(true);
        } catch {
          setErrorMessage(`معذرت! آیت نمبر ${ayah.numberInSurah} کی آڈیو لوڈ نہ ہو سکی۔`);
        }
      }
    }
  };

  // Toggle Play / Pause
  const handleTogglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.error('Play failed:', err);
      });
    }
  };

  // Seek / Scrubber
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Skip +10s / -10s
  const handleSkipTime = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Playback Speed
  const handleChangeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Volume & Mute
  const handleChangeVolume = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume || 1;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  // REQUIREMENT 3: DOWNLOAD SURAH FOR OFFLINE PLAYBACK
  const handleDownloadSurah = async (surah: SurahMeta) => {
    setDownloadingSurahs((prev) => ({ ...prev, [surah.number]: true }));
    setDownloadProgressMap((prev) => ({ ...prev, [surah.number]: 5 }));

    const res = await downloadSurahAudio(
      surah.number,
      surah.name,
      surah.urduName,
      selectedReciter,
      (pct) => {
        setDownloadProgressMap((prev) => ({ ...prev, [surah.number]: pct }));
      }
    );

    setDownloadingSurahs((prev) => ({ ...prev, [surah.number]: false }));

    if (res.success) {
      refreshDownloads();
    } else {
      setErrorMessage(res.error || 'ڈاؤن لوڈ میں مسئلہ پیش آیا۔');
    }
  };

  // Delete downloaded surah
  const handleDeleteDownload = async (item: DownloadedSurahInfo) => {
    const reciter = RECITERS.find((r) => r.id === item.reciterId) || selectedReciter;
    const url = reciter.fullSurahUrlPattern(item.surahNumber);
    await deleteDownloadedSurah(item.surahNumber, item.reciterId, url);
    refreshDownloads();
  };

  // Play from Downloads Modal
  const handlePlayOfflineSurah = (item: DownloadedSurahInfo) => {
    const s = ALL_SURAHS.find((x) => x.number === item.surahNumber);
    const r = RECITERS.find((x) => x.id === item.reciterId) || selectedReciter;
    if (s) {
      handlePlayFullSurah(s, r);
    }
  };

  // Navigation: Next / Prev Surah in Player
  const handleNextTrack = () => {
    if (!activeTrack) return;
    const nextNum = activeTrack.surahNumber < 114 ? activeTrack.surahNumber + 1 : 1;
    const nextSurah = ALL_SURAHS.find((s) => s.number === nextNum);
    if (nextSurah) handlePlayFullSurah(nextSurah);
  };

  const handlePrevTrack = () => {
    if (!activeTrack) return;
    const prevNum = activeTrack.surahNumber > 1 ? activeTrack.surahNumber - 1 : 114;
    const prevSurah = ALL_SURAHS.find((s) => s.number === prevNum);
    if (prevSurah) handlePlayFullSurah(prevSurah);
  };

  // Filter Surahs
  const filteredSurahs = ALL_SURAHS.filter((surah) => {
    const matchesSearch =
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.urduName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.urduMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(surah.number) === searchQuery.trim();

    if (!matchesSearch) return false;

    if (selectedCategory === 'makki') return surah.revelationType === 'مکی';
    if (selectedCategory === 'madani') return surah.revelationType === 'مدنی';
    if (selectedCategory === 'bookmarks') return bookmarks.includes(surah.number);

    return true;
  });

  const selectedSurahMeta = ALL_SURAHS.find((s) => s.number === selectedSurahNumber);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-stone-100 flex flex-col font-urdu selection:bg-emerald-800 selection:text-emerald-100">
      {/* Hidden Native HTML5 Audio Element */}
      <audio ref={audioRef} preload="auto" className="hidden" />

      {/* Main App Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedReciter={selectedReciter}
        onSelectReciter={setSelectedReciter}
        downloadCount={downloads.length}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        onOpenAudioTester={() => setIsTesterOpen(true)}
        arabicFontSize={arabicFontSize}
        urduFontSize={urduFontSize}
        onChangeArabicFontSize={(delta) => setArabicFontSize((prev) => Math.min(Math.max(prev + delta, 18), 48))}
        onChangeUrduFontSize={(delta) => setUrduFontSize((prev) => Math.min(Math.max(prev + delta, 12), 26))}
        isOnline={isOnline}
        onBackToHome={() => setSelectedSurahNumber(null)}
        isReadingSurah={selectedSurahNumber !== null}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {selectedSurahMeta ? (
          /* SURAH READER VIEW */
          <SurahReader
            surah={selectedSurahMeta}
            ayahs={currentAyahs}
            isLoadingAyahs={isLoadingAyahs}
            selectedReciter={selectedReciter}
            currentPlaybackMode={activeTrack?.mode || null}
            activeSurahNumber={activeTrack?.surahNumber || null}
            activeAyahNumber={activeTrack?.ayahNumber || null}
            isPlaying={isPlaying}
            arabicFontSize={arabicFontSize}
            urduFontSize={urduFontSize}
            onBack={() => setSelectedSurahNumber(null)}
            onPlayFullSurah={handlePlayFullSurah}
            onPlaySingleAyah={handlePlaySingleAyah}
            onTogglePlayPause={handleTogglePlayPause}
            onDownloadSurah={handleDownloadSurah}
            isDownloaded={downloads.some(
              (d) => d.surahNumber === selectedSurahMeta.number && d.reciterId === selectedReciter.id
            )}
            isDownloading={Boolean(downloadingSurahs[selectedSurahMeta.number])}
            downloadProgress={downloadProgressMap[selectedSurahMeta.number] || 0}
            onSelectPreviousSurah={() => {
              if (selectedSurahMeta.number > 1) {
                setSelectedSurahNumber(selectedSurahMeta.number - 1);
              }
            }}
            onSelectNextSurah={() => {
              if (selectedSurahMeta.number < 114) {
                setSelectedSurahNumber(selectedSurahMeta.number + 1);
              }
            }}
          />
        ) : (
          /* ALL SURAHS DIRECTORY VIEW */
          <div className="space-y-6 pb-28">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-stone-900 to-amber-950/40 p-6 sm:p-8 border border-emerald-900/60 shadow-xl">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 text-xs font-urdu mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>قرآنِ مجید کی با برکت تلاوت اور ترجمہ</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-arabic text-amber-300 drop-shadow">
                    شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 font-urdu mt-1 max-w-2xl leading-relaxed">
                    ہر سورت کے لیے مکمل مسلسل تلاوت اور انفرادی آیات کی الگ الگ سماعت کی جدید ترین
                    سہولت۔ مستند قراء کے انتخاب اور بغیر انٹرنیٹ (آف لائن) سننے کی سہولت کے ساتھ۔
                  </p>
                </div>

                {/* Quick Action Badges */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsTesterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-urdu transition-all shadow-sm"
                  >
                    <Headphones className="w-4 h-4 text-amber-400" />
                    <span>آڈیو تصدیق و ٹیسٹنگ</span>
                  </button>

                  <button
                    onClick={() => {
                      const fatihah = ALL_SURAHS[0];
                      handlePlayFullSurah(fatihah);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-urdu font-bold transition-all shadow-md"
                  >
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span>سورۃ الفاتحہ مکمل سنیں</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Category / Filter Tabs */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-urdu transition-all whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-800 text-white font-bold shadow-md shadow-emerald-950'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80 hover:text-white'
                  }`}
                >
                  تمام سورتیں (114)
                </button>
                <button
                  onClick={() => setSelectedCategory('makki')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-urdu transition-all whitespace-nowrap ${
                    selectedCategory === 'makki'
                      ? 'bg-amber-800 text-amber-100 font-bold shadow-md'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80'
                  }`}
                >
                  مکی سورتیں (86)
                </button>
                <button
                  onClick={() => setSelectedCategory('madani')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-urdu transition-all whitespace-nowrap ${
                    selectedCategory === 'madani'
                      ? 'bg-emerald-900 text-emerald-100 font-bold shadow-md'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80'
                  }`}
                >
                  مدنی سورتیں (28)
                </button>
                <button
                  onClick={() => setSelectedCategory('bookmarks')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-urdu transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === 'bookmarks'
                      ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700/80'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span>پسندیدہ سورتیں</span>
                </button>
              </div>

              <div className="text-xs text-stone-400 font-urdu hidden sm:block whitespace-nowrap">
                نتائج: <span className="text-emerald-400 font-bold">{filteredSurahs.length}</span> سورتیں
              </div>
            </div>

            {/* Surah Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurahs.map((surah) => {
                const isThisCurrent =
                  activeTrack?.surahNumber === surah.number && activeTrack.mode === 'full_surah';
                const isDownloaded = downloads.some(
                  (d) => d.surahNumber === surah.number && d.reciterId === selectedReciter.id
                );
                const isDownloading = Boolean(downloadingSurahs[surah.number]);
                const progress = downloadProgressMap[surah.number] || 0;

                return (
                  <SurahCard
                    key={surah.number}
                    surah={surah}
                    onOpenSurah={setSelectedSurahNumber}
                    onPlayFullSurah={handlePlayFullSurah}
                    onDownloadSurah={handleDownloadSurah}
                    isCurrentPlayingSurah={isThisCurrent}
                    isPlaying={isPlaying}
                    isDownloaded={isDownloaded}
                    isDownloading={isDownloading}
                    downloadProgress={progress}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Persistent Audio Player Dock */}
      <AudioPlayer
        activeTrack={activeTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        isLoading={isLoadingAudio}
        isBuffering={isBuffering}
        errorMessage={errorMessage}
        playbackSpeed={playbackSpeed}
        isLooping={isLooping}
        volume={volume}
        isMuted={isMuted}
        onTogglePlayPause={handleTogglePlayPause}
        onSeek={handleSeek}
        onSkipTime={handleSkipTime}
        onChangeSpeed={handleChangeSpeed}
        onToggleLoop={() => setIsLooping(!isLooping)}
        onChangeVolume={handleChangeVolume}
        onToggleMute={handleToggleMute}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onClosePlayer={() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          setActiveTrack(null);
          setErrorMessage(null);
        }}
      />

      {/* Audio Verification & Diagnostic Modal */}
      <AudioTesterModal
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        activeTrack={activeTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        selectedReciter={selectedReciter}
        onSelectReciter={setSelectedReciter}
        onTestPlayFullSurah={(num) => {
          const s = ALL_SURAHS.find((x) => x.number === num);
          if (s) handlePlayFullSurah(s);
        }}
        onTestPlaySingleAyah={(surahNum, ayahNum) => {
          const s = ALL_SURAHS.find((x) => x.number === surahNum);
          if (s) {
            handlePlaySingleAyah(s, {
              numberInSurah: ayahNum,
              numberInQuran: ayahNum,
              text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
              translation: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
            });
          }
        }}
      />

      {/* Offline Downloads Modal */}
      <DownloadsModal
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
        downloads={downloads}
        onPlayOfflineSurah={handlePlayOfflineSurah}
        onDeleteDownload={handleDeleteDownload}
      />
    </div>
  );
}
