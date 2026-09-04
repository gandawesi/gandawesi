'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Building,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Wallet,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { SponsorshipItem } from '@/lib/types/content';
import { getPublicSponsorshipList, submitDonasiPublic } from '@/lib/actions/content';

export default function PublicDonasiPage() {
  const [sponsorships, setSponsorships] = useState<SponsorshipItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [namaSponsor, setNamaSponsor] = useState('');
  const [jenis, setJenis] = useState<'sponsorship' | 'donasi'>('donasi');
  const [nominal, setNominal] = useState(100000);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getPublicSponsorshipList();
      setSponsorships(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSponsor.trim() || nominal <= 0) {
      setErrorMsg('Harap isi nama dan nominal donasi dengan benar');
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await submitDonasiPublic({
        nama_sponsor: namaSponsor,
        jenis,
        nominal,
      });

      if (res.success) {
        setSuccessMsg(
          `Terima kasih sebesar-besarnya kepada "${namaSponsor}" atas komitmen dukungan ${jenis === 'sponsorship' ? 'sponsorship' : 'donasi'} sebesar Rp ${nominal.toLocaleString('id-ID')}!`
        );
        setNamaSponsor('');
        setNominal(100000);
        await loadData();
      } else {
        setErrorMsg(res.error || 'Gagal mengirim komitmen dukungan');
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 text-xs font-bold text-forest-800 dark:text-forest-300">
          <HeartHandshake className="w-3.5 h-3.5" /> Sinergi & Pengabdian Alam
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
          DUKUNGAN & SPONSORSHIP
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
          Bersama menjaga kelestarian alam nusantara dan mendukung pendidikan karakter generasi muda pecinta alam Universitas Pendidikan Indonesia.
        </p>
      </div>

      {/* Program Dukungan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-forest-300 flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Ekspedisi & Riset Alam
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Dukungan perlengkapan dan logistik lapangan untuk pemetaan gua, penjelajahan rimba gunung, serta observasi keanekaragaman hayati.
          </p>
        </div>

        <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Konservasi & Mata Air
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Aksi rehabilitasi mata air, penanaman pohon endemik di hutan lindung Jayagiri, dan edukasi lingkungan untuk pelajar sekolah.
          </p>
        </div>

        <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Kaderisasi Mahasiswa
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Beasiswa pelatihan sertifikasi SAR, perlengkapan keselamatan siswa diklat, dan pembinaan keselamatan berkegiatan alam bebas.
          </p>
        </div>
      </div>

      {/* Rekening Resmi & Formulir Commitment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Rekening Resmi Bank */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-moss-900 text-white p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-forest-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Kanal Rekening Resmi Organisasi
            </div>

            <div className="space-y-1">
              <p className="text-xs text-forest-200">Bank BJB Cabang UPI Bandung</p>
              <p className="text-2xl md:text-3xl font-mono font-extrabold tracking-wider">
                0012 3456 7890 1
              </p>
              <p className="text-xs text-forest-200 mt-1">
                a.n. <strong>GANDAWESI FPTI UPI</strong>
              </p>
            </div>

            <div className="pt-4 border-t border-forest-700/60 text-[11px] text-forest-200/90 leading-relaxed">
              Seluruh dana yang masuk tercatat transparan dalam buku kas organisasi dan langsung diaudit dalam Musyawarah Anggota (MUSANG).
            </div>
          </div>

          {/* Daftar Pendukung Terkini */}
          <div className="rounded-3xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Mitra & Donatur Terkini
            </h4>
            {loading ? (
              <div className="flex justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : sponsorships.length === 0 ? (
              <p className="text-xs text-stone-500">Belum ada catatan dukungan publik</p>
            ) : (
              <div className="space-y-3 divide-y divide-stone-100 dark:divide-stone-800/60">
                {sponsorships.slice(0, 5).map((sp) => (
                  <div key={sp.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">
                        {sp.nama_sponsor}
                      </p>
                      <p className="text-[10px] text-stone-400 capitalize">
                        {sp.jenis} {sp.event_nama ? `• ${sp.event_nama}` : ''}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Rp {(sp.nominal || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Formulir Konfirmasi Donasi */}
        <div className="lg:col-span-7 rounded-3xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-800/80 p-6 md:p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-mono">
              Konfirmasi Partisipasi / Sponsorship
            </h3>
            <p className="text-xs text-stone-500">
              Kirimkan konfirmasi komitmen dukungan Anda agar bendahara kami dapat merekonsiliasi dengan buku kas organisasi.
            </p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nama Pribadi / Instansi / Korporasi *
              </label>
              <input
                type="text"
                required
                placeholder="Mis. Alumni Angkatan 25 / Eiger Adventure"
                value={namaSponsor}
                onChange={(e) => setNamaSponsor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Bentuk Dukungan
                </label>
                <select
                  value={jenis}
                  onChange={(e: any) => setJenis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                >
                  <option value="donasi">Donasi Bebas / Sukarela</option>
                  <option value="sponsorship">Sponsorship Ekspedisi</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nominal Dukungan (Rp) *
                </label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  required
                  value={nominal}
                  onChange={(e) => setNominal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/30 font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap pt-1">
              {[50000, 100000, 250000, 500000, 1000000, 2500000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setNominal(amt)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                    nominal === amt
                      ? 'bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-forest-300 border-forest-300'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                  }`}
                >
                  Rp {amt.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="md"
                disabled={isPending}
                className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs"
              >
                {isPending ? <Spinner size="sm" /> : 'Kirim Komitmen Dukungan'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
