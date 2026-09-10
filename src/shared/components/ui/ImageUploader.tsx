'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, X, Sparkles, AlertCircle, CloudCheck, Loader2 } from 'lucide-react';
import { compressImage, CompressImageOptions, CompressImageResult } from '@/shared/utils/image-compression';
import { uploadFileToStorage, createUniqueStorageFileName } from '@/lib/supabase/storage';

export interface ImageUploaderProps {
  label?: string;
  helperText?: string;
  initialUrl?: string | null;
  bucket?: string; // Jika diisi, otomatis diunggah ke bucket Supabase Storage
  folder?: string; // Subfolder di dalam bucket (misal: 'avatars', 'receipts', 'articles')
  options?: CompressImageOptions;
  onImageCompressed?: (result: CompressImageResult) => void;
  onUploadComplete?: (publicUrl: string, result: CompressImageResult) => void;
  onImageRemoved?: () => void;
  className?: string;
}

export function ImageUploader({
  label = 'Upload Gambar (Otomatis Dikecilkan)',
  helperText = 'Gambar akan otomatis dikompresi ke WebP resolusi web (menghemat hingga 95% ruang penyimpanan).',
  initialUrl = null,
  bucket,
  folder = 'uploads',
  options = { maxWidth: 1280, maxHeight: 1280, quality: 0.8, format: 'image/webp' },
  onImageCompressed,
  onUploadComplete,
  onImageRemoved,
  className = '',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [cloudUrl, setCloudUrl] = useState<string | null>(initialUrl);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalFormatted: string;
    compressedFormatted: string;
    savedPercentage: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setWarningMessage(null);
    setCompressing(true);

    try {
      // 1. Kompresi gambar di sisi klien
      const result = await compressImage(file, options);
      setPreview(result.previewUrl);
      setCompressionInfo({
        originalFormatted: result.originalFormatted,
        compressedFormatted: result.compressedFormatted,
        savedPercentage: result.savedPercentage,
      });

      if (onImageCompressed) {
        onImageCompressed(result);
      }

      // 2. Jika bucket ditentukan, unggah ke Supabase Storage
      if (bucket) {
        setCompressing(false);
        setUploading(true);

        const fileName = createUniqueStorageFileName(folder, file.name, 'webp');
        const targetPath = `${folder}/${fileName}`;

        const uploadRes = await uploadFileToStorage(result.file, bucket, targetPath);

        if (uploadRes.success && uploadRes.publicUrl) {
          setCloudUrl(uploadRes.publicUrl);
          if (onUploadComplete) {
            onUploadComplete(uploadRes.publicUrl, result);
          }
        } else {
          // Fallback lokal jika bucket Supabase belum dikonfigurasi
          if (uploadRes.publicUrl) {
            setCloudUrl(uploadRes.publicUrl);
            if (onUploadComplete) {
              onUploadComplete(uploadRes.publicUrl, result);
            }
          }
          if (uploadRes.error) {
            setWarningMessage(uploadRes.error);
          }
        }
      } else if (onUploadComplete) {
        // Jika tidak ada bucket, teruskan previewUrl sebagai fallback
        onUploadComplete(result.previewUrl, result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses dan mengompresi gambar.');
    } finally {
      setCompressing(false);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setCloudUrl(null);
    setCompressionInfo(null);
    setErrorMessage(null);
    setWarningMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {warningMessage && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-forest-500 bg-forest-50/50 dark:bg-forest-950/20 ring-4 ring-forest-500/10'
              : 'border-stone-300 dark:border-stone-700 hover:border-forest-500 bg-stone-50/50 dark:bg-stone-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-forest-500/10 text-forest-600 dark:text-forest-400 flex items-center justify-center">
              {compressing || uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-forest-500" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {compressing
                  ? 'Mengompresi Gambar ke WebP...'
                  : uploading
                  ? 'Mengunggah ke Supabase Storage...'
                  : 'Klik untuk memilih foto atau seret ke sini'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                JPG, PNG, WebP hingga 15 MB
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              Kompresi Otomatis ke WebP Hemat Storage
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-900 p-2">
          {/* Image Preview */}
          <div className="relative h-48 w-full rounded-xl overflow-hidden bg-stone-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full backdrop-blur-sm transition-colors"
              title="Hapus foto"
            >
              <X className="w-4 h-4" />
            </button>

            {uploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span>Mengunggah ke Supabase Storage...</span>
              </div>
            )}
          </div>

          {/* Compression & Storage Stats */}
          {compressionInfo && (
            <div className="mt-2 p-2.5 bg-stone-950/80 rounded-xl border border-stone-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-stone-300">
                  {compressionInfo.originalFormatted} →{' '}
                  <strong className="text-emerald-400">{compressionInfo.compressedFormatted}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Hemat {compressionInfo.savedPercentage}%
                </span>
                {bucket && cloudUrl && !uploading && (
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Storage: {bucket}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
