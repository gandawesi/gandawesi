/**
 * Client-Side Image Compression & Optimization Utility
 *
 * Mengompresi dan merampingkan gambar langsung di browser pengguna sebelum
 * diunggah ke Supabase Storage. Mengurangi ukuran file hingga 85-97%
 * (misal dari 8MB foto kamera HP menjadi ~150KB - 250KB WebP/JPEG)
 * tanpa penurunan kualitas visual yang tampak pada layar.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 s.d. 1.0 (default: 0.8)
  format?: 'image/webp' | 'image/jpeg';
  maxOriginalSizeMB?: number;
}

export interface CompressImageResult {
  file: File;
  blob: Blob;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  originalFormatted: string;
  compressedFormatted: string;
  savedPercentage: number;
  width: number;
  height: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function validateImageFile(
  file: File,
  maxSizeMB = 15
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'File tidak ditemukan.' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic'];
  if (!allowedTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Format file tidak didukung. Harap unggah gambar JPG, PNG, atau WebP.',
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Ukuran gambar terlalu besar (${formatBytes(file.size)}). Maksimal ukuran file adalah ${maxSizeMB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Mengompresi file gambar menggunakan HTML5 Canvas API di sisi browser.
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<CompressImageResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.8,
    format = 'image/webp',
    maxOriginalSizeMB = 15,
  } = options;

  const validation = validateImageFile(file, maxOriginalSizeMB);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar rusak atau tidak dapat didekode.'));
      img.onload = () => {
        let { width, height } = img;

        // Skalakan proporsional agar gambar tidak distorsi/gepeng
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal menginisialisasi canvas untuk kompresi.'));
          return;
        }

        // Sampling berkualitas tinggi
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke Blob dengan format WebP atau JPEG
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal mengompresi gambar ke format tujuan.'));
              return;
            }

            const extension = format === 'image/webp' ? '.webp' : '.jpg';
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const newFileName = `${baseName}_optimized${extension}`;

            const compressedFile = new File([blob], newFileName, {
              type: format,
              lastModified: Date.now(),
            });

            const originalSize = file.size;
            const compressedSize = blob.size;
            const savedPercentage =
              originalSize > 0
                ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
                : 0;

            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: compressedFile,
              blob,
              previewUrl,
              originalSize,
              compressedSize,
              originalFormatted: formatBytes(originalSize),
              compressedFormatted: formatBytes(compressedSize),
              savedPercentage,
              width,
              height,
            });
          },
          format,
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
