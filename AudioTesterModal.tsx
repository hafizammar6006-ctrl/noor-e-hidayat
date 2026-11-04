import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Headphones,
  Music,
  Play,
  RotateCcw,
  ShieldCheck,
  Volume2,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { ActiveAudioTrack, Reciter, SurahMeta } from '../types/quran';
import { ALL_SURAHS, RECITERS } from '../data/surahs';
import { isSurahDownloaded } from '../services/audioCache';

interface AudioTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTrack: ActiveAudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  selectedReciter: Reciter;
  onSelectReciter: (r: Reciter) => void;
  onTestPlayFullSurah: (surahNumber: number) => void;
  onTestPlaySingleAyah: (surahNumber: number, ayahNumber: number) => void;
}

export const AudioTesterModal: React.FC<AudioTesterModalProps> = ({
  isOpen,
  onClose,
  activeTrack,
  isPlaying,
  currentTime,
  duration,
  selectedReciter,
  onSelectReciter,
  onTestPlayFullSurah,
  onTestPlaySingleAyah,
}) => {
  const [offlineStatusFatihah, setOfflineStatusFatihah] = React.useState<boolean>(false);
  const [offlineStatusIkhlas, setOfflineStatusIkhlas] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'test' | 'details' | 'sources'>('test');

  React.useEffect(() => {
    if (isOpen) {
      isSurahDownloaded(1, selectedReciter.id).then(setOfflineStatusFatihah);
      isSurahDownloaded(112, selectedReciter.id).then(setOfflineStatusIkhlas);
    }
  }, [isOpen, selectedReciter]);

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-amber-500/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-urdu text-lg font-bold text-amber-400">
                قرآن آڈیو کی تصدیق اور ٹیسٹنگ ٹول
              </h3>
              <p className="font-urdu text-xs text-stone-400">
                مستند قراء کی اصل تلاوت اور آف لائن آڈیو کی جانچ پڑتال
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-5 pt-2 gap-2 text-xs font-urdu">
          <button
            onClick={() => setActiveTab('test')}
            className={`py-2 px-4 border-b-2 font-medium transition-all ${
              activeTab === 'test'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            براہ راست ٹیسٹنگ (Live Test)
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-4 border-b-2 font-medium transition-all ${
              activeTab === 'details'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            فعال آڈیو کے تکنیکی کوائف
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-2 px-4 border-b-2 font-medium transition-all ${
              activeTab === 'sources'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            مستند ذرائع (Authentic Sources)
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-6 text-right flex-1">
          {activeTab === 'test' && (
            <div className="space-y-5">
              {/* Reciter selector for test */}
              <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700/80 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-urdu text-stone-300">
                  ٹیسٹ کے لیے قاری تبدیل کریں:
                </span>
                <select
                  value={selectedReciter.id}
                  onChange={(e) => {
                    const r = RECITERS.find((x) => x.id === e.target.value);
                    if (r) onSelectReciter(r);
                  }}
                  className="bg-stone-900 text-amber-300 font-urdu text-xs rounded-xl px-3 py-2 border border-emerald-800"
                >
                  {RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameUrdu}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Cases List */}
              <div className="space-y-3">
                <h4 className="text-xs font-urdu font-bold text-emerald-400">
                  ۱. مکمل سورت کی مسلسل اصل آڈیو کا فوری ٹیسٹ (Full Surah Continuous Test):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Surah Fatihah Full */}
                  <div className="p-4 bg-stone-950/70 border border-emerald-900/60 rounded-2xl flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-arabic text-amber-300">
                          سورۃ الفاتحة (مکمل سورت)
                        </span>
                        <span className="text-[10px] font-urdu text-stone-400">۷ آیات</span>
                      </div>
                      <p className="text-[11px] font-urdu text-stone-400 mt-1">
                        پوری سورت کی مسلسل تلاوت ایک ہی اسٹریمنگ میں چلے گی
                      </p>
                    </div>
                    <button
                      onClick={() => onTestPlayFullSurah(1)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-urdu font-bold text-xs shadow-md transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>سورۃ الفاتحہ مکمل سنیں</span>
                    </button>
                  </div>

                  {/* Surah Ikhlas Full */}
                  <div className="p-4 bg-stone-950/70 border border-emerald-900/60 rounded-2xl flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-arabic text-amber-300">
                          سورۃ الإخلاص (مکمل سورت)
                        </span>
                        <span className="text-[10px] font-urdu text-stone-400">۴ آیات</span>
                      </div>
                      <p className="text-[11px] font-urdu text-stone-400 mt-1">
                        شروع سے آخر تک مکمل سورت بغیر کسی انقطاع کے
                      </p>
                    </div>
                    <button
                      onClick={() => onTestPlayFullSurah(112)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-urdu font-bold text-xs shadow-md transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>سورۃ الاخلاص مکمل سنیں</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Single Ayah Test Cases */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-urdu font-bold text-emerald-400">
                  ۲. انفرادی آیت کا الگ ٹیسٹ (Single Ayah Test - Stops after one Ayah):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-arabic text-amber-300">
                        الفاتحة - صرف آیت نمبر ۱
                      </div>
                      <div className="text-[10px] font-urdu text-stone-400">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </div>
                    </div>
                    <button
                      onClick={() => onTestPlaySingleAyah(1, 1)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-urdu border border-emerald-700/60 flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>ٹیسٹ</span>
                    </button>
                  </div>

                  <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-arabic text-amber-300">
                        الفاتحة - صرف آیت نمبر ۵
                      </div>
                      <div className="text-[10px] font-urdu text-stone-400">
                        إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
                      </div>
                    </div>
                    <button
                      onClick={() => onTestPlaySingleAyah(1, 5)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-urdu border border-emerald-700/60 flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>ٹیسٹ</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              {activeTrack ? (
                <div className="bg-stone-950/80 p-5 rounded-2xl border border-emerald-900/70 space-y-3 font-urdu text-xs">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">حالیہ موڈ:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        activeTrack.mode === 'full_surah'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {activeTrack.mode === 'full_surah'
                        ? 'مکمل سورت کی اصل آڈیو (Full Surah Mode)'
                        : `صرف ایک آیت (آیت نمبر ${activeTrack.ayahNumber})`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">سورت:</span>
                    <span className="font-arabic text-amber-300 text-sm font-bold">
                      {activeTrack.surahNameArabic} ({activeTrack.surahNameUrdu})
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">قاری:</span>
                    <span className="text-emerald-300 font-semibold">
                      {activeTrack.reciter.nameUrdu}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">کل دورانیہ (Duration):</span>
                    <span className="font-mono text-stone-200">
                      {formatSeconds(currentTime)} / {formatSeconds(duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">آف لائن کیشے اسٹیٹس:</span>
                    <span
                      className={activeTrack.isOffline ? 'text-emerald-400 font-bold' : 'text-stone-400'}
                    >
                      {activeTrack.isOffline
                        ? 'مقامی کیشے سے چل رہا ہے (آف لائن محفوظ)'
                        : 'براہ راست آن لائن سرور سے اسٹریم ہو رہا ہے'}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-stone-400 block mb-1">اصل آڈیو سورس URL:</span>
                    <div className="bg-stone-900 p-2.5 rounded-lg border border-stone-800 font-mono text-[10px] text-emerald-400 break-all select-all text-left">
                      {activeTrack.audioUrl}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400 font-urdu text-xs">
                  اس وقت کوئی آڈیو فعال نہیں ہے۔ براہِ کرم اوپر دیے گئے ٹیسٹ ٹیب سے کوئی تلاوت چلائیں۔
                </div>
              )}
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4 font-urdu text-xs leading-relaxed text-stone-300">
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-2xl">
                <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  مستند قراء اور اصل تلاوت کی ضمانت
                </h4>
                <p className="text-stone-300 leading-loose">
                  نورِ ہدایت ایپ میں کسی قسم کی مصنوعی، کمپیوٹر سے تیار کردہ (AI/TTS) آواز استعمال نہیں
                  کی جاتی۔ تمام تلاوتیں عالم اسلام کے معروف ترین اور مستند قراء کی اصل ریکارڈنگز ہیں جو
                  کہ بین الاقوامی معتبر قرآنی سرورز (MP3Quran.net اور Islamic Network CDN) سے حاصل کی جاتی ہیں۔
                </p>
              </div>

              <div className="bg-stone-950/60 border border-stone-800 p-4 rounded-2xl space-y-2">
                <h5 className="font-bold text-stone-200">دستیاب مستند قراء کی فہرست:</h5>
                <ul className="list-disc list-inside space-y-1 text-stone-400">
                  <li>شیخ مشاری راشد العفاسی (Mishary Rashid Alafasy)</li>
                  <li>شیخ عبد الباسط عبد الصمد - ترتیل (Abdul Basit Abdul Samad)</li>
                  <li>شیخ عبد الرحمن السدیس - امام کعبہ (Abdur-Rahman As-Sudais)</li>
                  <li>شیخ محمد صدیق المنشاوی (Mohamed Siddiq El-Minshawi)</li>
                  <li>شیخ محمود خلیل الحصری (Mahmoud Khalil Al-Husary)</li>
                  <li>شیخ سعد الغامدی (Saad Al-Ghamdi)</li>
                  <li>شیخ ماھر المعیقلی (Maher Al-Muaiqly)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs font-urdu text-stone-400">
          <span>نورِ ہدایت ورژن ۲.۰ - تصدیق شدہ پلیٹ فارم</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};
