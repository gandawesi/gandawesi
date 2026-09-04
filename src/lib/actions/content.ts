'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  ArtikelItem,
  CreateArtikelPayload,
  UpdateArtikelPayload,
  KontenStatisItem,
  RuteEkspedisiItem,
  CreateRuteEkspedisiPayload,
  SponsorshipItem,
  CreateDonasiPayload,
  ArtikelKategori,
} from '@/lib/types/content';

// Initial fallback mock data for articles
let MOCK_ARTIKEL: ArtikelItem[] = [
  {
    id: 'art-1',
    penulis_id: 'am-1',
    judul: 'Catatan Ekspedisi Karst Sawarna: Eksplorasi Lorong Bawah Tanah & Manajemen Risiko Caving',
    slug: 'catatan-ekspedisi-karst-sawarna-2024',
    kategori: 'laporan_ekspedisi',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    tanggal_publish: '2025-05-18T10:00:00Z',
    created_at: '2025-05-15T08:00:00Z',
    penulis_nama: 'Alya Putri Salsabila',
    penulis_nia: 'GW.32.235.GW',
    penulis_angkatan: 'Giri Wardhana (32)',
    konten: `Kawasan karst Sawarna di Banten Selatan menyimpan formasi speleothem dan sistem sungai bawah tanah yang menantang. Tim ekspedisi Gandawesi Angkatan 32 melakukan pemetaan lorong horizontal dan vertikal sepanjang 1.2 kilometer pada Mei 2024 lalu.

### Persiapan dan Analisis Hidrologi
Sebelum memasuki mulut gua Gua Lalay dan Gua Sikantor, tim melakukan observasi cuaca dan fluktuasi muka air sungai bawah tanah. Musim penghujan membawa bahaya banjir bandang (flash flood) di dalam lorong sempit, sehingga penetapan waktu masuk dan batas waktu darurat (cut-off time) menjadi mutlak.

### Penguasaan Single Rope Technique (SRT)
Penelusuran gua vertikal sedalam 35 meter menuntut keandalan pemasangan anchor (rigging) dan penggunaan descender serta croll yang bersih dari lumpur. Komunikasi antar-pitch dipandu dengan peluit kode morse karena sinyal radio HT tidak dapat menembus batuan gamping tebal.

### Pelestarian Ekosistem Bawah Tanah
Prinsip utama caving adalah tidak meninggalkan jejak selain jejak kaki dan tidak mengambil apa pun kecuali foto. Tim menjaga agar stalaktit aktif tidak tersentuh tangan secara langsung karena asam lemak pada kulit dapat menghentikan pertumbuhan kalsit mineral batuan.`,
  },
  {
    id: 'art-2',
    penulis_id: 'am-2',
    judul: '5 Prinsip Leave No Trace yang Wajib Diterapkan Setiap Pendaki Gunung dan Pegiat Rimba',
    slug: '5-prinsip-leave-no-trace-pendaki-gunung',
    kategori: 'tips',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    tanggal_publish: '2025-06-02T14:30:00Z',
    created_at: '2025-05-28T09:00:00Z',
    penulis_nama: 'Aditya Pratama Ramadhan',
    penulis_nia: 'GW.32.236.GW',
    penulis_angkatan: 'Giri Wardhana (32)',
    konten: `Mendaki gunung bukan sekadar tentang mencapai puncak dan memotret keindahan alam. Sebagai mahasiswa pecinta alam, etika konservasi adalah mahkota tertinggi yang membedakan penjelajah sejati dari sekadar penikmat rekreasi.

### 1. Rencanakan Perjalanan dan Persiapkan Diri
Ketahui peraturan kawasan lindung, cuaca ekstrem, dan bahaya satwa liar. Gunakan peta kompas analog untuk mengurangi ketergantungan pada baterai gawai.

### 2. Berjalan dan Berkemah di Permukaan yang Tahan
Jangan membuka jalur pintas baru yang memperparah erosi lereng gunung. Pasang tenda di lokasi camp resmi yang telah ditentukan oleh pengelola taman nasional.

### 3. Buang Sampah dan Limbah dengan Bertanggung Jawab
Bawa kembali seluruh sampah plastik, bungkus makanan, dan puntung rokok ke bawah. Buatlah lubang jamban (cathole) sedalam 15–20 cm setidaknya 60 meter dari sumber mata air.

### 4. Tinggalkan Apa yang Ditemukan
Jangan memetik bunga edelweiss, mengukir inisial di batang pohon cantigi, atau memindahkan batuan alam. Keindahan alam berhak dinikmati generasi pendaki berikutnya.

### 5. Hormati Satwa Liar dan Pendaki Lain
Amati satwa dari jarak aman dan jangan pernah memberi makan satwa liar agar insting berburu alaminya tidak rusak. Jaga volume suara dan hargai ketenangan malam di alam bebas.`,
  },
  {
    id: 'art-3',
    penulis_id: 'am-3',
    judul: 'Gandawesi Gelar Latihan Gabungan Single Rope Technique (SRT) di Tebing Citatah 125',
    slug: 'gandawesi-gelar-latgab-srt-citatah-125',
    kategori: 'berita',
    thumbnail: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    tanggal_publish: '2025-06-10T11:00:00Z',
    created_at: '2025-06-08T15:00:00Z',
    penulis_nama: 'Farhan Dwi Cahyo',
    penulis_nia: 'GW.32.237.GW',
    penulis_angkatan: 'Giri Wardhana (32)',
    konten: `Padalarang — Dalam rangka mematangkan kapasitas teknis kader penelusuran gua dan vertical rescue, Gandawesi FPTI UPI menyelenggarakan sesi latihan alam terbuka di Tebing Citatah 125, Kabupaten Bandung Barat pada akhir pekan lalu.

Kegiatan ini diikuti oleh 18 anggota aktif dan calon anggota muda di bawah bimbingan instruktur senior. Materi latihan mencakup ascending-descending pada lintasan bebas gantung, passing knot (melewati simpul sambungan tali), serta teknik evakuasi korban lintasan vertical (pick-off rescue).

Ketua Umum Gandawesi menegaskan bahwa latihan rutin ini merupakan pilar keselamatan operasional sebelum organisasi memberangkatkan tim ekspedisi besar pada semester depan.`,
  },
  {
    id: 'art-4',
    penulis_id: 'am-1',
    judul: 'Draft: Laporan Ekspedisi Pemetaan Sungai Citarik Jeram Grade IV',
    slug: 'draft-laporan-ekspedisi-sungai-citarik',
    kategori: 'laporan_ekspedisi',
    thumbnail: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80',
    status: 'review',
    tanggal_publish: null,
    created_at: '2025-06-12T16:00:00Z',
    penulis_nama: 'Alya Putri Salsabila',
    penulis_nia: 'GW.32.235.GW',
    penulis_angkatan: 'Giri Wardhana (32)',
    konten: `Laporan awal pemetaan arus deras dan hidrologi sungai Citarik Sukabumi untuk keperluan diklat arung jeram dan pertolongan pertama di air (swiftwater rescue). Draft ini diajukan ke dewan pengurus untuk kurasi sebelum dipublikasikan resmi.`,
  },
];

// Initial fallback mock data for static content
let MOCK_KONTEN_STATIS: Record<string, KontenStatisItem> = {
  'visi-misi': {
    id: 'ks-1',
    slug: 'visi-misi',
    judul: 'Visi & Misi Organisasi',
    konten: `### Visi
Menjadi organisasi mahasiswa pecinta alam yang unggul, berintegritas tinggi, berdaya saing dalam eksplorasi alam terbuka, serta konsisten dalam melestarikan lingkungan hidup demi peradaban manusia yang harmonis dengan alam.

### Misi
1. Menyelenggarakan pendidikan kaderisasi berjenjang yang disiplin, aman, dan berstandar keselamatan tinggi.
2. Mengembangkan kecakapan navigasi darat, rimba gunung, survival, dan manajemen ekspedisi bagi seluruh anggota.
3. Melaksanakan program konservasi sumber daya alam, rehabilitasi hutan, dan edukasi lingkungan di masyarakat.
4. Membangun jejaring persaudaraan yang solid antaranggota, almamater FPTI UPI, dan perhimpunan pecinta alam se-Indonesia.
5. Menjunjung tinggi kode etik pecinta alam Indonesia dan nama baik almamater Universitas Pendidikan Indonesia.`,
    updated_at: '2025-06-01T00:00:00Z',
  },
  'sejarah': {
    id: 'ks-2',
    slug: 'sejarah',
    judul: 'Sejarah Perjalanan Gandawesi',
    konten: `Gandawesi didirikan di lingkungan Fakultas Pendidikan Teknologi dan Kejuruan (FPTK / FPTI) Universitas Pendidikan Indonesia (UPI) Bandung oleh para mahasiswa pecinta rimba yang terpanggil untuk mengintegrasikan keilmuan keteknikan dan kecintaan mendalam terhadap kelestarian alam nusantara.

Nama "Gandawesi" melambangkan ketangguhan jiwa layaknya wesi (besi) dan keharuman budi pekerti (ganda) dalam mengarungi belantara, mendaki puncak gunung tertinggi, menelusuri lorong terdalam bumi, serta mengarungi jeram sungai terderas di Indonesia.

Hingga saat ini, Gandawesi telah melahirkan lebih dari 32 angkatan resmi yang mengabdi di berbagai bidang kepecintaalaman, riset lingkungan, mitigasi bencana, dan pemetaan geografis.`,
    updated_at: '2025-06-01T00:00:00Z',
  },
  'tentang': {
    id: 'ks-3',
    slug: 'tentang',
    judul: 'Profil Ringkas Gandawesi',
    konten: `Wadah pembinaan karakter, kecintaan alam, dan kepemimpinan mahasiswa FPTI UPI melalui alur kaderisasi berjenjang, kegiatan konservasi, dan ekspedisi alam bebas. Gandawesi bernaung di bawah civitas akademika Universitas Pendidikan Indonesia.`,
    updated_at: '2025-06-01T00:00:00Z',
  },
};

// Initial fallback mock data for expedition routes
let MOCK_RUTE_EKSPEDISI: RuteEkspedisiItem[] = [
  {
    id: 'rute-1',
    nama: 'Ekspedisi Karst & Sistem Perguaan Sawarna',
    lokasi: 'Kecamatan Bayah, Kabupaten Lebak, Banten',
    tanggal: '2024-11-08',
    deskripsi: 'Eksplorasi lorong horizontal dan vertikal sedalam 35 meter, pemetaan aliran sungai bawah tanah, dan sensus fauna gua (kelelawar dan artropoda troglobiont).',
    peserta: 'Tim Ekspedisi Angkatan 32 (8 Orang Penelusur)',
    foto: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'rute-2',
    nama: 'Lintas Jalur Rimba Gunung Ciremai via Apuy-Palutungan',
    lokasi: 'Taman Nasional Gunung Ciremai, Jawa Barat',
    tanggal: '2024-08-17',
    deskripsi: 'Ekspedisi navigasi darat malam hari, orientasi medan punggungan kawah, observasi vegetasi cantigi ungu, dan pengibaran bendera di atap Jawa Barat (3.078 mdpl).',
    peserta: 'Regu Pendaki Gandawesi (12 Anggota Aktif & Senior)',
    foto: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'rute-3',
    nama: 'Pemetaan Jeram Sungai Citarik Grade III-IV',
    lokasi: 'Sungai Citarik, Cikidang, Sukabumi',
    tanggal: '2025-05-02',
    deskripsi: 'Arung jeram ekspedisi sepanjang 17 km, analisis hidrologi seasonal discharge, dan simulasi flip-recovery perahu karet.',
    peserta: 'Tim Divisi Olahraga Arus Deras (ORAD) Gandawesi',
    foto: [
      'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

// Initial fallback mock data for sponsorship
let MOCK_SPONSORSHIP: SponsorshipItem[] = [
  {
    id: 'sp-1',
    nama_sponsor: 'Eiger Adventure Outdoor Equipment',
    jenis: 'sponsorship',
    nominal: 2000000,
    event_id: null,
    event_nama: 'Ekspedisi Ciremai',
    tanggal: '2025-06-01',
  },
  {
    id: 'sp-2',
    nama_sponsor: 'Alumni Gandawesi Angkatan 18',
    jenis: 'donasi',
    nominal: 1500000,
    event_id: null,
    event_nama: 'Dana Abadi Pembinaan',
    tanggal: '2025-05-20',
  },
  {
    id: 'sp-3',
    nama_sponsor: 'Bank BJB Cabang UPI',
    jenis: 'sponsorship',
    nominal: 3500000,
    event_id: null,
    event_nama: 'Dies Natalis Gandawesi ke-34',
    tanggal: '2025-05-15',
  },
];

async function getCurrentAnggota(supabase: any) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: anggota } = await supabase
    .from('anggota')
    .select('id, nama, nim, nia, is_admin')
    .eq('auth_user_id', session.user.id)
    .single();

  return anggota || null;
}

// ============================================================
// 1. GET PUBLIC ARTICLES (GUEST / PUBLIC)
// ============================================================
export async function getPublicArticles(kategori?: string): Promise<ArtikelItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('artikel')
      .select(`
        id,
        penulis_id,
        judul,
        slug,
        konten,
        kategori,
        thumbnail,
        status,
        tanggal_publish,
        created_at,
        penulis:penulis_id (
          id,
          nama,
          nia
        )
      `)
      .eq('status', 'published');

    if (kategori && kategori !== 'all') {
      query = query.eq('kategori', kategori);
    }

    const { data, error } = await query.order('tanggal_publish', { ascending: false });

    if (error || !data || data.length === 0) {
      let mock = MOCK_ARTIKEL.filter((a) => a.status === 'published');
      if (kategori && kategori !== 'all') {
        mock = mock.filter((a) => a.kategori === kategori);
      }
      return mock;
    }

    return (data as any[]).map((item: any) => {
      const penulis = Array.isArray(item.penulis) ? item.penulis[0] : item.penulis;
      return {
        id: item.id,
        penulis_id: item.penulis_id,
        judul: item.judul,
        slug: item.slug,
        konten: item.konten || '',
        kategori: item.kategori,
        thumbnail: item.thumbnail,
        status: item.status,
        tanggal_publish: item.tanggal_publish,
        created_at: item.created_at,
        penulis_nama: penulis?.nama || 'Anggota Gandawesi',
        penulis_nia: penulis?.nia || null,
      };
    });
  } catch {
    let mock = MOCK_ARTIKEL.filter((a) => a.status === 'published');
    if (kategori && kategori !== 'all') {
      mock = mock.filter((a) => a.kategori === kategori);
    }
    return mock;
  }
}

// ============================================================
// 2. GET ARTICLE BY SLUG (PUBLIC)
// ============================================================
export async function getArticleBySlug(slug: string): Promise<ArtikelItem | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('artikel')
      .select(`
        id,
        penulis_id,
        judul,
        slug,
        konten,
        kategori,
        thumbnail,
        status,
        tanggal_publish,
        created_at,
        penulis:penulis_id (
          id,
          nama,
          nia
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      const mock = MOCK_ARTIKEL.find((a) => a.slug === slug && a.status === 'published');
      return mock || null;
    }

    const rawPenulis: any = (data as any).penulis;
    const penulis = Array.isArray(rawPenulis) ? rawPenulis[0] : rawPenulis;

    return {
      id: data.id,
      penulis_id: data.penulis_id,
      judul: data.judul,
      slug: data.slug,
      konten: data.konten || '',
      kategori: data.kategori,
      thumbnail: data.thumbnail,
      status: data.status,
      tanggal_publish: data.tanggal_publish,
      created_at: data.created_at,
      penulis_nama: penulis?.nama || 'Anggota Gandawesi',
      penulis_nia: penulis?.nia || null,
    };
  } catch {
    return MOCK_ARTIKEL.find((a) => a.slug === slug) || null;
  }
}

// ============================================================
// 3. GET MY ARTICLES (MEMBER DASHBOARD)
// ============================================================
export async function getMyArticles(): Promise<ArtikelItem[]> {
  try {
    const supabase = await createClient();
    const current = await getCurrentAnggota(supabase);

    if (!current) {
      return MOCK_ARTIKEL.filter((a) => a.penulis_id === 'am-1');
    }

    const { data, error } = await supabase
      .from('artikel')
      .select('*')
      .eq('penulis_id', current.id)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_ARTIKEL.filter((a) => a.penulis_id === current.id || a.penulis_id === 'am-1');
    }

    return data.map((item: any) => ({
      id: item.id,
      penulis_id: item.penulis_id,
      judul: item.judul,
      slug: item.slug,
      konten: item.konten || '',
      kategori: item.kategori,
      thumbnail: item.thumbnail,
      status: item.status,
      tanggal_publish: item.tanggal_publish,
      created_at: item.created_at,
      penulis_nama: current.nama,
      penulis_nia: current.nia,
    }));
  } catch {
    return MOCK_ARTIKEL.filter((a) => a.penulis_id === 'am-1');
  }
}

// ============================================================
// 4. CREATE ARTICLE (MEMBER DRAFT)
// ============================================================
export async function createArticle(
  payload: CreateArtikelPayload
): Promise<{ success: boolean; data?: ArtikelItem; error?: string }> {
  try {
    const supabase = await createClient();
    const current = await getCurrentAnggota(supabase);

    const generatedSlug = payload.judul
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

    const insertData = {
      penulis_id: current?.id || null,
      judul: payload.judul.trim(),
      slug: generatedSlug,
      konten: payload.konten.trim(),
      kategori: payload.kategori,
      thumbnail: payload.thumbnail?.trim() || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      status: payload.status || 'draft',
      tanggal_publish: payload.status === 'published' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase.from('artikel').insert(insertData).select().single();

    if (error) {
      console.warn('DB createArticle fallback:', error.message);
      const newMock: ArtikelItem = {
        id: `art-${Date.now()}`,
        ...insertData,
        created_at: new Date().toISOString(),
        penulis_nama: current?.nama || 'Saya (Penulis)',
        penulis_nia: current?.nia || 'GW.32.235.GW',
      };
      MOCK_ARTIKEL.unshift(newMock);
      revalidatePath('/artikel');
      revalidatePath('/dashboard/artikel');
      revalidatePath('/dashboard/admin/artikel');
      return { success: true, data: newMock };
    }

    revalidatePath('/artikel');
    revalidatePath('/dashboard/artikel');
    revalidatePath('/dashboard/admin/artikel');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal membuat artikel' };
  }
}

// ============================================================
// 5. UPDATE ARTICLE (MEMBER / ADMIN)
// ============================================================
export async function updateArticle(
  payload: UpdateArtikelPayload
): Promise<{ success: boolean; data?: ArtikelItem; error?: string }> {
  try {
    const supabase = await createClient();

    const updateData: any = {};
    if (payload.judul !== undefined) updateData.judul = payload.judul.trim();
    if (payload.konten !== undefined) updateData.konten = payload.konten.trim();
    if (payload.kategori !== undefined) updateData.kategori = payload.kategori;
    if (payload.thumbnail !== undefined) updateData.thumbnail = payload.thumbnail;
    if (payload.slug !== undefined) updateData.slug = payload.slug ? payload.slug.trim() : null;
    if (payload.status !== undefined) {
      updateData.status = payload.status;
      if (payload.status === 'published') {
        updateData.tanggal_publish = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('artikel')
      .update(updateData)
      .eq('id', payload.id)
      .select()
      .single();

    if (error) {
      console.warn('DB updateArticle fallback:', error.message);
      const idx = MOCK_ARTIKEL.findIndex((a) => a.id === payload.id);
      if (idx !== -1) {
        MOCK_ARTIKEL[idx] = { ...MOCK_ARTIKEL[idx], ...updateData };
        revalidatePath('/artikel');
        revalidatePath('/dashboard/artikel');
        revalidatePath('/dashboard/admin/artikel');
        return { success: true, data: MOCK_ARTIKEL[idx] };
      }
      return { success: false, error: error.message };
    }

    revalidatePath('/artikel');
    revalidatePath('/dashboard/artikel');
    revalidatePath('/dashboard/admin/artikel');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengubah artikel' };
  }
}

// ============================================================
// 6. SUBMIT ARTICLE FOR REVIEW (MEMBER ACTION)
// ============================================================
export async function submitArticleForReview(id: string): Promise<{ success: boolean; error?: string }> {
  return updateArticle({ id, status: 'review' });
}

// ============================================================
// 7. GET ADMIN ARTICLES (ADMIN CURATION)
// ============================================================
export async function getAdminArticles(status?: string): Promise<ArtikelItem[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('artikel')
      .select(`
        id,
        penulis_id,
        judul,
        slug,
        konten,
        kategori,
        thumbnail,
        status,
        tanggal_publish,
        created_at,
        penulis:penulis_id (
          id,
          nama,
          nia
        )
      `);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (status && status !== 'all') {
        return MOCK_ARTIKEL.filter((a) => a.status === status);
      }
      return MOCK_ARTIKEL;
    }

    return (data as any[]).map((item: any) => {
      const penulis = Array.isArray(item.penulis) ? item.penulis[0] : item.penulis;
      return {
        id: item.id,
        penulis_id: item.penulis_id,
        judul: item.judul,
        slug: item.slug,
        konten: item.konten || '',
        kategori: item.kategori,
        thumbnail: item.thumbnail,
        status: item.status,
        tanggal_publish: item.tanggal_publish,
        created_at: item.created_at,
        penulis_nama: penulis?.nama || 'Anggota',
        penulis_nia: penulis?.nia || null,
      };
    });
  } catch {
    if (status && status !== 'all') {
      return MOCK_ARTIKEL.filter((a) => a.status === status);
    }
    return MOCK_ARTIKEL;
  }
}

// ============================================================
// 8. REVIEW ARTICLE (ADMIN ACTION: PUBLISH OR REJECT)
// ============================================================
export async function reviewArticle(
  id: string,
  action: 'publish' | 'reject',
  payload?: { slug?: string; kategori?: ArtikelKategori }
): Promise<{ success: boolean; error?: string }> {
  const newStatus = action === 'publish' ? 'published' : 'draft';
  return updateArticle({
    id,
    status: newStatus,
    slug: payload?.slug,
    kategori: payload?.kategori,
  });
}

// ============================================================
// 9. KONTEN STATIS (CMS PROFIL ORGANISASI)
// ============================================================
export async function getKontenStatis(slug: string): Promise<KontenStatisItem | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('konten_statis').select('*').eq('slug', slug).single();

    if (error || !data) {
      return MOCK_KONTEN_STATIS[slug] || null;
    }

    return data;
  } catch {
    return MOCK_KONTEN_STATIS[slug] || null;
  }
}

export async function getAllKontenStatis(): Promise<KontenStatisItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('konten_statis').select('*').order('slug');

    if (error || !data || data.length === 0) {
      return Object.values(MOCK_KONTEN_STATIS);
    }

    return data;
  } catch {
    return Object.values(MOCK_KONTEN_STATIS);
  }
}

export async function updateKontenStatis(
  slug: string,
  judul: string,
  konten: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('konten_statis').upsert(
      {
        slug,
        judul,
        konten,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.warn('DB updateKontenStatis fallback:', error.message);
      if (MOCK_KONTEN_STATIS[slug]) {
        MOCK_KONTEN_STATIS[slug].judul = judul;
        MOCK_KONTEN_STATIS[slug].konten = konten;
        MOCK_KONTEN_STATIS[slug].updated_at = new Date().toISOString();
      }
    }

    revalidatePath('/tentang');
    revalidatePath('/dashboard/admin/artikel');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan konten profil' };
  }
}

// ============================================================
// 10. RUTE EKSPEDISI (GALERI DOKUMENTASI PUBLIK)
// ============================================================
export async function getRuteEkspedisiList(): Promise<RuteEkspedisiItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('rute_ekspedisi').select('*').order('tanggal', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_RUTE_EKSPEDISI;
    }

    return data;
  } catch {
    return MOCK_RUTE_EKSPEDISI;
  }
}

export async function createRuteEkspedisi(
  payload: CreateRuteEkspedisiPayload
): Promise<{ success: boolean; data?: RuteEkspedisiItem; error?: string }> {
  try {
    const supabase = await createClient();

    const insertData = {
      nama: payload.nama.trim(),
      lokasi: payload.lokasi.trim(),
      tanggal: payload.tanggal || new Date().toISOString().split('T')[0],
      deskripsi: payload.deskripsi.trim(),
      peserta: payload.peserta.trim(),
      foto: payload.foto || [],
    };

    const { data, error } = await supabase.from('rute_ekspedisi').insert(insertData).select().single();

    if (error) {
      console.warn('DB createRuteEkspedisi fallback:', error.message);
      const newMock: RuteEkspedisiItem = {
        id: `rute-${Date.now()}`,
        ...insertData,
      };
      MOCK_RUTE_EKSPEDISI.unshift(newMock);
      revalidatePath('/ekspedisi');
      revalidatePath('/dashboard/admin/artikel');
      return { success: true, data: newMock };
    }

    revalidatePath('/ekspedisi');
    revalidatePath('/dashboard/admin/artikel');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menambahkan rute ekspedisi' };
  }
}

// ============================================================
// 11. SPONSORSHIP & DONASI PUBLIK
// ============================================================
export async function getPublicSponsorshipList(): Promise<SponsorshipItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sponsorship')
      .select('*, event:event_id(nama)')
      .order('tanggal', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return MOCK_SPONSORSHIP;
    }

    return data.map((s: any) => ({
      id: s.id,
      nama_sponsor: s.nama_sponsor,
      jenis: s.jenis,
      nominal: s.nominal,
      event_id: s.event_id,
      tanggal: s.tanggal,
      event_nama: s.event?.nama || null,
    }));
  } catch {
    return MOCK_SPONSORSHIP;
  }
}

export async function submitDonasiPublic(
  payload: CreateDonasiPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const insertData = {
      nama_sponsor: payload.nama_sponsor.trim(),
      jenis: payload.jenis,
      nominal: Number(payload.nominal),
      event_id: payload.event_id || null,
      tanggal: payload.tanggal || new Date().toISOString().split('T')[0],
    };

    const { error } = await supabase.from('sponsorship').insert(insertData);

    if (error) {
      console.warn('DB submitDonasiPublic fallback:', error.message);
      MOCK_SPONSORSHIP.unshift({
        id: `sp-${Date.now()}`,
        ...insertData,
      });
    }

    revalidatePath('/donasi');
    revalidatePath('/dashboard/admin/keuangan');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengirim komitmen dukungan' };
  }
}
