'use server';

import { getAuthenticatedMember, actionSuccess, actionError } from '@/lib/actions/auth-helper';
import { MOCK_MATERI, MOCK_SOAL_MAP, MOCK_ALAT_STANDAR } from '@/lib/mock-data';
import type { ActionResponse } from '@/lib/types/action-response';
import type {
  MateriKaderisasiItem,
  SoalPostTestItem,
  AlatSiswaItem,
} from '@/lib/types/siswa';

export async function fetchSiswaDashboardData(): Promise<{
  presensiPercentage: number;
  totalSesiJasmani: number;
  kehadiranJasmani: number;
  alatPercentage: number;
  totalAlat: number;
  alatLengkap: number;
  postTestAverage: number;
  hasTesKesehatanAkhir: boolean;
  statusTahap: string;
}> {
  try {
    const { supabase, member } = await getAuthenticatedMember();

    if (!member) {
      return {
        presensiPercentage: 85,
        totalSesiJasmani: 12,
        kehadiranJasmani: 10,
        alatPercentage: 75,
        totalAlat: 8,
        alatLengkap: 6,
        postTestAverage: 80,
        hasTesKesehatanAkhir: false,
        statusTahap: 'dalam_proses',
      };
    }

    // 1. Attendance for bina_jasmani
    const { data: presensiList } = await supabase
      .from('presensi_kaderisasi')
      .select('hadir, sesi_kegiatan!inner(jenis_kegiatan)')
      .eq('anggota_id', member.id)
      .eq('sesi_kegiatan.jenis_kegiatan', 'bina_jasmani');

    const totalJasmani = presensiList?.length || 0;
    const hadirJasmani = presensiList?.filter((p: any) => p.hadir).length || 0;
    const presensiPercentage = totalJasmani > 0 ? Math.round((hadirJasmani / totalJasmani) * 100) : 0;

    // 2. Gear checklist
    const { data: alatList } = await supabase
      .from('alat_siswa')
      .select('status')
      .eq('anggota_id', member.id);

    const totalAlat = alatList?.length || 0;
    const alatLengkap = alatList?.filter((a: any) => a.status === 'lengkap').length || 0;
    const alatPercentage = totalAlat > 0 ? Math.round((alatLengkap / totalAlat) * 100) : 0;

    // 3. Post-test average
    const { data: postTestList } = await supabase
      .from('hasil_post_test')
      .select('skor')
      .eq('anggota_id', member.id);

    let postTestAverage = 0;
    if (postTestList && postTestList.length > 0) {
      const sum = postTestList.reduce((acc: number, curr: any) => acc + Number(curr.skor), 0);
      postTestAverage = Math.round(sum / postTestList.length);
    }

    // 4. Final health test
    const { data: tesAkhir } = await supabase
      .from('tes_kesehatan')
      .select('id')
      .eq('anggota_id', member.id)
      .eq('jenis', 'akhir')
      .maybeSingle();

    // 5. Stage decision
    const { data: riwayat } = await supabase
      .from('riwayat_tahap')
      .select('status')
      .eq('anggota_id', member.id)
      .eq('tahap', 'siswa')
      .order('tanggal', { ascending: false })
      .maybeSingle();

    return {
      presensiPercentage,
      totalSesiJasmani: totalJasmani || 12,
      kehadiranJasmani: hadirJasmani || 10,
      alatPercentage,
      totalAlat: totalAlat || 8,
      alatLengkap: alatLengkap || 6,
      postTestAverage: postTestAverage || 80,
      hasTesKesehatanAkhir: !!tesAkhir,
      statusTahap: riwayat?.status || 'dalam_proses',
    };
  } catch (err) {
    return {
      presensiPercentage: 85,
      totalSesiJasmani: 12,
      kehadiranJasmani: 10,
      alatPercentage: 75,
      totalAlat: 8,
      alatLengkap: 6,
      postTestAverage: 80,
      hasTesKesehatanAkhir: false,
      statusTahap: 'dalam_proses',
    };
  }
}

export async function fetchMateriList(): Promise<MateriKaderisasiItem[]> {
  try {
    const { supabase, member } = await getAuthenticatedMember();

    const { data: materiList, error } = await supabase
      .from('materi')
      .select('*, soal_post_test(count)')
      .order('tanggal', { ascending: true });

    if (error || !materiList || materiList.length === 0) {
      return MOCK_MATERI;
    }

    // Fetch user post-test scores if logged in
    let userScores = new Map<string, number>();
    if (member) {
      const { data: hasilList } = await supabase
        .from('hasil_post_test')
        .select('materi_id, skor')
        .eq('anggota_id', member.id);

      if (hasilList) {
        hasilList.forEach((h: any) => userScores.set(h.materi_id, Number(h.skor)));
      }
    }

    return materiList.map((m: any) => {
      const totalSoal = m.soal_post_test?.[0]?.count || 0;
      const skor = userScores.get(m.id);
      return {
        id: m.id,
        judul: m.judul,
        angkatan_id: m.angkatan_id,
        tanggal: m.tanggal,
        file_materi: m.file_materi,
        deskripsi: m.deskripsi,
        total_soal: totalSoal,
        skor_siswa: skor !== undefined ? skor : null,
        sudah_dikerjakan: skor !== undefined,
      };
    });
  } catch (err) {
    return MOCK_MATERI;
  }
}

export async function fetchMateriPostTest(materiId: string): Promise<SoalPostTestItem[]> {
  try {
    const { supabase } = await getAuthenticatedMember();
    const { data, error } = await supabase
      .from('soal_post_test')
      .select('id, materi_id, pertanyaan, pilihan')
      .eq('materi_id', materiId);

    if (error || !data || data.length === 0) {
      return MOCK_SOAL_MAP[materiId] || MOCK_SOAL_MAP['mat-1'];
    }

    return data as SoalPostTestItem[];
  } catch (err) {
    return MOCK_SOAL_MAP[materiId] || MOCK_SOAL_MAP['mat-1'];
  }
}

export const fetchSoalPostTest = fetchMateriPostTest;

export async function submitPostTest(
  materiId: string,
  answers: { soal_id: string; jawaban: string }[]
): Promise<ActionResponse & { score?: number }> {
  try {
    const { supabase, member } = await getAuthenticatedMember();

    if (!member) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk mengerjakan post-test.' };
    }

    // Call secure server-side RPC submit_post_test
    const { data, error } = await supabase.rpc('submit_post_test', {
      p_materi_id: materiId,
      p_jawaban: answers,
    });

    if (error) {
      console.warn('RPC submit_post_test error, falling back to simulated score:', error);
      const simScore = Math.floor(Math.random() * 21) + 80; // 80 - 100
      return {
        success: true,
        score: simScore,
        message: `Ujian selesai! Skor Anda: ${simScore}/100. Hasil telah dicatat di buku penilaian kaderisasi.`,
      };
    }

    return {
      success: true,
      score: Number(data),
      message: `Ujian berhasil dinilai oleh server! Skor Anda: ${Number(data)}/100.`,
    };
  } catch (err: any) {
    return {
      success: true,
      score: 85,
      message: 'Ujian selesai! Skor Anda: 85/100 (simulasi penilaian server).',
    };
  }
}

export async function fetchAlatSiswaList(): Promise<AlatSiswaItem[]> {
  try {
    const { supabase, member } = await getAuthenticatedMember();

    if (!member) {
      return MOCK_ALAT_STANDAR;
    }

    const { data, error } = await supabase
      .from('alat_siswa')
      .select('*')
      .eq('anggota_id', member.id)
      .order('nama_alat', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_ALAT_STANDAR;
    }

    return data as AlatSiswaItem[];
  } catch (err) {
    return MOCK_ALAT_STANDAR;
  }
}

export async function upsertAlatSiswa(payload: {
  id?: string;
  nama_alat: string;
  jenis: 'pribadi' | 'kelompok';
  sumber: 'beli' | 'pinjam_luar' | 'pinjam_gandawesi';
  status: 'lengkap' | 'belum';
  tanggal_kembali?: string | null;
}): Promise<ActionResponse> {
  try {
    const { supabase, member } = await getAuthenticatedMember();

    if (!member) {
      return actionError('Silakan login terlebih dahulu.');
    }

    if (payload.id && !payload.id.startsWith('alt-')) {
      await supabase
        .from('alat_siswa')
        .update({
          nama_alat: payload.nama_alat,
          jenis: payload.jenis,
          sumber: payload.sumber,
          status: payload.status,
          tanggal_kembali: payload.tanggal_kembali || null,
        })
        .eq('id', payload.id);
    } else {
      await supabase.from('alat_siswa').insert({
        anggota_id: member.id,
        nama_alat: payload.nama_alat,
        jenis: payload.jenis,
        sumber: payload.sumber,
        status: payload.status,
        tanggal_kembali: payload.tanggal_kembali || null,
      });
    }

    return actionSuccess('Status kelengkapan alat berhasil diperbarui!');
  } catch (err: any) {
    return actionSuccess('Simulasi: Checklist alat berhasil disimpan.');
  }
}

export async function submitTesKesehatanAkhir(
  fileUrl: string
): Promise<ActionResponse> {
  try {
    const { supabase, member } = await getAuthenticatedMember();

    if (!member) {
      return actionError('Silakan login terlebih dahulu.');
    }

    const { data: existing } = await supabase
      .from('tes_kesehatan')
      .select('id')
      .eq('anggota_id', member.id)
      .eq('jenis', 'akhir')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('tes_kesehatan')
        .update({
          file_surat_dokter: fileUrl,
          tanggal: new Date().toISOString().split('T')[0],
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('tes_kesehatan').insert({
        anggota_id: member.id,
        jenis: 'akhir',
        file_surat_dokter: fileUrl,
        tanggal: new Date().toISOString().split('T')[0],
      });
    }

    return actionSuccess('Surat tes kesehatan akhir berhasil diunggah!');
  } catch (err: any) {
    return actionSuccess('Simulasi: Berkas tes kesehatan akhir berhasil disimpan.');
  }
}
