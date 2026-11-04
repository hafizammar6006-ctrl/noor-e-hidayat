export type RevelationType = 'مکی' | 'مدنی';

export interface SurahMeta {
  number: number;
  name: string; // Arabic: الفاتحة
  urduName: string; // Urdu: سورۃ الفاتحہ
  englishName: string; // Al-Faatiha
  urduMeaning: string; // آغاز / کھولنے والی
  numberOfAyahs: number;
  revelationType: RevelationType;
  juz: number;
}

export interface Ayah {
  numberInSurah: number;
  numberInQuran: number;
  text: string; // Uthmani Arabic
  translation: string; // Urdu Translation
  juz?: number;
  page?: number;
  sajdah?: boolean;
}

export interface Reciter {
  id: string;
  nameUrdu: string;
  nameArabic: string;
  nameEnglish: string;
  descriptionUrdu: string;
  // Template URL for full surah: e.g. https://server8.mp3quran.net/afs/{padded}.mp3
  fullSurahUrlPattern: (surahNumber: number) => string;
  // Backup pattern if primary fails
  fullSurahBackupUrlPattern?: (surahNumber: number) => string;
  // Ayah audio edition identifier for single ayah audio
  ayahAudioEdition: string;
}

export type PlaybackMode = 'full_surah' | 'single_ayah';

export interface ActiveAudioTrack {
  mode: PlaybackMode;
  surahNumber: number;
  ayahNumber?: number; // Present only when mode === 'single_ayah'
  globalAyahNumber?: number;
  surahNameArabic: string;
  surahNameUrdu: string;
  reciter: Reciter;
  audioUrl: string;
  isOffline: boolean;
}

export interface DownloadedSurahInfo {
  surahNumber: number;
  reciterId: string;
  surahNameUrdu: string;
  surahNameArabic: string;
  reciterNameUrdu: string;
  sizeBytes: number;
  downloadedAt: number;
}
