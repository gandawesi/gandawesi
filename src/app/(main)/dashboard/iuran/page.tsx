'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  CreditCard,
  QrCode,
  Send,
  X,
  FileText,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { fetchMyIuranSummary } from '@/lib/actions/keuangan';
import type { MyIuranSummary } from '@/lib/types/keuangan';

export default function MemberIuranPage() {
  const [summary, setSummary] = useState<MyIuranSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    periode: '2025-06',
    nominal: 25000,
    bukti: '',
    catatan: '',
  });
  const [submittingConfirm, setSubmittingConfirm] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchMyIuranSummary();
      setSummary(res);
      if (res.riwayat_iuran.length > 0) {
        setConfirmForm((p) => ({
          ...p,
          periode: res.riwayat_iuran[0].periode,
          nominal: res.tarif_bulanan_saat_ini,
        }));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingConfirm(true);
    // Simulate payment confirmation dispatch to treasurer
    await new Promise((r) => setTimeout(r, 600));
    setSubmittingConfirm(false);
    setConfirmSuccess(true);
    setTimeout(() => {
      setShowConfirmModal(false);
      setConfirmSuccess(false);
    }, 1500);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading || !summary) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-stone-400">
        <Spinner className="w-8 h-8 text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Memuat status iuran anggota...</p>
      </div>
    );
  }

  const currentMonthBill = summary.riwayat_iuran[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-forest-950 to-slate-900 border border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                <Wallet className="w-3.5 h-3.5" /> Keuangan & Iuran Wajib
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 capitalize">
                {summary.status_keanggotaan.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-mono">
              STATUS IURAN BULANAN
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pelacakan mandiri kontribusi iuran kas wajib untuk mendukung operasional kesekretariatan, pemeliharaan alat alam terbuka, dan penyelenggaraan kegiatan diklat Gandawesi.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowConfirmModal(true)}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Konfirmasi Pembayaran
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider">Tagihan Bulan Berjalan</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
            {formatIDR(summary.tarif_bulanan_saat_ini)}
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            {currentMonthBill?.status_bayar === 'lunas' ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lunas ({currentMonthBill.periode})
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Menunggu Pembayaran
              </span>
            )}
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider">Total Tunggakan</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {formatIDR(summary.total_tunggakan)}
          </p>
          <p className="text-xs text-stone-500">
            {summary.jumlah_bulan_menunggak === 0 ? (
              <span className="text-emerald-500 font-semibold">Tidak ada tunggakan iuran</span>
            ) : (
              <span>Terhitung {summary.jumlah_bulan_menunggak} bulan belum terbayar</span>
            )}
          </p>
        </Card>

        <Card className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider">Total Iuran Terbayar</span>
            <Wallet className="w-4 h-4 text-forest-500" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
            {formatIDR(summary.total_lunas)}
          </p>
          <span className="text-xs text-stone-400">Kontribusi aktif untuk kas organisasi</span>
        </Card>
      </div>

      {/* Payment Instructions Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-stone-900 to-slate-900 border border-emerald-500/30 text-white space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-300 font-mono uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Rekening Resmi Kas Gandawesi
          </h3>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Khusus Kas Iuran
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-bold">Bank BNI (Kantor Kas UPI)</span>
            <p className="text-lg font-mono font-black text-emerald-300 tracking-wider">
              0982-1234-5678-90
            </p>
            <p className="text-stone-300 text-[11px]">a.n. <strong>GANDAWESI FPTI UPI</strong></p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-stone-400 text-[10px] uppercase font-bold">Bank Mandiri</span>
            <p className="text-lg font-mono font-black text-emerald-300 tracking-wider">
              132-00-9876543-2
            </p>
            <p className="text-stone-300 text-[11px]">a.n. <strong>BENDAHARA GANDAWESI</strong></p>
          </div>
        </div>

        <div className="text-[11px] text-stone-400 flex items-start gap-2 pt-1 border-t border-white/5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            Harap mencantumkan berita transfer dengan format: <strong>IURAN - [NAMA] - [PERIODE]</strong> (contoh: <em>IURAN - ALYA - 2025-06</em>) lalu klik tombol <strong>Konfirmasi Pembayaran</strong> di atas.
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider font-mono">
            Riwayat Tagihan & Pembayaran Iuran
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            {summary.riwayat_iuran.length} Periode Tercatat
          </span>
        </div>

        <Card className="overflow-hidden border border-stone-200 dark:border-stone-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Periode Bulan</th>
                  <th className="py-3 px-4">Nominal Iuran</th>
                  <th className="py-3 px-4">Tanggal Pembayaran</th>
                  <th className="py-3 px-4 text-center">Status Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {summary.riwayat_iuran.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100 font-mono">
                      {item.periode}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">
                      {formatIDR(item.nominal)}
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono">
                      {item.tanggal_bayar || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          item.status_bayar === 'lunas'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.status_bayar === 'lunas' ? 'Lunas' : 'Menunggak'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                <Send className="w-4 h-4" />
                Konfirmasi Pembayaran Iuran
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {confirmSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Konfirmasi Terkirim!</h4>
                <p className="text-xs text-stone-400">
                  Bendahara umum akan memverifikasi mutasi bank dan memperbarui status iuran Anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Periode Iuran:</label>
                  <input
                    type="month"
                    required
                    value={confirmForm.periode}
                    onChange={(e) => setConfirmForm((p) => ({ ...p, periode: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nominal Ditransfer (Rp):</label>
                  <input
                    type="number"
                    required
                    value={confirmForm.nominal}
                    onChange={(e) => setConfirmForm((p) => ({ ...p, nominal: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tautan Bukti Transfer (Opsional):</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={confirmForm.bukti}
                    onChange={(e) => setConfirmForm((p) => ({ ...p, bukti: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Catatan Tambahan:</label>
                  <textarea
                    rows={2}
                    placeholder="Misal: Transfer via BNI Mobile Banking dari rekening Budi..."
                    value={confirmForm.catatan}
                    onChange={(e) => setConfirmForm((p) => ({ ...p, catatan: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                  <Button type="button" variant="secondary" onClick={() => setShowConfirmModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" disabled={submittingConfirm} className="bg-emerald-600 text-white">
                    {submittingConfirm ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <Send className="w-3.5 h-3.5 mr-1" />}
                    Kirim Konfirmasi
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
