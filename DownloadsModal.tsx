import React from 'react';
import {
  CheckCircle2,
  DownloadCloud,
  Headphones,
  Play,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { DownloadedSurahInfo, Reciter, SurahMeta } from '../types/quran';
import { formatBytes } from '../services/audioCache';

interface DownloadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloads: DownloadedSurahInfo[];
  onPlayOfflineSurah: (item: DownloadedSurahInfo) => void;
  onDeleteDownload: (item: DownloadedSurahInfo) => void;
}

export const DownloadsModal: React.FC<DownloadsModalProps> = ({
  isOpen,
  onClose,
  downloads,
  onPlayOfflineSurah,
  onDeleteDownload,
}) => {
  if (!isOpen) return null;

  const totalBytes = downloads.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-emerald-800/80 rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-urdu text-lg font-bold text-amber-300">
                ڈاؤن لوڈ شدہ سورتیں (آف لائن تلاوت)
              </h3>
              <p className="font-urdu text-xs text-stone-400">
                انٹرنیٹ بند ہونے پر بھی یہ مکمل سورتیں باآسانی سنی جا سکتی ہیں
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

        {/* Storage Summary */}
        <div className="px-5 py-3 bg-stone-950/40 border-b border-stone-800 flex items-center justify-between text-xs font-urdu text-stone-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>محفوظ شدہ سورتیں: {downloads.length}</span>
          </div>
          <span className="font-mono text-amber-400">کل سائز: {formatBytes(totalBytes)}</span>
        </div>

        {/* Downloads List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {downloads.length === 0 ? (
            <div className="text-center py-12 text-stone-400 font-urdu space-y-3">
              <DownloadCloud className="w-12 h-12 text-stone-600 mx-auto" />
              <p className="text-sm">ابھی تک کوئی سورت ڈاؤن لوڈ نہیں کی گئی۔</p>
              <p className="text-xs text-stone-500">
                کسی بھی سورت کے کارڈ پر موجود ڈاؤن لوڈ آئیکن دبا کر اسے آف لائن سننے کے لیے محفوظ کریں۔
              </p>
            </div>
          ) : (
            downloads.map((item) => (
              <div
                key={`${item.surahNumber}-${item.reciterId}`}
                className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-emerald-600/50 transition-all"
              >
                {/* Surah details */}
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono w-6 h-6 rounded-lg bg-stone-900 text-emerald-400 flex items-center justify-center border border-stone-700">
                      {item.surahNumber}
                    </span>
                    <h4 className="font-arabic text-amber-300 font-bold text-base">
                      {item.surahNameArabic}
                    </h4>
                    <span className="font-urdu text-xs text-stone-300">({item.surahNameUrdu})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400 font-urdu">
                    <span>قاری: {item.reciterNameUrdu}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">{formatBytes(item.sizeBytes)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onPlayOfflineSurah(item);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-urdu font-bold text-xs shadow transition-all"
                    title="آف لائن سنیں"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>چلائیں</span>
                  </button>

                  <button
                    onClick={() => onDeleteDownload(item)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-400 hover:bg-stone-700/80 transition-colors"
                    title="ڈاؤن لوڈ ڈیلیٹ کریں"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-urdu text-xs font-medium"
          >
            بند کریں
          </button>
        </div>
      </div>
    </div>
  );
};
