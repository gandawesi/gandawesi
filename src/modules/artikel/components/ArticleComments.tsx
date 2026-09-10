'use client';

import React, { useState } from 'react';
import { ArtikelKomentarItem } from '@/lib/types/content';
import { postArticleComment, deleteArticleComment } from '@/lib/actions/content';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  User,
  Clock,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ArticleCommentsProps {
  artikelId: string;
  initialComments: ArtikelKomentarItem[];
}

export default function ArticleComments({
  artikelId,
  initialComments,
}: ArticleCommentsProps) {
  const [comments, setComments] = useState<ArtikelKomentarItem[]>(initialComments);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [isi, setIsi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isi.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Tuliskan tanggapan atau pertanyaan Anda.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await postArticleComment({
        artikel_id: artikelId,
        nama: nama.trim() || 'Pembaca Gandawesi',
        email: email.trim() || undefined,
        isi: isi.trim(),
      });

      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data!]);
        setIsi('');
        setFeedbackMsg({
          type: 'success',
          text: 'Tanggapan berhasil dikirim ke forum diskusi artikel!',
        });
      } else {
        setFeedbackMsg({
          type: 'error',
          text: res.error || 'Gagal mengirim tanggapan. Silakan coba lagi.',
        });
      }
    } catch {
      setFeedbackMsg({
        type: 'error',
        text: 'Terjadi kesalahan jaringan saat mengirim tanggapan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tanggapan ini?')) return;

    try {
      const res = await deleteArticleComment(commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="pt-10 border-t border-stone-200 dark:border-stone-800 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 flex items-center justify-center text-forest-700 dark:text-forest-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100">
              Ruang Diskusi & Catatan Ekspedisi
            </h3>
            <p className="text-xs text-stone-500">
              {comments.length} Tanggapan dari Pembaca & Anggota Gandawesi
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 md:p-6 rounded-3xl bg-stone-50/90 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-4 shadow-sm"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
          <Sparkles className="w-4 h-4 text-forest-600 dark:text-forest-400" />
          Tuliskan Pertanyaan, Ulasan, atau Berbagi Pengalaman Anda
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 uppercase mb-1">
              Nama Lengkap / Panggilan
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Budi Santoso (kosongkan jika anonim)"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-500 uppercase mb-1">
              Email (Opsional, tidak dipublikasikan)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-500 uppercase mb-1">
            Isi Komentar / Tanggapan *
          </label>
          <textarea
            required
            rows={3}
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Bagikan pemikiran, pertanyaan jalur navigasi, maupun saran keselamatan..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500 resize-y leading-relaxed"
          />
        </div>

        {feedbackMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <Info className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Anggota aktif login akan diverifikasi otomatis dengan badge NIA resmi.</span>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="text-xs font-bold gap-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? 'Mengirim...' : 'Kirim Tanggapan'}
          </Button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="p-8 rounded-3xl bg-stone-50/50 dark:bg-stone-900/30 border border-dashed border-stone-300 dark:border-stone-800 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300">
              Belum ada tanggapan
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Jadilah yang pertama memberikan pandangan, pertanyaan teknik, atau apresiasi atas catatan ekspedisi ini.
            </p>
          </div>
        ) : (
          comments.map((komentar) => {
            const dateStr = new Date(komentar.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={komentar.id}
                className="p-4 md:p-5 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3 transition-all hover:border-stone-300 dark:hover:border-stone-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                        komentar.is_verified_member
                          ? 'bg-emerald-700 text-white ring-2 ring-emerald-400/40'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {komentar.nama.charAt(0) || 'U'}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs md:text-sm font-bold text-stone-900 dark:text-stone-100">
                          {komentar.nama}
                        </span>

                        {komentar.is_verified_member ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            {komentar.status_keanggotaan || 'Anggota Terverifikasi'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-500 dark:text-stone-400">
                            <User className="w-3 h-3 text-stone-400" />
                            Tamu Publik
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button (client moderation) */}
                  <button
                    type="button"
                    onClick={() => handleDelete(komentar.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all opacity-40 hover:opacity-100"
                    title="Hapus komentar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-12 whitespace-pre-line">
                  {komentar.isi}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
