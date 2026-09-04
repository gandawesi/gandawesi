'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { fetchOwnProfile, updateProfile, fetchOwnRiwayat } from '@/lib/actions/profile';
import type { AnggotaProfile } from '@/lib/auth/types';
import type { RiwayatTahapItem, JabatanOrganisasiItem } from '@/lib/types/membership';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Award,
  Shield,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function ProfilPage() {
  const { authUser, profile: authProfile, refreshUser } = useAuth();
  const [profile, setProfile] = useState<AnggotaProfile | null>(authProfile);
  const [tahapList, setTahapList] = useState<RiwayatTahapItem[]>([]);
  const [jabatanList, setJabatanList] = useState<JabatanOrganisasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form edit states
  const [formData, setFormData] = useState({
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    no_hp: '',
    alamat: '',
    nim: '',
    jurusan: '',
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchOwnProfile();
      if (res.profile) {
        setProfile(res.profile);
        setFormData({
          nama: res.profile.nama || '',
          tempat_lahir: res.profile.tempat_lahir || '',
          tanggal_lahir: res.profile.tanggal_lahir || '',
          jenis_kelamin: res.profile.jenis_kelamin || 'L',
          no_hp: res.profile.no_hp || '',
          alamat: res.profile.alamat || '',
          nim: res.profile.nim || '',
          jurusan: res.profile.jurusan || '',
        });

        const history = await fetchOwnRiwayat(res.profile.id);
        setTahapList(history.tahap);
        setJabatanList(history.jabatan);
      } else {
        // Mock fallback if user hasn't linked profile yet but wants to see demo
        setTahapList([
          {
            id: 't-1',
            anggota_id: 'mock',
            tahap: 'calon_siswa',
            status: 'lolos',
            approved_by: null,
            approver_nama: 'Ketua DP',
            tanggal: '2023-09-15',
            catatan: 'Lolos seleksi fisik dan wawancara',
            created_at: '2023-09-15T00:00:00Z',
          },
          {
            id: 't-2',
            anggota_id: 'mock',
            tahap: 'siswa',
            status: 'lolos',
            approved_by: null,
            approver_nama: 'Danlat',
            tanggal: '2023-11-20',
            catatan: 'Menyelesaikan seluruh kurikulum materi dasar & medan latihan',
            created_at: '2023-11-20T00:00:00Z',
          },
        ]);
        setJabatanList([
          {
            id: 'j-1',
            anggota_id: 'mock',
            jabatan: 'Anggota Divisi Gunung Hutan',
            periode_mulai: '2024-01-01',
            periode_selesai: null,
            catatan: 'Pengurus aktif periode 2024/2025',
            created_at: '2024-01-01T00:00:00Z',
          },
        ]);
      }
      setLoading(false);
    }

    loadData();
  }, [authProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    const res = await updateProfile(formData);
    setSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setIsEditing(false);
      await refreshUser();
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          ...formData,
        });
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setErrorMessage(res.error || 'Gagal menyimpan perubahan.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-stone-500 font-medium">Memuat data profil anggota...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Warning / Call to Action if Profile Not Linked */}
      {!profile && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Akun Belum Terhubung ke Data Anggota</h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Anda telah masuk via Google ({authUser?.email}), namun belum terhubung ke arsip anggota Gandawesi.
              </p>
            </div>
          </div>
          <Link href="/dashboard/klaim">
            <Button size="sm" className="whitespace-nowrap shrink-0">
              Klaim Akun Anggota
            </Button>
          </Link>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <p className="text-xs font-semibold">Biodata profil berhasil diperbarui via sistem terverifikasi.</p>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Header Profile Card */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-white via-white to-forest-50/40 dark:from-[#0c1410] dark:via-[#0c1410] dark:to-[#112017]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <Avatar
                src={profile?.foto_profil}
                name={profile?.nama || authUser?.email || 'Anggota Gandawesi'}
                size="xl"
              />
              <div className="mt-2 text-[10px] text-stone-400 text-center max-w-[120px] leading-tight">
                Upload foto profil ditunda (pemeliharaan)
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-stone-900 dark:text-white">
                  {profile?.nama || 'Akun Pengguna'}
                </h1>
                {profile?.status_keanggotaan && (
                  <Badge status={profile.status_keanggotaan} size="md" />
                )}
                {profile?.is_admin && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    Administrator
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-stone-500 dark:text-stone-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
                  <span>
                    NIA:{' '}
                    <strong className="text-stone-800 dark:text-stone-200">
                      {profile?.nia || 'Belum Diterbitkan'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
                  <span>
                    Angkatan:{' '}
                    <strong className="text-stone-800 dark:text-stone-200">
                      {profile?.angkatan?.nomor_angkatan
                        ? `${profile.angkatan.nomor_angkatan} (${profile.angkatan.nama_angkatan || '-'})`
                        : 'Belum Terdaftar'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
                  <span>{authUser?.email || profile?.email || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            {profile && (
              <Button
                variant={isEditing ? 'outline' : 'primary'}
                size="sm"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setErrorMessage(null);
                }}
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                {isEditing ? 'Batal Edit' : 'Ubah Biodata'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content: Biodata & Riwayat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biodata Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4 mb-5">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Informasi Biodata Anggota
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Data ini digunakan untuk administrasi organisasi & kegiatan lapangan
                </p>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
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
                    value={formData.tempat_lahir}
                    onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    placeholder="Contoh: Bandung"
                  />
                  <Input
                    label="Tanggal Lahir"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  />

                  <Input
                    label="Nomor Induk Mahasiswa (NIM)"
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Contoh: 2104567"
                  />
                  <Input
                    label="Program Studi / Jurusan"
                    value={formData.jurusan}
                    onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                    placeholder="Contoh: Pendidikan Geografi"
                  />

                  <Input
                    label="Nomor WhatsApp / HP"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1.5">
                    Alamat Domisili
                  </label>
                  <textarea
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    rows={3}
                    placeholder="Jl. Dr. Setiabudhi No. 229..."
                    className="w-full rounded-xl border border-stone-200 dark:border-[#1c2b23] bg-white dark:bg-[#0f1814] px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-xs text-stone-400 block mb-0.5">Nama Lengkap</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    {profile?.nama || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block mb-0.5">Jenis Kelamin</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    {profile?.jenis_kelamin === 'L'
                      ? 'Laki-laki'
                      : profile?.jenis_kelamin === 'P'
                      ? 'Perempuan'
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block mb-0.5">Tempat, Tanggal Lahir</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    {profile?.tempat_lahir || '-'}{' '}
                    {profile?.tanggal_lahir ? `, ${profile.tanggal_lahir}` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block mb-0.5">NIM & Program Studi</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    {profile?.nim || '-'} {profile?.jurusan ? `• ${profile.jurusan}` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block mb-0.5">Kontak WhatsApp</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    {profile?.no_hp || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block mb-0.5">Alamat Domisili</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    {profile?.alamat || '-'}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Riwayat Tahap Kaderisasi */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Riwayat Tahap Kaderisasi
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Arsip perjalanan kaderisasi dari Calon Siswa hingga Anggota Biasa
                </p>
              </div>
              <Award className="w-5 h-5 text-forest-600 dark:text-forest-400" />
            </div>

            {tahapList.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">Belum ada riwayat tahap kaderisasi.</p>
            ) : (
              <div className="space-y-3">
                {tahapList.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/30 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                          Tahap: {t.tahap.replace('_', ' ')}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'lolos'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : t.status === 'dalam_proses'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        {t.catatan || 'Tidak ada catatan evaluasi'}
                      </p>
                      {t.approver_nama && (
                        <p className="text-[11px] text-stone-400 mt-1">
                          Disetujui oleh: {t.approver_nama}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400 whitespace-nowrap">
                      {t.tanggal}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info: Riwayat Jabatan & Ketentuan */}
        <div className="space-y-6">
          {/* Riwayat Jabatan Organisasi */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 mb-4">
              <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                Riwayat Jabatan & Amanah
              </h3>
              <Briefcase className="w-4 h-4 text-forest-600 dark:text-forest-400" />
            </div>

            {jabatanList.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center">Belum ada riwayat jabatan tercatat.</p>
            ) : (
              <div className="space-y-3">
                {jabatanList.map((j) => (
                  <div
                    key={j.id}
                    className="p-3 rounded-xl border border-stone-100 dark:border-stone-800/80 bg-stone-50/40 dark:bg-stone-900/20"
                  >
                    <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      {j.jabatan}
                    </h5>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {j.periode_mulai} s/d {j.periode_selesai || 'Sekarang'}
                    </p>
                    {j.catatan && (
                      <p className="text-[11px] text-stone-400 mt-1 italic">{j.catatan}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Ketentuan Pembaruan Data */}
          <Card className="p-6 bg-forest-50/50 dark:bg-forest-950/20 border-forest-100 dark:border-forest-900/50">
            <h4 className="text-xs font-bold text-forest-900 dark:text-forest-300 uppercase tracking-wider mb-2">
              Kebijakan Perubahan Data
            </h4>
            <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-2 list-disc list-inside">
              <li>Status keanggotaan dan Nomor Induk Anggota (NIA) dikelola resmi oleh Pengurus/Admin.</li>
              <li>Perubahan biodata nama, kontak, dan alamat dapat dilakukan sewaktu-waktu.</li>
              <li>Data pribadi Anda dilindungi dan hanya dapat dilihat oleh pengurus berwenang.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
