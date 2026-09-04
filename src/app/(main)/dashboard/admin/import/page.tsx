'use client';

import React, { useState, useRef } from 'react';
import { getCsvTemplate, parseAndValidateCSV, batchInsertAnggota } from '@/lib/actions/admin-import';
import type { ImportAnggotaRow } from '@/lib/types/membership';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function AdminImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedRows, setParsedRows] = useState<ImportAnggotaRow[]>([]);
  const [summary, setSummary] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; insertedCount: number; message?: string } | null>(null);

  const handleDownloadTemplate = async () => {
    const csvContent = await getCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_anggota_gandawesi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const result = await parseAndValidateCSV(text);
      setParsedRows(result.rows);
      setSummary(result.summary);
      setParsing(false);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;

    setImporting(true);
    setImportResult(null);

    const res = await batchInsertAnggota(parsedRows);
    setImporting(false);

    if (res.success) {
      setImportResult({
        success: true,
        insertedCount: res.insertedCount,
        message: `Berhasil mengimpor ${res.insertedCount} data anggota ke buku induk!`,
      });
      setParsedRows([]);
      setSummary(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setImportResult({
        success: false,
        insertedCount: 0,
        message: res.error || 'Terjadi kesalahan saat memproses data impor.',
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 dark:text-forest-400 uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Migrasi Data Massal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white">
            Impor Data Anggota (CSV)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Unggah arsip anggota lama atau angkatan baru sekaligus menggunakan format template CSV baku
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="border-stone-300 dark:border-stone-700 hover:bg-forest-50 dark:hover:bg-forest-950/40 shrink-0"
        >
          <Download className="w-4 h-4 mr-1.5 text-forest-600 dark:text-forest-400" />
          Unduh Template CSV
        </Button>
      </div>

      {/* Format Notice */}
      <div className="p-4 rounded-2xl bg-forest-50/70 dark:bg-forest-950/30 border border-forest-200/60 dark:border-forest-900/40 text-xs text-forest-900 dark:text-forest-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-forest-600 dark:text-forest-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Format Kolom Baku Template CSV:</p>
          <p className="text-forest-700 dark:text-forest-300">
            <code className="px-1.5 py-0.5 rounded bg-forest-100 dark:bg-forest-900 text-[11px] font-mono">
              nama, nomor_angkatan, status_keanggotaan, nia, jenis_kelamin, nim, jurusan, no_hp, alamat
            </code>
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            * Kolom <strong>nama</strong>, <strong>nomor_angkatan</strong>, dan <strong>status_keanggotaan</strong> wajib diisi. Kolom lainnya bersifat opsional.
          </p>
        </div>
      </div>

      {/* File Upload Dropzone */}
      <Card className="p-8 text-center border-dashed border-2 border-stone-300 dark:border-stone-800 hover:border-forest-500 dark:hover:border-forest-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file-input"
        />
        <label
          htmlFor="csv-file-input"
          className="flex flex-col items-center justify-center cursor-pointer gap-3"
        >
          <div className="w-14 h-14 rounded-full bg-forest-50 dark:bg-forest-950/60 text-forest-600 dark:text-forest-400 flex items-center justify-center">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
              {fileName ? fileName : 'Pilih atau Tarik File CSV ke Sini'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Hanya menerima file berformat <strong>.csv</strong> (UTF-8)
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" className="mt-1 pointer-events-none">
            Jelajahi File
          </Button>
        </label>
      </Card>

      {/* Loading state */}
      {parsing && (
        <div className="flex flex-col items-center justify-center p-8 gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-stone-500">Menganalisis dan memvalidasi baris CSV...</p>
        </div>
      )}

      {/* Result feedback */}
      {importResult && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            importResult.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
          }`}
        >
          {importResult.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{importResult.message}</span>
        </div>
      )}

      {/* Preview Section */}
      {summary && parsedRows.length > 0 && (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 uppercase font-semibold">Total Baris</span>
                <p className="text-xl font-extrabold text-stone-900 dark:text-white mt-0.5">
                  {summary.total}
                </p>
              </div>
              <FileText className="w-6 h-6 text-stone-400" />
            </Card>

            <Card className="p-4 flex items-center justify-between border-emerald-500/30 bg-emerald-50/20">
              <div>
                <span className="text-[11px] text-emerald-600 uppercase font-semibold">Baris Valid</span>
                <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {summary.valid}
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </Card>

            <Card className="p-4 flex items-center justify-between border-rose-500/30 bg-rose-50/20">
              <div>
                <span className="text-[11px] text-rose-600 uppercase font-semibold">Baris Tidak Valid</span>
                <p className="text-xl font-extrabold text-rose-700 dark:text-rose-400 mt-0.5">
                  {summary.invalid}
                </p>
              </div>
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </Card>
          </div>

          {/* Table Preview */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                Pratinjau Data Impor ({parsedRows.length} Baris)
              </h3>

              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteImport}
                disabled={importing || summary.valid === 0}
              >
                {importing ? (
                  'Memproses Impor...'
                ) : (
                  <>
                    Impor {summary.valid} Baris Valid
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-500 font-semibold border-b border-stone-100 dark:border-stone-800 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3">Angkatan</th>
                    <th className="py-2.5 px-3">Status Keanggotaan</th>
                    <th className="py-2.5 px-3">NIA</th>
                    <th className="py-2.5 px-3">Jurusan</th>
                    <th className="py-2.5 px-3">Keterangan / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.isValid
                          ? 'hover:bg-forest-50/20 dark:hover:bg-forest-950/20'
                          : 'bg-rose-50/40 dark:bg-rose-950/20'
                      }
                    >
                      <td className="py-2.5 px-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center text-emerald-600 font-medium text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-600 font-medium text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Eror
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900 dark:text-white">
                        {row.nama || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300">
                        {row.nomor_angkatan || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300">
                        {row.status_keanggotaan}
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 font-mono">
                        {row.nia || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-500">
                        {row.jurusan || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-rose-600">
                        {row.errors.length > 0 ? row.errors.join('; ') : 'Siap diimpor'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
