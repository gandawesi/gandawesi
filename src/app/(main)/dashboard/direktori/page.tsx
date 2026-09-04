'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchDirectory, fetchAngkatanList } from '@/lib/actions/directory';
import type { AnggotaDirektoriItem, AngkatanItem } from '@/lib/types/membership';
import { MEMBER_STATUS_LABELS, MemberStatus } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function DirektoriPage() {
  const [members, setMembers] = useState<AnggotaDirektoriItem[]>([]);
  const [angkatanList, setAngkatanList] = useState<AngkatanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAngkatan, setSelectedAngkatan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Load angkatan filter options
  useEffect(() => {
    async function loadAngkatan() {
      const list = await fetchAngkatanList();
      setAngkatanList(list);
    }
    loadAngkatan();
  }, []);

  // Load directory items
  const loadDirectory = useCallback(async () => {
    setLoading(true);
    const res = await fetchDirectory({
      q: searchQuery,
      angkatanId: selectedAngkatan,
      status: selectedStatus,
      page,
      limit: 12,
    });
    setMembers(res.data);
    setTotalCount(res.total);
    setTotalPages(res.totalPages);
    setLoading(false);
  }, [searchQuery, selectedAngkatan, selectedStatus, page]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadDirectory();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedAngkatan('all');
    setSelectedStatus('all');
    setPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-forest-900 via-forest-800 to-moss-900 text-white shadow-xl shadow-forest-950/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-700/60 border border-forest-500/30 text-forest-200 text-xs font-semibold mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Keluarga Besar Gandawesi FPTI UPI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Direktori Anggota
          </h1>
          <p className="text-forest-100/80 text-xs md:text-sm mt-1.5 leading-relaxed">
            Telusuri dan hubungkan jejaring lintas angkatan. Dari Calon Siswa hingga Anggota Luar Biasa dan Kehormatan.
          </p>
        </div>
        {/* Background aesthetic decorative shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-moss-500/20 to-transparent pointer-events-none" />
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 md:p-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Cari nama, NIA, atau jurusan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5">
            {/* Angkatan Filter */}
            <select
              value={selectedAngkatan}
              onChange={(e) => {
                setSelectedAngkatan(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-stone-200 dark:border-[#1c2b23] bg-white dark:bg-[#0f1814] px-3 py-2.5 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
            >
              <option value="all">Semua Angkatan</option>
              {angkatanList.map((a) => (
                <option key={a.id} value={a.id}>
                  Angkatan {a.nomor_angkatan} {a.nama_angkatan ? `(${a.nama_angkatan})` : ''}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-stone-200 dark:border-[#1c2b23] bg-white dark:bg-[#0f1814] px-3 py-2.5 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
            >
              <option value="all">Semua Status</option>
              {Object.entries(MEMBER_STATUS_LABELS).map(([statusKey, label]) => (
                <option key={statusKey} value={statusKey}>
                  {label}
                </option>
              ))}
            </select>

            {(searchQuery || selectedAngkatan !== 'all' || selectedStatus !== 'all') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="col-span-2 sm:col-span-1 text-xs text-stone-500 hover:text-stone-900"
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Directory Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-stone-500 font-medium">Memuat direktori anggota...</p>
        </div>
      ) : members.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800/80 flex items-center justify-center text-stone-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            Tidak Ada Anggota Ditemukan
          </h3>
          <p className="text-xs text-stone-500 max-w-sm">
            Tidak ada profil yang sesuai dengan filter pencarian Anda. Coba kata kunci lain atau reset filter.
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
            Reset Filter
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              Menampilkan <strong>{members.length}</strong> dari <strong>{totalCount}</strong> anggota
            </span>
            <span>
              Halaman {page} dari {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((member) => (
              <Card
                key={member.id}
                className="p-5 flex flex-col justify-between hover:border-forest-500/40 dark:hover:border-forest-500/40 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <Avatar
                      src={member.foto_profil}
                      name={member.nama}
                      size="lg"
                    />
                    <Badge
                      status={member.status_keanggotaan}
                      subLabel={
                        member.status_keanggotaan === 'anggota_muda' && member.nama_angkatan
                          ? member.nama_angkatan
                          : undefined
                      }
                      size="sm"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 dark:text-white line-clamp-1 group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">
                    {member.nama}
                  </h3>

                  <div className="mt-2 space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400 shrink-0" />
                      <span className="font-medium text-stone-700 dark:text-stone-300 truncate">
                        {member.nia ? member.nia : 'Belum ber-NIA'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">
                        {member.nomor_angkatan ? (
                          <>
                            Angkatan {member.nomor_angkatan}{' '}
                            {member.nama_angkatan && (
                              <span className="text-stone-400">({member.nama_angkatan})</span>
                            )}
                          </>
                        ) : (
                          'Kehormatan / Tanpa Angkatan'
                        )}
                      </span>
                    </div>

                    {member.jurusan && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{member.jurusan}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Gandawesi FPTI</span>
                  <span className="text-forest-600 dark:text-forest-400 font-medium">Terverifikasi</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Sebelumnya
              </Button>

              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
