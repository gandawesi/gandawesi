# Direktori & Spesifikasi Halaman Web Gandawesi

Dokumen ini memuat daftar lengkap seluruh halaman (pages/routes) yang terdapat dalam repositori sistem **Gandawesi**, dikelompokkan berdasarkan target pengguna (**Publik**, **Portal Anggota**, dan **Panel Admin / Pengurus / Danlat**), serta penjelasan detail mengenai fungsi dan apa saja yang dapat dilakukan pada masing-masing halaman.

---

## Ringkasan Statistik Halaman

| Kategori | Jumlah Halaman | Target Pengguna |
| :--- | :---: | :--- |
| **Halaman Publik & Autentikasi** | **11** | Khalayak umum, calon pendaftar, donatur, alumni, mitra eksternal |
| **Portal Anggota (Member Dashboard)** | **12** | Seluruh tingkatan anggota (Calon Siswa, Siswa, Anggota Muda, Anggota Biasa, ALB) |
| **Panel Admin & Pengurus (Governance)** | **15** | Admin, Ketua Organisasi / Ketua DP, Danlat, Pengurus DP, Panitia |
| **TOTAL HALAMAN UI** | **38 Halaman** | *(Di luar rute sistem seperti `/auth/callback`, `/_not-found`, `/api/health`)* |

---

## 1. Halaman Publik & Autentikasi (11 Halaman)

Halaman-halaman ini dapat diakses secara terbuka tanpa perlu login, kecuali halaman login yang berfungsi sebagai gerbang masuk.

| No | Rute Halaman | Nama / Judul | Yang Dapat Dilakukan Pengguna |
| :---: | :--- | :--- | :--- |
| 1 | `/` | **Beranda Utama (Landing Page)** | • Mengenal profil singkat, visi, dan filosofi Gandawesi.<br>• Melihat statistik organisasi terkini (jumlah anggota, ekspedisi, angkatan).<br>• Menjelajahi pilar aktivitas utama (Gunung Hutan, Caving, Panjat Tebing, Arung Jeram, Konservasi).<br>• Melihat cuplikan artikel/jurnal terbaru dan rute ekspedisi unggulan.<br>• Tombol aksi langsung (CTA) menuju pendaftaran calon siswa dan donasi. |
| 2 | `/tentang` | **Tentang Gandawesi & Prestasi Lembaga** | • Membaca sejarah pendirian organisasi dari masa ke masa.<br>• Memahami Visi, Misi, dan Kode Etik Pecinta Alam Gandawesi.<br>• Mempelajari makna lambang, warna bendera, dan atribut kebanggaan organisasi.<br>• **Prestasi & Penghargaan Lembaga**: Melihat etalase piagam resmi institusional yang dianugerahkan oleh Balai Besar Taman Nasional, kementerian, dan Rektorat UPI kepada Gandawesi.<br>• Tautan langsung ke portal verifikasi keabsahan piagam. |
| 3 | `/struktur` | **Bagan Struktur Organisasi** | • Melihat susunan kepengurusan Dewan Pengurus (DP) yang aktif.<br>• Mengenal pimpinan: **Ketua Organisasi / Ketua DP**, Wakil Ketua, Sekretaris, dan Bendahara.<br>• Mengetahui kepala divisi operasional lapangan (Divisi Konservasi, Ekspedisi, Logistik, Kaderisasi, Humas).<br>• Mengetahui susunan Dewan Penasehat / Pembina. |
| 4 | `/ekspedisi` | **Portofolio Ekspedisi & Penjelajahan** | • Menjelajahi catatan ekspedisi rimba, gunung, dan gua yang telah dituntaskan.<br>• Memfilter ekspedisi berdasarkan tahun, wilayah geografis, atau tingkat kesulitan.<br>• Membaca deskripsi rute, durasi penjelajahan, koordinat, dan galeri dokumentasi lapangan. |
| 5 | `/artikel` | **Direktori Artikel & Jurnal Publik** | • Membaca kabar terkini, rilis berita organisasi, dan opini anggota.<br>• Membaca jurnal teknis (navigasi darat, survival, pertolongan pertama rimba, teknik caving).<br>• Mencari artikel berdasarkan kata kunci dan memfilter berdasarkan kategori. |
| 6 | `/artikel/[slug]` | **Detail Pembaca Artikel Interaktif** | • Membaca konten artikel secara utuh dalam tipografi yang nyaman.<br>• Melihat profil penulis (nama anggota, angkatan/NIA, tanggal terbit, estimasi waktu baca).<br>• Berbagi tautan artikel ke media sosial dan menelusuri artikel rekomendasi terkait. |
| 7 | `/donasi` | **Portal Donasi & Sponsorship** | • Membaca informasi program donasi operasional, diksar, dan ekspedisi penelitian.<br>• Mengetahui rekening resmi organisasi dan panduan konfirmasi donasi.<br>• Mempelajari paket sponsorship bagi mitra brand outdoor atau instansi.<br>• Membaca FAQ transparansi alokasi dana dan pelaporan berkala. |
| 8 | `/daftar` | **Pendaftaran Calon Siswa & Pelacakan Seleksi** | • **Formulir Pendaftaran**: Mengisi biodata lengkap calon siswa, kontak darurat, riwayat medis, dan upload berkas pendaftaran (KTP/KTM, foto, surat dokter, persetujuan ortu) dengan kompresi WebP otomatis.<br>• **Portal Pelacakan Seleksi Mandiri**: Memeriksa status kelulusan calon siswa secara real-time dengan memasukkan NIM/Email.<br>• Memantau status verifikasi berkas, uji fisik/kesehatan, dan hasil evaluasi wawancara motivasi oleh Danlat. |
| 9 | `/login` | **Autentikasi & Masuk Akun** | • Masuk akun aman bagi anggota terdaftar dan admin.<br>• Mendukung autentikasi satu klik menggunakan **Google OAuth**.<br>• Mendukung login via Email / Magic Link.<br>• Tautan cepat menuju formulir pendaftaran calon siswa atau klaim akun alumni. |
| 10 | `/verifikasi/kta` | **Portal Verifikasi KTA Publik Bebas Login** | • Memverifikasi keaslian Kartu Tanda Anggota (KTA) resmi Gandawesi FPTI UPI tanpa perlu login.<br>• Mendukung pencarian via Nomor Induk Anggota (NIA) atau kode hash QR KTA.<br>• Menampilkan profil anggota, status keanggotaan aktif, angkatan, jurusan, dan tanggal pengesahan.<br>• Dilengkapi fitur salin tautan verifikasi dan cetak lembar validasi. |
| 11 | `/verifikasi/sertifikat` | **Portal Verifikasi E-Sertifikat Publik Bebas Login** | • Memvalidasi keaslian nomor registrasi piagam/sertifikat resmi tanpa perlu login.<br>• Mendukung verifikasi **Sertifikat Internal Kaderisasi** (Diksar, PPNIA, Pengukuhan NIA).<br>• Mendukung verifikasi **Arsip Rekognisi Eksternal** (Delegasi Anggota di BASARNAS/FPTI & Penghargaan Institusional Gandawesi dari Balai Taman Nasional/UPI).<br>• Tombol akses berkas pindaian (scan) fisik asli dan cetak piagam. |

---

## 2. Portal Anggota / Member Dashboard (12 Halaman)

Halaman-halaman ini khusus untuk anggota yang telah memiliki akun login. Fitur yang tampil menyesuaikan tahap status keanggotaan pengguna.

| No | Rute Halaman | Nama / Judul | Yang Dapat Dilakukan Anggota |
| :---: | :--- | :--- | :--- |
| 12 | `/dashboard` | **Executive & Member Analytics Dashboard** | • Melihat ringkasan status keanggotaan aktif (status kaderisasi, angkatan, NIA).<br>• Memantau statistik perkembangan diri (kehadiran bina fisik, modul post-test, agenda terdekat).<br>• Pengumuman penting dari Dewan Pengurus.<br>• Pintasan cepat (Quick Actions) ke KTA, materi diklat, iuran kas, dan peminjaman alat. |
| 13 | `/dashboard/profil` | **Profil Anggota & Rekam Jejak** | • Melihat dan memperbarui data pribadi (kontak, alamat, kontak darurat, golongan darah, riwayat pendidikan).<br>• Mengunggah foto profil (avatar) dengan kompresi WebP persegi otomatis.<br>• Melihat **Histori Tahap Kaderisasi** lengkap dari awal masuk (Calon Siswa di-ACC Danlat, Siswa di-ACC Ketua Organisasi/DP, Medan Operasi, hingga Anggota Biasa).<br>• Melihat riwayat jabatan kepengurusan atau kepanitiaan yang pernah diemban. |
| 14 | `/dashboard/kta` | **KTA (Kartu Tanda Anggota) Digital** | • Menampilkan kartu anggota digital interaktif (tampak depan dan belakang).<br>• Dilengkapi **QR Code resmi yang aktif** mengarah langsung ke `/verifikasi/kta?nia=...`.<br>• Foto profil anggota ditampilkan langsung pada kartu identitas.<br>• Tombol cetak kartu KTA dengan tata letak bersih (`@media print`). |
| 15 | `/dashboard/kaderisasi` | **Portal Kurikulum Diksar (Siswa)** | • **Bina Jasmani**: Memantau jadwal latihan fisik, absensi lari/push-up/pull-up, dan persentase kehadiran.<br>• **Materi & Post-Test**: Membaca materi diklat dasar dan mengerjakan ujian post-test pilihan ganda secara mandiri dari HP.<br>• **Checklist Alat**: Memeriksa daftar kelengkapan alat wajib pribadi & regu (status: siap/kurang/pinjam).<br>• **Tes Kesehatan**: Melihat catatan evaluasi fisik dan mengunggah surat kesehatan dokter. |
| 16 | `/dashboard/ppnia` | **Portal Pembinaan Lanjutan (PPNIA)** | • Khusus bagi Anggota Muda dalam masa pembinaan 1 tahun menuju NIA.<br>• **Jadwal & Agenda 4 Pilar (12 Sesi)**: Pematerian Lanjutan, Sidang Seminar/Presentasi, Pendakian Bersama, dan Ekspedisi Mandiri.<br>• Memantau persentase kehadiran kegiatan dan status verifikasi presensi.<br>• Melihat checklist syarat kelulusan pengukuhan Nomor Induk Anggota (NIA). |
| 17 | `/dashboard/iuran` | **Manajemen Iuran Kas Anggota** | • Melihat rincian tagihan iuran bulanan atau iuran wajib kegiatan.<br>• Memeriksa riwayat pembayaran yang sudah diverifikasi bendahara.<br>• Mengunggah foto struk/screenshot bukti transfer bank dengan kompresi otomatis ke Supabase Storage.<br>• Melihat status keuangan iuran pribadi (lunas/menunggak). |
| 18 | `/dashboard/inventaris` | **Peminjaman Alat Outdoor** | • Melihat katalog alat inventaris organisasi yang tersedia (tenda dome, carrier, webbing, carabiner, kompor lapangan, matras).<br>• Mengajukan formulir peminjaman alat (tujuan kegiatan, durasi pinjam, jumlah alat).<br>• Memantau status persetujuan peminjaman oleh divisi logistik.<br>• Memantau tanggal batas pengembalian alat. |
| 19 | `/dashboard/event` | **Kalender & Pendaftaran Acara** | • Melihat kalender acara mendatang (diksar, latihan gabungan, reuni akbar, webinar, bakti sosial).<br>• Mendaftar sebagai peserta pada acara yang membuka pendaftaran.<br>• Melihat informasi detail acara (lokasi GPS, rundown kegiatan, perlengkapan wajib).<br>• Presensi kehadiran acara. |
| 20 | `/dashboard/artikel` | **Ruang Penulis Anggota** | • Menulis draf artikel, catatan ekspedisi rimba, atau opini seputar konservasi.<br>• Mengunggah foto dokumentasi untuk sampul artikel dengan kompresi WebP otomatis.<br>• Mengelola artikel yang sudah dikirim (melihat status: Draf, Menunggu Review Redaksi, Diterbitkan). |
| 21 | `/dashboard/sertifikat` | **Lemari E-Sertifikat Anggota** | • Mengakses seluruh piagam digital resmi yang pernah diperoleh.<br>• **Filter Pil**: *Semua Koleksi*, *Internal Gandawesi*, dan *Eksternal & Delegasi*.<br>• Menampilkan tanda khusus piagam delegasi dari lembaga luar (BASARNAS, FPTI, dll).<br>• Pratinjau piagam beresolusi tinggi, unduh/lihat pindaian (scan) asli, dan link verifikasi publik langsung. |
| 22 | `/dashboard/direktori` | **Buku Direktori Anggota & Alumni** | • Mencari dan melihat profil sesama anggota atau alumni Gandawesi.<br>• Pencarian pintar berdasarkan Nama, Nomor Induk Anggota (NIA), Nama Angkatan, Status Keanggotaan, atau Jurusan.<br>• Mempererat silaturahmi dan jejaring relasi alumni di berbagai daerah. |
| 23 | `/dashboard/klaim` | **Klaim Akun Anggota Lama / Alumni** | • Disediakan khusus untuk alumni/anggota lama yang sudah memiliki NIA fisik sebelum sistem digital dibuat.<br>• Mengajukan klaim akun dengan memasukkan nomor NIA resmi, nama lengkap, dan bukti keanggotaan.<br>• Memantau status persetujuan klaim oleh admin verifikator. |

---

## 3. Panel Admin, Pengurus DP & Danlat (15 Halaman)

Halaman-halaman ini berada di bawah rute `/dashboard/admin/*` dan diproteksi dengan kontrol akses berbasis peran (Role-Based Access Control / RBAC).

| No | Rute Halaman | Nama / Judul | Yang Dapat Dilakukan Pengurus / Danlat |
| :---: | :--- | :--- | :--- |
| 24 | `/dashboard/admin/calon-siswa` | **Seleksi Calon Siswa (Wewenang Danlat)** | • **Metrik Pendaftaran**: Memantau total pendaftar, berkas, tes dokter, wawancara, dan arsip gugur.<br>• **Hasil Wawancara**: Menginput dan mengedit skor wawancara (0-100), tingkat rekomendasi, serta catatan motivasi.<br>• **Wewenang ACC Danlat**: Menetapkan keputusan kelulusan Calon Siswa $\rightarrow$ Siswa oleh Danlat.<br>• **Arsip Gugur AD/ART**: Menyimpan riwayat calon yang gugur dengan jaminan hak mendaftar ulang di periode berikutnya serta tombol *Re-evaluasi Danlat*.<br>• **Ekspor Excel**: Tombol ekspor seluruh data calon siswa terformat rapi UTF-8 BOM. |
| 25 | `/dashboard/admin/siswa` | **Manajemen Evaluasi Siswa & Sidang DP** | • **Presensi Bina Jasmani**: Menginput dan merekap kehadiran sesi latihan fisik harian/mingguan.<br>• **Bank Soal & Materi**: Membuat materi diklat baru beserta paket soal post-test pilihan ganda dan kunci jawaban.<br>• **Checklist Logistik**: Memverifikasi kelengkapan alat wajib siswa (milik sendiri/pinjam).<br>• **Sidang Kelulusan DP**: Mengambil keputusan akhir kelulusan **Siswa $\rightarrow$ Medan Operasi** oleh **Ketua Organisasi / Ketua DP** berdasarkan rekap jasmani, post-test, dan kesiapan alat. |
| 26 | `/dashboard/admin/medan-operasi` | **Evaluasi Lapangan Medan Operasi** | • **Penilaian Lapangan**: Menginput evaluasi performa individu dan dinamika kelompok selama simulasi/operasi survival rimba (oleh Danlat & Instruktur).<br>• **Pencatatan Insiden/Gugur**: Mencatat siswa yang mengalami cedera atau dinyatakan gugur di medan operasi.<br>• **Pengesahan Angkatan**: Menginput dan menetapkan **Nama Angkatan Resmi** hasil musyawarah angkatan untuk disahkan menjadi **Anggota Muda**. |
| 27 | `/dashboard/admin/ppnia` | **Monitoring & Evaluasi PPNIA** | • Memonitor progres peserta PPNIA selama 1 tahun pembinaan.<br>• Mengelola presensi 12 agenda kegiatan di 4 pilar (Pematerian, Sidang Presentasi, Pendakian Bersama, Ekspedisi Mandiri).<br>• Menilai kelayakan proposal pra-ekspedisi dan laporan pertanggungjawaban (LPJ) ekspedisi mandiri.<br>• Menyiapkan berkas evaluasi untuk sidang pleno pengukuhan Anggota Biasa. |
| 28 | `/dashboard/admin/approval` | **Pusat Persetujuan Terpadu (Approval Center)** | • Dashboard satu pintu untuk memantau seluruh titik persetujuan krusial organisasi:<br>  1. *Calon Siswa $\rightarrow$ Siswa* (oleh Danlat)<br>  2. *Siswa $\rightarrow$ Medan Operasi* (oleh Ketua Organisasi / Ketua DP)<br>  3. *Medan Operasi $\rightarrow$ Anggota Muda* (oleh Danlat & DP)<br>  4. *PPNIA $\rightarrow$ Anggota Biasa* (oleh Sidang Pleno Seluruh DP)<br>  5. *Peminjaman Alat & Klaim Akun Alumni*. |
| 29 | `/dashboard/admin/nia` | **Evaluasi Akhir & Generator NIA** | • **Manajemen Kriteria**: Menentukan indikator penilaian evaluasi akhir PPNIA beserta bobot persentasenya.<br>• **Input Nilai Sidang**: Memasukkan skor sidang pleno DP untuk masing-masing calon Anggota Biasa.<br>• **Penerbitan NIA Resmi**: Men-generate Nomor Induk Anggota (NIA) resmi unik otomatis berbasis tahun dan urutan kelulusan, lalu mengubah status pengguna menjadi **Anggota Biasa**. |
| 30 | `/dashboard/admin/keuangan` | **Sistem Buku Kas & Keuangan Organisasi** | • **Buku Kas Umum**: Mencatat transaksi kas masuk/keluar lengkap dengan bukti nota.<br>• **Verifikasi Iuran**: Memeriksa bukti transfer iuran anggota dan approval status bayar.<br>• **Tarif & Tagihan**: Menetapkan tarif iuran dan men-generate tagihan massal.<br>• **Ekspor CSV/Excel**: Tombol ekspor Buku Kas (CSV) dan Rekap Iuran (CSV) berstandar UTF-8 BOM. |
| 31 | `/dashboard/admin/inventaris` | **Manajemen Logistik & Aset Organisasi** | • **Katalog Master Alat**: Mengelola aset alat outdoor (kode, merk, stok, kondisi fisik).<br>• **Approval Peminjaman**: Menyetujui atau menolak permohonan pinjam alat dari anggota.<br>• **Penerimaan Pengembalian**: Melakukan cek fisik alat saat dikembalikan dan input denda/ganti rugi.<br>• **Ekspor CSV/Excel**: Tombol ekspor Log Peminjaman (CSV) dan Master Alat (CSV) untuk pelaporan logistik. |
| 32 | `/dashboard/admin/event` | **Manajemen Acara & Kepanitiaan** | • Membuat event/kegiatan baru (judul, deskripsi, tanggal mulai & selesai, lokasi GPS, kuota peserta).<br>• Memantau daftar anggota yang mendaftar pada acara tersebut.<br>• Mengelola presensi kehadiran peserta kegiatan.<br>• Mengarsipkan dokumentasi dan materi kegiatan. |
| 33 | `/dashboard/admin/artikel` | **Kurasi Redaksi, Konten & Galeri Ekspedisi** | • **Kurasi Artikel Anggota**: Meninjau draf artikel anggota (Approve/Edit/Tolak).<br>• **CMS Konten Statis**: Memperbarui teks halaman publik (Sejarah, Visi Misi, Makna Lambang, Kontak).<br>• **Katalog & Galeri Rute Ekspedisi**: Menambah dan memperbarui rute petualangan lengkap dengan **ImageUploader WebP** untuk dokumentasi foto medan jelajah. |
| 34 | `/dashboard/admin/sertifikat` | **Penerbitan & Arsip Sertifikat Terpadu** | • **Penerbitan Internal**: Menerbitkan piagam digital resmi untuk diksar, panitia, pemateri secara massal.<br>• **Arsip Sertifikat Eksternal**: Mencatat sertifikat dari lembaga luar untuk **Delegasi Anggota** (misal: BASARNAS, FPTI) maupun **Institusional Lembaga** (Balai TN, Rektorat UPI).<br>• **Upload Pindaian Fisik**: Mengunggah scan sertifikat fisik dengan kompresi WebP ke cloud storage.<br>• **Ekspor Excel / CSV**: Mengunduh seluruh basis data sertifikat terformat rapi. |
| 35 | `/dashboard/admin/klaim` | **Verifikasi Klaim Akun Alumni** | • Memeriksa daftar permohonan klaim akun dari anggota lama/alumni.<br>• Membandingkan data yang diajukan alumni dengan buku induk / master data NIA fisik.<br>• Menyetujui klaim (akun otomatis terhubung dengan NIA dan riwayat keanggotaan) atau menolak klaim disertai alasan. |
| 36 | `/dashboard/admin/roles` | **Manajemen Peran & Akses Pengguna (RBAC)** | • Mengelola penugasan hak akses pengguna dalam sistem.<br>• Memberikan atau mencabut peran fungsional (`admin`, `ketua_organisasi` / `ketua_dp`, `danlat`, `pengurus_dp`, `panitia`).<br>• Menentukan masa berlaku periode jabatan fungsional pengurus. |
| 37 | `/dashboard/admin/governance` | **Tata Kelola Dewan Pengurus & Transisi ALB** | • **Susunan Pengurus**: Mengelola daftar pengurus Dewan Pengurus (DP) aktif periode berjalan.<br>• **Dewan Penasehat**: Mengelola susunan dewan penasehat / pembina senior.<br>• **Transisi ke ALB**: Memproses transisi status bagi Anggota Biasa yang telah lulus masa studi perkuliahan menjadi **Anggota Luar Biasa (ALB)**. |
| 38 | `/dashboard/admin/import` | **Import Massal Data Anggota (CSV)** | • Mengunduh template standar CSV impor data anggota.<br>• Mengunggah file CSV/Excel berisi arsip data anggota lama atau alumni.<br>• Sistem otomatis memvalidasi format data (NIM, NIA, Nama, Angkatan, Status).<br>• Eksekusi batch insert ke database Supabase secara aman dan cepat. |

---

## Matriks Wewenang & Hak Akses Berdasarkan Peran

```
┌────────────────────────┬─────────┬─────────┬──────────────┬────────┬─────────────┬──────────┐
│ Modul / Halaman        │ Publik  │ Anggota │ Pengurus DP  │ Danlat │ Ketua Org/DP│  Admin   │
├────────────────────────┼─────────┼─────────┼──────────────┼────────┼─────────────┼──────────┤
│ Halaman Publik (1-9)   │    ✓    │    ✓    │      ✓       │   ✓    │      ✓      │    ✓     │
│ Portal Anggota (10-21) │    ✗    │    ✓    │      ✓       │   ✓    │      ✓      │    ✓     │
│ Seleksi Calon Siswa    │    ✗    │    ✗    │    Review    │  ACC   │   Review    │    ✓     │
│ Evaluasi Tahap Siswa   │    ✗    │    ✗    │      ✓       │   ✓    │  ACC Akhir  │    ✓     │
│ Medan Operasi          │    ✗    │    ✗    │    Review    │  Nilai │   Review    │    ✓     │
│ PPNIA & Sidang NIA     │    ✗    │    ✗    │    Sidang    │   ✓    │  Kukuhkan   │    ✓     │
│ Buku Kas & Keuangan    │    ✗    │    ✗    │  Bendahara   │   ✗    │   Review    │    ✓     │
│ Inventaris & Aset      │    ✗    │  Pinjam │   Logistik   │   ✓    │   Review    │    ✓     │
│ Event & Artikel CMS    │    ✗    │ Tulis/Ikut│   Kurasi     │   ✓    │   Review    │    ✓     │
│ Roles & Governance     │    ✗    │    ✗    │      ✗       │   ✗    │   Mandat    │    ✓     │
└────────────────────────┴─────────┴─────────┴──────────────┴────────┴─────────────┴──────────┘
```
