'use client';

import React, { useState, useEffect } from 'react';
import { fetchMembersWithRoles, assignMemberRole, deactivateMemberRole, MemberWithRolesItem } from '@/lib/actions/admin-roles';
import { USER_ROLE_LABELS, FunctionalRole } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldCheck,
  Plus,
  X,
  UserCog,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
} from 'lucide-react';

export default function AdminRolesPage() {
  const [members, setMembers] = useState<MemberWithRolesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal assign role state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState<FunctionalRole>('panitia');
  const [periodeMulai, setPeriodeMulai] = useState(new Date().toISOString().split('T')[0]);
  const [periodeSelesai, setPeriodeSelesai] = useState('');

  const loadData = async () => {
    setLoading(true);
    const res = await fetchMembersWithRoles();
    setMembers(res.members);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    setProcessingId('assign');
    setFeedback(null);

    const res = await assignMemberRole(
      selectedMemberId,
      selectedRole,
      periodeMulai,
      periodeSelesai || undefined
    );

    setProcessingId(null);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Role berhasil diberikan!' });
      setAssignModalOpen(false);
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menetapkan role.' });
    }
  };

  const handleDeactivate = async (roleId: string) => {
    setProcessingId(roleId);
    setFeedback(null);

    const res = await deactivateMemberRole(roleId);
    setProcessingId(null);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message || 'Role dinonaktifkan!' });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Gagal menonaktifkan role.' });
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.nama.toLowerCase().includes(q) ||
      (m.nia && m.nia.toLowerCase().includes(q)) ||
      m.roles.some((r) => r.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Kelola Role & Kewenangan Anggota"
        description="Atur mandat fungsional kepengurusan (Ketua, Dewan Pengurus, Panitia Kaderisasi, Danlat) secara temporal"
        badge={
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Tata Kelola Hak Akses
          </span>
        }
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (members.length > 0) setSelectedMemberId(members[0].id);
              setAssignModalOpen(true);
            }}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Role Anggota
          </Button>
        }
      />

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.text}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Filter / Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nama anggota atau nama role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 dark:border-[#1c2b23] bg-white dark:bg-[#0f1814] pl-9 pr-3.5 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
          />
        </div>
      </div>

      {/* Member Roles Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-stone-500">Memuat data hak akses anggota...</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/60 text-stone-500 font-semibold border-b border-stone-100 dark:border-stone-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Anggota</th>
                  <th className="py-3 px-4">Angkatan</th>
                  <th className="py-3 px-4">Status Organisasi</th>
                  <th className="py-3 px-4">Role Fungsional Aktif</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                    <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{member.nama}</span>
                        {member.is_admin && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
                            Admin Flag
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400 font-normal">
                        {member.nia || member.jurusan || 'Tanpa NIA'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                      {member.angkatan?.nomor_angkatan
                        ? `Angkatan ${member.angkatan.nomor_angkatan}`
                        : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300 capitalize">
                      {member.status_keanggotaan.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      {member.roles.length === 0 ? (
                        <span className="text-stone-400 italic">Tidak ada role khusus</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {member.roles.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-forest-50 dark:bg-forest-950/60 text-forest-800 dark:text-forest-200 border border-forest-200 dark:border-forest-900/60"
                            >
                              <span>{USER_ROLE_LABELS[r.role] || r.role}</span>
                              <button
                                type="button"
                                title="Cabut role"
                                onClick={() => handleDeactivate(r.id)}
                                disabled={processingId === r.id}
                                className="hover:text-rose-600 text-stone-400 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMemberId(member.id);
                          setAssignModalOpen(true);
                        }}
                        className="text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Tambah
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Dialog: Assign Role */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Tetapkan Role Fungsional"
        description="Pilih kewenangan dan periode aktif anggota."
        maxWidth="md"
      >
        <form onSubmit={handleAssignRole} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
              Pilih Anggota
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} ({m.nia || m.status_keanggotaan})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
              Pilih Kewenangan / Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as FunctionalRole)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
            >
              {Object.entries(USER_ROLE_LABELS).map(([roleKey, label]) => (
                <option key={roleKey} value={roleKey}>
                  {label} ({roleKey})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
                Periode Mulai
              </label>
              <input
                type="date"
                value={periodeMulai}
                onChange={(e) => setPeriodeMulai(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              />
            </div>
            <div>
              <label className="font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block mb-1">
                Periode Selesai (Opsional)
              </label>
              <input
                type="date"
                value={periodeSelesai}
                onChange={(e) => setPeriodeSelesai(e.target.value)}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0f1814] px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAssignModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={processingId === 'assign'}>
              {processingId === 'assign' ? 'Menyimpan...' : 'Simpan Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
