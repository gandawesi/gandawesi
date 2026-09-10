import { createClient } from '@/lib/supabase/client';

export interface StorageUploadResult {
  success: boolean;
  publicUrl?: string;
  path?: string;
  error?: string;
}

/**
 * Membersihkan path file agar valid untuk Supabase Storage
 */
export function sanitizeStoragePath(path: string): string {
  return path
    .replace(/^\/+/, '') // Hapus leading slash
    .replace(/\/{2,}/g, '/') // Hapus slash ganda
    .replace(/[^a-zA-Z0-9/._-]/g, '_'); // Sanitasi karakter berbahaya
}

/**
 * Membuat nama file unik berdasarkan timestamp dan ekstensi
 */
export function createUniqueStorageFileName(
  prefix: string,
  originalName: string,
  extension?: string
): string {
  const ext = extension || originalName.split('.').pop() || 'webp';
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${cleanPrefix}_${timestamp}_${randomSuffix}.${ext}`;
}

/**
 * Mengunggah file atau blob ke bucket Supabase Storage
 */
export async function uploadFileToStorage(
  file: File | Blob,
  bucket: string,
  filePath: string
): Promise<StorageUploadResult> {
  const cleanPath = sanitizeStoragePath(filePath);

  try {
    const supabase = createClient();

    // 1. Eksekusi upload ke bucket
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(cleanPath, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type || 'application/octet-stream',
      });

    if (uploadError) {
      console.warn(`[Supabase Storage] Upload ke bucket '${bucket}' gagal:`, uploadError.message);

      // Fallback: Jika bucket belum dibuat di Supabase dashboard pengguna atau offline demo,
      // buat Object URL lokal agar alur aplikasi tidak terputus
      const fallbackUrl = URL.createObjectURL(file);
      return {
        success: false,
        publicUrl: fallbackUrl,
        path: cleanPath,
        error: `Gagal mengunggah ke Supabase Storage (Bucket '${bucket}'): ${uploadError.message}. Pastikan bucket '${bucket}' sudah dibuat di Supabase Dashboard.`,
      };
    }

    // 2. Dapatkan URL publik dari file yang berhasil diunggah
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(cleanPath);

    return {
      success: true,
      publicUrl: publicData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error(`[Supabase Storage] Terjadi error tak terduga:`, err);
    const fallbackUrl = URL.createObjectURL(file);
    return {
      success: false,
      publicUrl: fallbackUrl,
      path: cleanPath,
      error: err.message || 'Terjadi kesalahan saat mengunggah berkas.',
    };
  }
}

/**
 * Menghapus file dari bucket Supabase Storage
 */
export async function deleteFileFromStorage(
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const cleanPath = sanitizeStoragePath(filePath);
    const { error } = await supabase.storage.from(bucket).remove([cleanPath]);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
