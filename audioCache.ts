import { DownloadedSurahInfo, Reciter } from '../types/quran';

const CACHE_NAME = 'noor-hidayat-audio-v1';
const METADATA_KEY = 'noor_hidayat_downloads_meta';

// Helper to get downloads metadata list
export function getSavedDownloads(): DownloadedSurahInfo[] {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading downloads metadata:', err);
  }
  return [];
}

function saveDownloadsMeta(items: DownloadedSurahInfo[]): void {
  try {
    localStorage.setItem(METADATA_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving downloads metadata:', err);
  }
}

// Check if a specific Surah + Reciter combination is already cached
export async function isSurahDownloaded(surahNumber: number, reciterId: string): Promise<boolean> {
  const downloads = getSavedDownloads();
  const exists = downloads.some((d) => d.surahNumber === surahNumber && d.reciterId === reciterId);
  if (!exists) return false;

  // Double check in Cache API
  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      // Match if any cached request URL ends with or contains surah
      const padded = String(surahNumber).padStart(3, '0');
      return keys.some((k) => k.url.includes(`${padded}.mp3`) || k.url.includes(`/${surahNumber}.mp3`));
    } catch {
      return true; // fall back to meta record
    }
  }
  return exists;
}

// Download full surah audio and store in cache with progress callback
export async function downloadSurahAudio(
  surahNumber: number,
  surahNameArabic: string,
  surahNameUrdu: string,
  reciter: Reciter,
  onProgress?: (pct: number) => void
): Promise<{ success: boolean; error?: string }> {
  const url = reciter.fullSurahUrlPattern(surahNumber);
  const backupUrl = reciter.fullSurahBackupUrlPattern?.(surahNumber);

  try {
    onProgress?.(10);
    let response: Response;

    try {
      response = await fetch(url, { mode: 'cors' });
      if (!response.ok && backupUrl) {
        response = await fetch(backupUrl, { mode: 'cors' });
      }
    } catch {
      if (backupUrl) {
        response = await fetch(backupUrl, { mode: 'cors' });
      } else {
        throw new Error('سرور سے رابطہ ممکن نہیں ہو سکا۔ برائے مہربانی اپنا انٹرنیٹ کنکشن چیک کریں۔');
      }
    }

    if (!response || !response.ok) {
      return {
        success: false,
        error: `اس سورت کی اصل آڈیو سرور پر دستیاب نہیں۔ (HTTP Status: ${response?.status || 'Unknown'})`,
      };
    }

    onProgress?.(45);

    // Get Content-Length for size calculation if available
    const contentLength = Number(response.headers.get('content-length')) || 0;

    // Clone response before putting into Cache API
    const responseToCache = response.clone();
    const blob = await response.blob();
    const finalSize = blob.size || contentLength || 2048000;

    onProgress?.(80);

    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, responseToCache);
      if (backupUrl) {
        try {
          await cache.put(backupUrl, new Response(blob));
        } catch {
          // ignore
        }
      }
    }

    // Save in metadata
    const current = getSavedDownloads().filter(
      (d) => !(d.surahNumber === surahNumber && d.reciterId === reciter.id)
    );
    current.push({
      surahNumber,
      reciterId: reciter.id,
      surahNameUrdu,
      surahNameArabic,
      reciterNameUrdu: reciter.nameUrdu,
      sizeBytes: finalSize,
      downloadedAt: Date.now(),
    });
    saveDownloadsMeta(current);

    onProgress?.(100);
    return { success: true };
  } catch (err: unknown) {
    console.error('Download failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'آڈیو ڈاؤن لوڈ کرنے میں ناکامی ہوئی۔ براہِ کرم دوبارہ کوشش کریں۔',
    };
  }
}

// Retrieve audio playback URL (either a local Blob URL from offline cache or the online network URL)
export async function getPlayableAudioUrl(
  targetUrl: string
): Promise<{ url: string; isOffline: boolean }> {
  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const matched = await cache.match(targetUrl);
      if (matched) {
        const blob = await matched.blob();
        if (blob && blob.size > 0) {
          const blobUrl = URL.createObjectURL(blob);
          return { url: blobUrl, isOffline: true };
        }
      }
    } catch (err) {
      console.warn('Cache lookup failed, using network URL:', err);
    }
  }

  return { url: targetUrl, isOffline: false };
}

// Delete downloaded Surah
export async function deleteDownloadedSurah(surahNumber: number, reciterId: string, url: string): Promise<boolean> {
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(url);
    }
    const current = getSavedDownloads().filter(
      (d) => !(d.surahNumber === surahNumber && d.reciterId === reciterId)
    );
    saveDownloadsMeta(current);
    return true;
  } catch (err) {
    console.error('Failed to delete download:', err);
    return false;
  }
}

// Format bytes into readable MB
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} ایم بی`;
}
