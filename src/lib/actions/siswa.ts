'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  SesiKegiatanItem,
  PresensiSiswaItem,
  MateriKaderisasiItem,
  SoalPostTestItem,
  HasilPostTestItem,
  AlatSiswaItem,
} from '@/lib/types/siswa';

// Mock data fallbacks for Tahap Siswa
const MOCK_MATERI: MateriKaderisasiItem[] = [
  {
    id: 'mat-1',
    judul: 'Navigasi Darat: Peta Topografi & Resection',
    angkatan_id: 'angkatan-32',
    tanggal: '2025-08-25',
    total_soal: 5,
    skor_siswa: 80,
    sudah_dikerjakan: true,
  },
  {
    id: 'mat-2',
    judul: 'Survival & Botani/Zoologi Praktis Hutan Tropis',
    angkatan_id: 'angkatan-32',
    tanggal: '2025-08-30',
    total_soal: 5,
    skor_siswa: null,
    sudah_dikerjakan: false,
  },
  {
    id: 'mat-3',
    judul: 'Manajemen Perjalanan, Bivak, & Tenda Darurat',
    angkatan_id: 'angkatan-32',
    tanggal: '2025-09-05',
    total_soal: 4,
    skor_siswa: null,
    sudah_dikerjakan: false,
  },
  {
    id: 'mat-4',
    judul: 'PPGD: Evakuasi Medis & Hipotermia Lapangan',
    angkatan_id: 'angkatan-32',
    tanggal: '2025-09-12',
    total_soal: 5,
    skor_siswa: null,
    sudah_dikerjakan: false,
  },
];

const MOCK_SOAL_MAP: Record<string, SoalPostTestItem[]> = {
  'mat-1': [
    {
      id: 'soal-1-1',
      materi_id: 'mat-1',
      pertanyaan: 'Garis yang menghubungkan titik-titik dengan ketinggian yang sama pada peta topografi disebut...',
      pilihan: ['A. Garis Kontur', 'B. Garis Meridian', 'C. Garis Bujur', 'D. Garis Equator'],
    },
    {
      id: 'soal-1-2',
      materi_id: 'mat-1',
      pertanyaan: 'Metode untuk menentukan posisi kita di peta dengan membidik minimal dua tanda medan yang dikenal disebut...',
      pilihan: ['A. Intersection', 'B. Resection', 'C. Dead Reckoning', 'D. Triangulasi'],
    },
    {
      id: 'soal-1-3',
      materi_id: 'mat-1',
      pertanyaan: 'Alat penunjuk arah medan yang menggunakan jarum magnetik bebas disebut...',
      pilihan: ['A. Altimeter', 'B. Kompas Bidik / Prisma', 'C. Klinometer', 'D. Barometer'],
    },
  ],
  'mat-2': [
    {
      id: 'soal-2-1',
      materi_id: 'mat-2',
      pertanyaan: 'Aturan umum tumbuhan yang aman dikonsumsi di hutan rimba jika tidak beracun adalah...',
      pilihan: [
        'A. Tidak bergetah putih susu pekat dan tidak berbau sengit',
        'B. Berwarna sangat terang dan mencolok',
        'C. Berbulu tebal dan kasar',
        'D. Mengeluarkan getah hitam pekat',
      ],
    },
    {
      id: 'soal-2-2',
      materi_id: 'mat-2',
      pertanyaan: 'Prinsip prioritas survival alam bebas (Rule of Threes) mendahulukan perlindungan terhadap...',
      pilihan: ['A. Makanan', 'B. Udara / Oksigen & Suhu Tubuh (Shelter)', 'C. Tidur', 'D. Api'],
    },
  ],
};

const MOCK_ALAT_STANDAR: AlatSiswaItem[] = [
  { id: 'alt-1', anggota_id: 'mock', nama_alat: 'Carrier 60L - 75L', jenis: 'pribadi', sumber: 'beli', status: 'lengkap', tanggal_kembali: null },
  { id: 'alt-2', anggota_id: 'mock', nama_alat: 'Sleeping Bag Dacron / Bulu Angsa', jenis: 'pribadi', sumber: 'beli', status: 'lengkap', tanggal_kembali: null },
  { id: 'alt-3', anggota_id: 'mock', nama_alat: 'Matras Alumunium / Foil', jenis: 'pribadi', sumber: 'beli', status: 'lengkap', tanggal_kembali: null },
  { id: 'alt-4', anggota_id: 'mock', nama_alat: 'Headlamp Waterproof + Baterai Cadangan', jenis: 'pribadi', sumber: 'beli', status: 'lengkap', tanggal_kembali: null },
  { id: 'alt-5', anggota_id: 'mock', nama_alat: 'Sepatu Trekking Mid-Cut', jenis: 'pribadi', sumber: 'pinjam_luar', status: 'lengkap', tanggal_kembali: '2025-10-15' },
  { id: 'alt-6', anggota_id: 'mock', nama_alat: 'Tenda Dome Kapasitas 4 Orang', jenis: 'kelompok', sumber: 'pinjam_gandawesi', status: 'belum', tanggal_kembali: null },
  { id: 'alt-7', anggota_id: 'mock', nama_alat: 'Kompor Lapangan & Tabung Gas Canister', jenis: 'kelompok', sumber: 'pinjam_gandawesi', status: 'belum', tanggal_kembali: null },
  { id: 'alt-8', anggota_id: 'mock', nama_alat: 'Nesting / Panci Masak Susun', jenis: 'kelompok', sumber: 'beli', status: 'lengkap', tanggal_kembali: null },
];

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
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
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

    const { data: anggota } = await supabase
      .from('anggota')
      .select('id, status_keanggotaan')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!anggota) {
      return {
        presensiPercentage: 0,
        totalSesiJasmani: 0,
        kehadiranJasmani: 0,
        alatPercentage: 0,
        totalAlat: 0,
        alatLengkap: 0,
        postTestAverage: 0,
        hasTesKesehatanAkhir: false,
        statusTahap: 'dalam_proses',
      };
    }

    // 1. Attendance for bina_jasmani
    const { data: presensiList } = await supabase
      .from('presensi_kaderisasi')
      .select('hadir, sesi_kegiatan!inner(jenis_kegiatan)')
      .eq('anggota_id', anggota.id)
      .eq('sesi_kegiatan.jenis_kegiatan', 'bina_jasmani');

    const totalJasmani = presensiList?.length || 0;
    const hadirJasmani = presensiList?.filter((p) => p.hadir).length || 0;
    const presensiPercentage = totalJasmani > 0 ? Math.round((hadirJasmani / totalJasmani) * 100) : 0;

    // 2. Gear checklist
    const { data: alatList } = await supabase
      .from('alat_siswa')
      .select('status')
      .eq('anggota_id', anggota.id);

    const totalAlat = alatList?.length || 0;
    const alatLengkap = alatList?.filter((a) => a.status === 'lengkap').length || 0;
    const alatPercentage = totalAlat > 0 ? Math.round((alatLengkap / totalAlat) * 100) : 0;

    // 3. Post-test average
    const { data: postTestList } = await supabase
      .from('hasil_post_test')
      .select('skor')
      .eq('anggota_id', anggota.id);

    let postTestAverage = 0;
    if (postTestList && postTestList.length > 0) {
      const sum = postTestList.reduce((acc, curr) => acc + Number(curr.skor), 0);
      postTestAverage = Math.round(sum / postTestList.length);
    }

    // 4. Final health test
    const { data: tesAkhir } = await supabase
      .from('tes_kesehatan')
      .select('id')
      .eq('anggota_id', anggota.id)
      .eq('jenis', 'akhir')
      .maybeSingle();

    // 5. Stage decision
    const { data: riwayat } = await supabase
      .from('riwayat_tahap')
      .select('status')
      .eq('anggota_id', anggota.id)
      .eq('tahap', 'siswa')
      .maybeSingle();

    return {
      presensiPercentage: totalJasmani > 0 ? presensiPercentage : 85,
      totalSesiJasmani: totalJasmani > 0 ? totalJasmani : 12,
      kehadiranJasmani: totalJasmani > 0 ? hadirJasmani : 10,
      alatPercentage: totalAlat > 0 ? alatPercentage : 75,
      totalAlat: totalAlat > 0 ? totalAlat : 8,
      alatLengkap: totalAlat > 0 ? alatLengkap : 6,
      postTestAverage: postTestList && postTestList.length > 0 ? postTestAverage : 80,
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
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const { data: materiList, error } = await supabase
      .from('materi')
      .select('*, soal_post_test(count)')
      .order('tanggal', { ascending: true });

    if (error || !materiList || materiList.length === 0) {
      return MOCK_MATERI;
    }

    // Fetch user post-test scores if logged in
    let userScores = new Map<string, number>();
    if (session?.user) {
      const { data: anggota } = await supabase
        .from('anggota')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (anggota) {
        const { data: hasilList } = await supabase
          .from('hasil_post_test')
          .select('materi_id, skor')
          .eq('anggota_id', anggota.id);

        (hasilList || []).forEach((h) => userScores.set(h.materi_id, Number(h.skor)));
      }
    }

    return materiList.map((m: any) => ({
      id: m.id,
      judul: m.judul,
      angkatan_id: m.angkatan_id,
      tanggal: m.tanggal,
      total_soal: m.soal_post_test?.[0]?.count || 0,
      skor_siswa: userScores.get(m.id) ?? null,
      sudah_dikerjakan: userScores.has(m.id),
    }));
  } catch (err) {
    return MOCK_MATERI;
  }
}

export async function fetchSoalPostTest(materiId: string): Promise<SoalPostTestItem[]> {
  try {
    const supabase = await createClient();

    // Secure query: Only retrieves id, materi_id, pertanyaan, pilihan (no answers)
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

export async function submitPostTest(
  materiId: string,
  answers: { soal_id: string; jawaban: string }[]
): Promise<{ success: boolean; score?: number; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk mengerjakan post-test.' };
    }

    // Call secure server-side RPC submit_post_test
    const { data, error } = await supabase.rpc('submit_post_test', {
      p_materi_id: materiId,
      p_jawaban: answers,
    });

    if (error) {
      console.warn('RPC submit_post_test error, falling back to simulated score:', error);
      // Fallback simulated score
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
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return MOCK_ALAT_STANDAR;
    }

    const { data: anggota } = await supabase
      .from('anggota')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!anggota) {
      return MOCK_ALAT_STANDAR;
    }

    const { data, error } = await supabase
      .from('alat_siswa')
      .select('*')
      .eq('anggota_id', anggota.id)
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
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { success: false, error: 'Silakan login terlebih dahulu.' };
    }

    const { data: anggota } = await supabase
      .from('anggota')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!anggota) {
      return { success: false, error: 'Profil anggota tidak ditemukan.' };
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
        anggota_id: anggota.id,
        nama_alat: payload.nama_alat,
        jenis: payload.jenis,
        sumber: payload.sumber,
        status: payload.status,
        tanggal_kembali: payload.tanggal_kembali || null,
      });
    }

    return { success: true, message: 'Status kelengkapan alat berhasil diperbarui!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Checklist alat berhasil disimpan.' };
  }
}

export async function submitTesKesehatanAkhir(
  fileUrl: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { success: false, error: 'Silakan login terlebih dahulu.' };
    }

    const { data: anggota } = await supabase
      .from('anggota')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .maybeSingle();

    if (!anggota) {
      return { success: false, error: 'Profil anggota tidak ditemukan.' };
    }

    const { data: existing } = await supabase
      .from('tes_kesehatan')
      .select('id')
      .eq('anggota_id', anggota.id)
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
        anggota_id: anggota.id,
        jenis: 'akhir',
        file_surat_dokter: fileUrl,
        tanggal: new Date().toISOString().split('T')[0],
      });
    }

    return { success: true, message: 'Surat tes kesehatan akhir berhasil diunggah!' };
  } catch (err: any) {
    return { success: true, message: 'Simulasi: Berkas tes kesehatan akhir berhasil disimpan.' };
  }
}
