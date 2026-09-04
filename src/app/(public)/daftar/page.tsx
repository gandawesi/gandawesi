'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { fetchActivePeriode, registerCalonSiswa, fetchMyCalonSiswaStatus, submitSuratKesehatan } from '@/lib/actions/registration';
import type { PeriodePendaftaranItem, CalonSiswaItem } from '@/lib/types/registration';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  Compass,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Clock,
  ShieldCheck,
  LogIn,
  HeartPulse,
  UserCheck,
  Award,
} from 'lucide-react';

export default function PendaftaranPage() {
  const { authUser, isGuest, signInWithGoogle, refreshUser } = useAuth();

  const [periode, setPeriode] = useState<PeriodePendaftaranItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingCalon, setExistingCalon] = useState<CalonSiswaItem | null>(null);

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    no_hp: '',
    alamat: '',
    nim: '',
    jurusan: '',
    file_persetujuan_ortu: '',
  });

  // Health doc upload state
  const [healthDocSimulated, setHealthDocSimulated] = useState(false);
  const [uploadingHealth, setUploadingHealth] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const perRes = await fetchActivePeriode();
      setPeriode(perRes.periode);
      setIsOpen(perRes.isOpen);

      if (authUser) {
        const statusRes = await fetchMyCalonSiswaStatus();
        setExistingCalon(statusRes.calonSiswa);
      }
      setLoading(false);
    }
    init();
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periode) return;

    setSubmitting(true);
    setFeedback(null);

    const res = await registerCalonSiswa({
      ...formData,
      periode_pendaftaran_id: periode.id,
      angkatan_id: periode.angkatan_id,
    });

    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Pendaftaran berhasil dikirim!' });
      await refreshUser();
      const updated = await fetchMyCalonSiswaStatus();
      setExistingCalon(updated.calonSiswa);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mengirim pendaftaran.' });
    }
  };

  const handleUploadSuratDokter = async () => {
    setUploadingHealth(true);
    const mockUrl = `/uploads/surat_kesehatan_${Date.now()}.pdf`;
    const res = await submitSuratKesehatan(mockUrl);
    setUploadingHealth(false);

    if (res.success) {
      setHealthDocSimulated(true);
      setFeedback({ type: 'success', text: res.message || 'Surat dokter berhasil disimpan!' });
      const updated = await fetchMyCalonSiswaStatus();
      setExistingCalon(updated.calonSiswa);
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal mengunggah berkas.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-stone-500 font-medium">Memeriksa periode pendaftaran...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-forest-950 via-forest-900 to-moss-900 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-700/60 border border-forest-500/30 text-forest-200 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5 text-forest-300" />
            <span>Penerimaan Anggota Baru Gandawesi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pendaftaran Calon Siswa
          </h1>

          <p className="text-forest-100/80 text-xs sm:text-sm mt-2 leading-relaxed">
            Mulailah perjalanan pembentukan karakter, kepemimpinan alam terbuka, dan persaudaraan rimba bersama Gandawesi FPTI UPI.
          </p>

          {periode && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Periode Pendaftaran Aktif
              </span>
              <span className="text-stone-300">
                Angkatan {periode.nomor_angkatan || '-'} ({periode.nama_angkatan || 'Penerimaan Baru'})
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-forest-400" />
                {periode.tanggal_buka} s/d {periode.tanggal_tutup}
              </span>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Case 1: Already Registered as Calon Siswa */}
      {existingCalon ? (
        <div className="space-y-6">
          <Card className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold mb-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  Status: {existingCalon.status_keanggotaan.replace('_', ' ').toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                  Formulir Pendaftaran Anda Telah Diterima
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Terdaftar atas nama <strong>{existingCalon.nama}</strong> ({existingCalon.nim} • {existingCalon.jurusan})
                </p>
              </div>

              <span className="text-xs text-stone-400 font-mono">
                {new Date(existingCalon.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Selection status card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Keputusan Tahap Calon Siswa
                  </span>
                  {existingCalon.keputusan_tahap?.status === 'lolos' ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Lolos ke Siswa
                    </span>
                  ) : existingCalon.keputusan_tahap?.status === 'gugur' ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      Belum Lolos (Gugur)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Sedang Ditinjau
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {existingCalon.keputusan_tahap?.catatan ||
                    'Evaluasi berkas dan fisik sedang dalam proses peninjauan oleh Ketua Medan Operasi dan DANLAT.'}
                </p>
                {existingCalon.keputusan_tahap?.approver_nama && (
                  <p className="text-[11px] text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
                    Penilai: {existingCalon.keputusan_tahap.approver_nama}
                  </p>
                )}
              </div>

              {/* Health Test Status Card */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    Tes Kesehatan Awal
                  </span>
                  {existingCalon.tes_kesehatan_awal?.file_surat_dokter ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Surat Terunggah
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      Belum Unggah Surat
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {existingCalon.tes_kesehatan_awal?.catatan_panitia
                    ? `Catatan Medis Panitia: ${existingCalon.tes_kesehatan_awal.catatan_panitia}`
                    : 'Wajib menyerahkan surat keterangan sehat dari dokter/klinik resmi sebelum bina fisik lapangan.'}
                </p>

                {/* Upload or Re-upload Doctor Certificate */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUploadSuratDokter}
                    disabled={uploadingHealth}
                    className="w-full text-xs"
                  >
                    <UploadCloud className="w-4 h-4 mr-1.5 text-forest-600" />
                    {existingCalon.tes_kesehatan_awal?.file_surat_dokter
                      ? 'Perbarui Surat Dokter'
                      : 'Unggah Surat Keterangan Sehat'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-400">
                Lacak aktivitas & jadwal kegiatan di portal anggota
              </span>
              <Link href="/dashboard">
                <Button size="sm">Buka Dashboard Saya</Button>
              </Link>
            </div>
          </Card>
        </div>
      ) : isGuest || !authUser ? (
        /* Case 2: Not logged in with Google yet */
        <Card className="p-8 md:p-12 text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-forest-50 dark:bg-forest-950/80 text-forest-700 dark:text-forest-300 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              Masuk dengan Akun Google
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Untuk menjamin integritas data dan keamanan arsip kaderisasi, setiap pendaftar wajib mengautentikasi akun Google terlebih dahulu sebelum mengisi biodata.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => signInWithGoogle()}
            leftIcon={<LogIn className="w-5 h-5" />}
          >
            Lanjutkan Masuk dengan Google
          </Button>

          <p className="text-[11px] text-stone-400">
            * 1 Akun Google terhubung dengan 1 profil Calon Siswa di database Gandawesi
          </p>
        </Card>
      ) : (
        /* Case 3: Logged in, Ready to Fill Registration Form */
        <Card className="p-6 md:p-8">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4 mb-6">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              Formulir Biodata Calon Anggota
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Akun login: <strong>{authUser.email}</strong>. Data ini akan dicatat dalam buku induk Calon Siswa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap Sesuai KTP / KTM"
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Aditya Pratama Ramadhan"
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1.5">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.jenis_kelamin}
                  onChange={(e) =>
                    setFormData({ ...formData, jenis_kelamin: e.target.value as 'L' | 'P' })
                  }
                  className="w-full rounded-xl border border-stone-200 dark:border-[#1c2b23] bg-white dark:bg-[#0f1814] px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <Input
                label="Tempat Lahir"
                required
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                placeholder="Contoh: Bandung"
              />

              <Input
                label="Tanggal Lahir"
                type="date"
                required
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
              />

              <Input
                label="Nomor Induk Mahasiswa (NIM)"
                required
                value={formData.nim}
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                placeholder="Contoh: 2301892"
              />

              <Input
                label="Program Studi / Jurusan FPTI"
                required
                value={formData.jurusan}
                onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                placeholder="Contoh: Pendidikan Geografi"
              />

              <Input
                label="Nomor WhatsApp / Kontak Aktif"
                required
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                placeholder="Contoh: 081234567890"
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1.5">
                  Surat Persetujuan Orang Tua
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={() =>
                      setFormData({
                        ...formData,
                        file_persetujuan_ortu: `/uploads/persetujuan_${Date.now()}.pdf`,
                      })
                    }
                    className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Format PDF atau Foto (dapat disusulkan sebelum latihan lapangan)
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1.5">
                Alamat Domisili di Bandung
              </label>
              <textarea
                required
                rows={3}
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Jl. Gegerkalong Tonggoh No. 15..."
                className="w-full rounded-xl border border-stone-200 dark:border-[#1c2b23] bg-white dark:bg-[#0f1814] px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              />
            </div>

            {/* Terms check */}
            <div className="p-4 rounded-xl bg-forest-50/60 dark:bg-forest-950/30 border border-forest-100 dark:border-forest-900/50 text-xs text-stone-600 dark:text-stone-400 space-y-1">
              <p className="font-semibold text-forest-900 dark:text-forest-200">
                Pernyataan Kesediaan Calon Siswa:
              </p>
              <p>
                Dengan mengirimkan formulir ini, saya menyatakan bersedia mengikuti seluruh rangkaian kurikulum kaderisasi, bina jasmani, pematerian dasar, dan mematuhi Kode Etik Pecinta Alam Indonesia.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
              <Button type="submit" size="md" disabled={submitting}>
                {submitting ? 'Mengirim Formulir...' : 'Kirim Pendaftaran Calon Siswa'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
