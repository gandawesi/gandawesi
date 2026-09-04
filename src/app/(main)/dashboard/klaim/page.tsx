'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { searchUnclaimedMembers, submitClaim, fetchOwnClaimStatus } from '@/lib/actions/claim';
import type { UnclaimedMemberItem, KlaimAkunItem } from '@/lib/types/membership';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  KeyRound,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Building,
  GraduationCap,
} from 'lucide-react';

export default function KlaimAkunPage() {
  const { authUser, hasLinkedProfile, profile, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [existingClaim, setExistingClaim] = useState<KlaimAkunItem | null>(null);

  // Search & Claim form state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UnclaimedMemberItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<UnclaimedMemberItem | null>(null);
  const [proofNote, setProofNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing claim status
  useEffect(() => {
    async function checkStatus() {
      setLoading(true);
      const res = await fetchOwnClaimStatus();
      setExistingClaim(res.claim);
      setLoading(false);
    }
    checkStatus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchUnclaimedMembers(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setSubmitting(true);
    setStatusMessage(null);

    const res = await submitClaim(selectedMember.id, proofNote);
    setSubmitting(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message || 'Permohonan klaim berhasil diajukan!' });
      // Reload claim status
      const updated = await fetchOwnClaimStatus();
      setExistingClaim(updated.claim);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Gagal mengajukan klaim.' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner size="lg" />
        <p className="text-xs text-stone-500 font-medium">Memeriksa status akun dan klaim...</p>
      </div>
    );
  }

  // Case 1: Account already linked to an anggota record
  if (hasLinkedProfile && profile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-6">
        <Card className="p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 dark:text-white">
            Akun Anda Sudah Terhubung
          </h2>
          <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 max-w-md">
            Akun Google Anda telah resmi terhubung dengan arsip anggota <strong>{profile.nama}</strong> (NIA: {profile.nia || 'Belum ada'}). Anda tidak perlu mengajukan klaim akun lagi.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/profil">
              <Button size="sm">Buka Profil Saya</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Case 2: Existing claim is in progress (menunggu / disetujui / ditolak)
  if (existingClaim) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-6">
        <Card className="p-8">
          <div className="flex flex-col items-center text-center gap-4">
            {existingClaim.status === 'menunggu' && (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Menunggu Verifikasi Pengurus
                  </span>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-white mt-3">
                    Permohonan Klaim Sedang Ditinjau
                  </h2>
                  <p className="text-xs text-stone-500 max-w-md mt-1.5 leading-relaxed">
                    Pengajuan klaim akun Anda telah masuk ke antrean verifikasi pengurus. Kami mencocokkan data identitas Anda dengan arsip anggota Gandawesi.
                  </p>
                </div>
              </>
            )}

            {existingClaim.status === 'disetujui' && (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Klaim Disetujui
                  </span>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-white mt-3">
                    Selamat, Akun Anda Berhasil Terverifikasi!
                  </h2>
                  <p className="text-xs text-stone-500 max-w-md mt-1.5 leading-relaxed">
                    Arsip keanggotaan telah terhubung dengan akun login Anda. Silakan muat ulang data untuk mengaktifkan seluruh fitur anggota.
                  </p>
                  <Button size="sm" onClick={() => refreshUser()} className="mt-4">
                    Muat Ulang Profil Sekarang
                  </Button>
                </div>
              </>
            )}

            {existingClaim.status === 'ditolak' && (
              <>
                <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                    Klaim Belum Disetujui
                  </span>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-white mt-3">
                    Verifikasi Klaim Ditolak
                  </h2>
                  <div className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-left">
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase block mb-1">
                      Catatan dari Administrator:
                    </span>
                    <p className="text-xs text-stone-700 dark:text-stone-300">
                      {existingClaim.catatan_admin || 'Identitas tidak sesuai dengan arsip data anggota.'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExistingClaim(null)}
                    className="mt-4"
                  >
                    Ajukan Klaim Ulang
                  </Button>
                </div>
              </>
            )}

            {/* Claim details box */}
            {existingClaim.anggota && (
              <div className="w-full mt-4 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-left text-xs space-y-1">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Profil Anggota yang Diajukan
                </span>
                <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  {existingClaim.anggota.nama}
                </p>
                <p className="text-stone-500">
                  {existingClaim.anggota.angkatan?.nomor_angkatan
                    ? `Angkatan ${existingClaim.anggota.angkatan.nomor_angkatan} (${existingClaim.anggota.angkatan.nama_angkatan || ''})`
                    : 'Anggota'}
                  {existingClaim.anggota.jurusan ? ` • ${existingClaim.anggota.jurusan}` : ''}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Case 3: Fresh Claim Submission Form
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-forest-950 via-forest-900 to-forest-800 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-700/60 border border-forest-500/30 text-forest-200 text-xs font-semibold mb-3">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Aktivasi Akun Anggota Lama</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Klaim Akun Anggota
        </h1>
        <p className="text-forest-100/80 text-xs md:text-sm mt-1.5 max-w-xl leading-relaxed">
          Bagi anggota Gandawesi yang datanya telah terdaftar di buku induk organisasi namun belum terhubung ke email login Google Anda saat ini.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Step 1: Search unclaimed pool */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-forest-600 dark:text-forest-400" />
          Langkah 1: Cari Nama Anda di Buku Induk
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Ketikkan nama lengkap Anda seperti yang terdaftar dalam data organisasi.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Ketik nama Anda (contoh: Bambang, Bayu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" size="md" disabled={searching}>
            {searching ? 'Mencari...' : 'Cari'}
          </Button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-5 space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Pilih profil Anda dari hasil pencarian:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {searchResults.map((item) => {
                const isSelected = selectedMember?.id === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedMember(item)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-forest-600 dark:border-forest-500 bg-forest-50 dark:bg-forest-950/50 ring-2 ring-forest-500/20'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 hover:border-forest-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                        {item.nama}
                      </h4>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-forest-600 dark:text-forest-400 shrink-0" />
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-stone-500 space-y-0.5">
                      <p>
                        {item.nomor_angkatan
                          ? `Angkatan ${item.nomor_angkatan} (${item.nama_angkatan || ''})`
                          : 'Tanpa Angkatan'}
                      </p>
                      {item.jurusan && <p className="truncate">{item.jurusan}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {searchQuery && !searching && searchResults.length === 0 && (
          <p className="mt-4 text-xs text-stone-500 italic text-center">
            Nama tidak ditemukan di daftar anggota belum berakun. Pastikan ejaan benar atau hubungi admin.
          </p>
        )}
      </Card>

      {/* Step 2: Confirmation & Evidence note */}
      {selectedMember && (
        <Card className="p-6 border-forest-500/40">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-forest-600 dark:text-forest-400" />
            Langkah 2: Konfirmasi Identitas & Ajukan Klaim
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Berikan keterangan bukti bahwa akun Google <strong>{authUser?.email}</strong> adalah milik <strong>{selectedMember.nama}</strong>.
          </p>

          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 text-xs">
              <span className="text-stone-400 block mb-0.5">Profil Terpilih:</span>
              <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                {selectedMember.nama}
              </p>
              <p className="text-stone-500">
                Angkatan {selectedMember.nomor_angkatan || '-'} • {selectedMember.jurusan || '-'}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1.5">
                Keterangan Bukti Identitas (NIM, Kontak, atau Catatan Pengurus)
              </label>
              <textarea
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                required
                rows={3}
                placeholder="Contoh: Saya angkatan 28 Tapak Rimba, NIM 1804123 Pend. Geografi. Nomor WA saya 08123456789..."
                className="w-full rounded-xl border border-stone-200 dark:border-[#1c2b23] bg-white dark:bg-[#0f1814] px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMember(null)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? 'Mengajukan...' : 'Kirim Permohonan Klaim'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
