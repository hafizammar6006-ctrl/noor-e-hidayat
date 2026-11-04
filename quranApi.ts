import { Ayah } from '../types/quran';
import { BUILTIN_SURAHS } from '../data/surahs';

interface AlQuranAyahItem {
  number: number;
  numberInSurah: number;
  text: string;
  juz?: number;
  page?: number;
  sajda?: boolean;
}

export async function fetchSurahAyahs(surahNumber: number): Promise<Ayah[]> {
  const cacheKey = `noor_hidayat_surah_text_${surahNumber}`;
  
  // 1. Check local storage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }

  // 2. Fetch from Al-Quran Cloud API (Uthmani text + Urdu Jalandhry translation)
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ur.jalandhry`);
    if (res.ok) {
      const data = await res.json();
      if (data.code === 200 && Array.isArray(data.data) && data.data.length >= 2) {
        const arabicData = data.data[0];
        const urduData = data.data[1];

        const ayahs: Ayah[] = arabicData.ayahs.map((arItem: AlQuranAyahItem, idx: number) => {
          const urItem = urduData.ayahs[idx];
          return {
            numberInSurah: arItem.numberInSurah,
            numberInQuran: arItem.number,
            text: arItem.text,
            translation: urItem ? urItem.text : '',
            juz: arItem.juz,
            page: arItem.page,
            sajdah: Boolean(arItem.sajda),
          };
        });

        // Save to cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify(ayahs));
        } catch {
          // ignore quota error
        }

        return ayahs;
      }
    }
  } catch (err) {
    console.warn(`Could not fetch Surah ${surahNumber} online:`, err);
  }

  // 3. Fallback to builtin data if available
  if (BUILTIN_SURAHS[surahNumber]) {
    return BUILTIN_SURAHS[surahNumber];
  }

  // 4. Fallback minimal mock structure if offline and not in builtin
  return [
    {
      numberInSurah: 1,
      numberInQuran: 1,
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      translation: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
    },
  ];
}
