'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchPendingClaims, approveClaim, rejectClaim } from '@/lib/actions/admin-claims';
import type { KlaimAkunItem } from '@/lib/types/membership';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Search,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export default function AdminKlaimPage() {
  const { isAdmin, isPanitiaOrAdmin } = useAuth();
  const [claims, setClaims] = useState<KlaimAkunItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'menunggu' | 'disetujui' | 'ditolak'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reject modal state
  const [rejectingClaim, setRejectingClaim] = useState<KlaimAkunItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadClaims = async () => {
    setLoading(true);
    const res = await fetchPendingClaims();
    setClaims(res.claims);
    setLoading(false);
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handleApprove = async (claimId: string) => {
    setProcessingId(claimId);
    setFeedback(null);
    const res = await approveClaim(claimId);
    setProcessingId(null);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Klaim disetujui!' });
      loadClaims();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menyetujui klaim.' });
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingClaim) return;

    setProcessingId(rejectingClaim.id);
    setFeedback(null);
    const res = await rejectClaim(rejectingClaim.id, rejectionReason);
    setProcessingId(null);
    setRejectingClaim(null);
    setRejectionReason('');

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Klaim ditolak.' });
      loadClaims();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menolak klaim.' });
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Verifikasi Klaim Akun Anggota"
        description="Validasi permohonan anggota lama yang menghubungkan email Google mereka ke database buku induk"
        badge={
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            Panel Verifikasi Pengurus
          </span>
        }
        action={
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
            {(['all', 'menunggu', 'disetujui', 'ditolak'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white dark:bg-forest-900 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {st === 'all' ? 'Semua' : st}
              </button>
            ))}
          </div>
        }
      />

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.text}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Claims List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-stone-500">Memuat daftar klaim akun...</p>
        </div>
      ) : filteredClaims.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="Tidak Ada Pengajuan Klaim"
          description={`Saat ini tidak ada permohonan klaim akun dengan filter "${filterStatus}".`}
        />
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <Card key={claim.id} className="p-5 md:p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-bold text-stone-900 dark:text-white">
                      {claim.anggota?.nama || 'Profil Tidak Ditemukan'}
                    </h3>

                    {claim.status === 'menunggu' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Menunggu Review
                      </span>
                    )}
                    {claim.status === 'disetujui' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Disetujui
                      </span>
                    )}
                    {claim.status === 'ditolak' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Ditolak
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                    <span>
                      Pemohon:{' '}
                      <strong className="text-stone-800 dark:text-stone-200">
                        {claim.user_email || `User ID: ${claim.auth_user_id.slice(0, 8)}...`}
                      </strong>
                    </span>
                    <span>
                      Angkatan:{' '}
                      <strong className="text-stone-800 dark:text-stone-200">
                        {claim.anggota?.angkatan?.nomor_angkatan || '-'}
                      </strong>
                    </span>
                    <span>
                      Status:{' '}
                      <strong className="text-stone-800 dark:text-stone-200">
                        {claim.anggota?.status_keanggotaan?.replace('_', ' ') || '-'}
                      </strong>
                    </span>
                    <span>
                      Diajukan:{' '}
                      <strong className="text-stone-800 dark:text-stone-200">
                        {new Date(claim.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                  </div>

                  {claim.catatan_admin && (
                    <div className="mt-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-400 font-semibold mb-0.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Catatan:</span>
                      </div>
                      <p className="text-stone-700 dark:text-stone-300">{claim.catatan_admin}</p>
                    </div>
                  )}
                </div>

                {/* Actions (only if status is 'menunggu') */}
                {claim.status === 'menunggu' && (
                  <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectingClaim(claim)}
                      disabled={processingId === claim.id}
                      className="text-rose-600 border-rose-300 dark:border-rose-800 hover:bg-rose-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Tolak
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(claim.id)}
                      disabled={processingId === claim.id}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      {processingId === claim.id ? 'Memproses...' : 'Setujui Klaim'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog for Rejecting Claim */}
      <Modal
        isOpen={!!rejectingClaim}
        onClose={() => {
          setRejectingClaim(null);
          setRejectionReason('');
        }}
        title={`Tolak Klaim Akun: ${rejectingClaim?.anggota?.nama || ''}`}
        description="Berikan alasan penolakan agar pemohon dapat memperbaiki data atau mengajukan konfirmasi ulang."
        maxWidth="md"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
              Alasan Penolakan
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              rows={3}
              placeholder="Contoh: NIM tidak sesuai dengan buku induk, atau akun terdeteksi duplikat..."
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setRejectingClaim(null);
                setRejectionReason('');
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={processingId === rejectingClaim?.id}
            >
              {processingId === rejectingClaim?.id ? 'Menyimpan...' : 'Konfirmasi Tolak'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
