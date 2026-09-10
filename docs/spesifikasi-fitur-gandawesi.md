# Spesifikasi Fitur Website Gandawesi
**Organisasi Pecinta Alam Mahasiswa FPTI UPI**

---

## 1. Ringkasan

Website ini melayani tiga jenis pengguna utama: **Guest** (publik), **Admin/Pengurus** (CMS), dan **Anggota** (dengan beberapa status keanggotaan yang membentuk alur kaderisasi panjang). Sistem dirancang mengikuti alur kaderisasi riil organisasi, mulai dari pendaftaran calon anggota hingga menjadi alumni (Anggota Luar Biasa) dan Dewan Penasehat.

---

## 2. Role & Value Proposition

### Guest (publik)
- Lihat profil organisasi (visi misi, sejarah, struktur kepengurusan)
- Baca artikel/laporan ekspedisi
- Lihat event yang bersifat publik
- Daftar sebagai calon anggota (entry point utama)
- Lihat peta rute/ekspedisi (galeri pencapaian)
- Lihat halaman sponsorship/donasi

### Admin / Pengurus (CMS)
- Kelola seluruh alur pendaftaran & kaderisasi
- Kelola event, artikel, inventaris alat, keuangan
- Approve/reject di titik-titik keputusan tertentu sesuai role fungsional

### Anggota (dengan beberapa status — lihat Bagian 3)
- Status keanggotaan, NIA, dan riwayat kaderisasi terlihat di akun sendiri
- KTA digital (khusus yang sudah punya NIA)
- Ikut & daftar event
- Riwayat kegiatan pribadi & sertifikat
- Akses direktori anggota (via secure view publik)
- Peminjaman inventaris alat
- Submit draft artikel/laporan ekspedisi
- Cek & bayar status iuran

---

## 2.1 Role Akses Granular Sistem (`user_roles`)

Untuk mendukung wewenang persetujuan yang terdesentralisasi namun aman, sistem memisahkan **Status Keanggotaan** (jalur kaderisasi) dengan **Role Fungsional** (hak akses sistem). Hak akses granular dikelola dalam tabel `user_roles` dengan peran fungsional resmi:

| Role (`user_roles.role`) | Nama Peran | Deskripsi & Wewenang Utama | Titik Keputusan / Approval |
|---|---|---|---|
| `admin` | Super Admin | Akses penuh ke seluruh CMS, manajemen akun/role, konfigurasi tarif, dan penutupan buku kas | Seluruh modul sistem |
| `ketua_organisasi` / `ketua_dp` | Ketua Organisasi / Ketua DP | **Pimpinan tertinggi organisasi sekaligus pimpinan eksekutif Dewan Pengurus (hal yang sama, bukan dua peran berbeda).** Pengawasan umum, LPJ tahunan, dan penetapan kebijakan | Approval kelulusan Siswa $\rightarrow$ Medan Operasi & pengawasan umum |
| `ketua_medan_operasi` | Ketua Medan Operasi | Penanggung jawab manajerial operasional diklat lapangan | Koordinasi umum diklat lapangan |
| `danlat` | Komandan Latihan | Instruktur utama lapangan & penanggung jawab teknis seleksi kader | **Approval / ACC kelulusan Calon Siswa $\rightarrow$ Siswa** & evaluasi lapangan Medan Operasi |
| `pengurus_dp` | Pengurus DP | Anggota aktif jajaran Dewan Pengurus | Evaluasi berkala PPNIA & approval akhir PPNIA $\rightarrow$ Anggota Biasa |
| `panitia` | Panitia Kaderisasi | Tim operasional pelaksana diklat | Input presensi kegiatan, catatan kesehatan, catatan wawancara, & checklist alat |

> [!IMPORTANT]
> **Penyamaan Istilah Kepemimpinan:**
> **Ketua Organisasi dan Ketua Dewan Pengurus (Ketua DP) adalah entitas dan jabatan yang SAMA, bukan hal yang berbeda.** Dewan Pengurus adalah badan eksekutif organisasi Gandawesi yang dipimpin langsung oleh Ketua Organisasi. Dalam database/sistem, kode peran `ketua_organisasi` dan `ketua_dp` diperlakukan secara ekuivalen sebagai pimpinan tertinggi organisasi.

> **Prinsip Arsitektur:**
> 1. **Temporal & Multi-Role:** Setiap role memiliki masa berlaku (`periode_mulai` s.d. `periode_selesai`) dan flag `is_active`. Satu anggota bisa memegang beberapa role sekaligus (misalnya `pengurus_dp` merangkap `panitia`).
> 2. **Fallback Bootstrap:** Anggota pertama dapat memanfaatkan flag `is_admin = true` di tabel `anggota` untuk inisialisasi awal sebelum tabel `user_roles` terisi.

---

## 3. Alur & Status Keanggotaan

Status keanggotaan berjalan satu arah (linear), dengan opsi gugur di beberapa tahap awal:

```
Guest → daftar
  ↓
Calon Siswa (~1 bulan)
  ↓ lolos → Komandan Latihan (DANLAT) yang approve / ACC (Bukan Dewan Pengurus / DP)
Siswa (~3 bulan)
  ↓ lolos → Ketua Organisasi / Ketua Dewan Pengurus (DP) yang approve
Medan Operasi (~12 hari)
  ↓ lolos → dapat nama angkatan, jadi "Anggota Muda [Angkatan]"
PPNIA (~1 tahun)
  ↓ lolos → seluruh Dewan Pengurus (DP) yang approve
Evaluasi Akhir → NIA keluar → Anggota Biasa
  ↓ lulus studi
Anggota Luar Biasa (alumni, permanen)
  ↓ sebagian terpilih
Dewan Penasehat
```

Status lain (tidak termasuk jalur linear di atas):
- **Anggota Kehormatan** — dosen, ketua himpunan, dll (diberikan langsung, bukan lewat alur kaderisasi)
- **Dewan Pengurus (DP)** — badan eksekutif aktif, dipilih dari Anggota Biasa
- **Danlat / Instruktur lapangan** — role terpisah dari DP, mendampingi seleksi & Medan Operasi

### 3.1 Tahap Calon Siswa (~1 bulan)
| Aspek | Detail |
|---|---|
| Aktivitas | Formulir pendaftaran (dibuka 2 minggu), persetujuan orang tua, tes kesehatan awal, wawancara motivasi & komitmen |
| Tes kesehatan | Dua sumber data: catatan manual dari panitia + upload surat keterangan sehat dari dokter |
| Wawancara | Penilaian motivasi, pemahaman nilai cinta alam, ketahanan mental, dan komitmen waktu latihan fisik |
| Approval | **Komandan Latihan (DANLAT)** — murni wewenang Danlat, bukan Dewan Pengurus (DP) |
| Gugur & Arsip AD/ART | Sesuai AD/ART Gandawesi: Calon siswa yang dinyatakan belum memenuhi syarat/gugur **berhak mendaftar kembali pada periode/angkatan berikutnya**. Sistem menyediakan tab khusus "Arsip Gugur" dan fitur **Re-evaluasi Danlat** untuk membuka kembali tinjauan berkas jika ada banding/perbaikan data. |

### 3.2 Tahap Siswa (~3 bulan)
| Aspek | Detail |
|---|---|
| Bina jasmani | 2x/minggu, kehadiran dicatat **per sesi** (detail) |
| Pengumpulan alat | Alat pribadi & kelompok — sebagian dibeli sendiri, sebagian pinjam dari organisasi lain, sebagian pinjam dari inventaris Gandawesi |
| Pematerian | Presensi kehadiran + post-test online (soal dibuat admin, dijawab lewat HP) |
| Tes kesehatan akhir | Pola sama seperti tes awal, untuk membandingkan ada peningkatan atau tidak |
| Kelulusan | Tidak ada bobot/skor otomatis — keputusan penuh panitia/admin |
| Approval | Ketua Organisasi / Ketua Dewan Pengurus (DP) |
| Gugur | Bisa gugur, riwayat disimpan, boleh daftar lagi tahun berikutnya |

### 3.3 Tahap Medan Operasi (~12 hari)
| Aspek | Detail |
|---|---|
| Evaluasi | Individual **dan** kelompok |
| Pengawas | Danlat/instruktur lapangan — role terpisah dari DP |
| Gugur | Bisa terjadi di tengah proses, tapi jarang |
| Hasil lolos | Dapat nama angkatan (ditentukan musyawarah anggota muda sendiri, tapi diinput ke sistem oleh admin karena peserta tidak boleh pegang HP) → status jadi "Anggota Muda [Nama Angkatan]", belum ada NIA |

### 3.4 Tahap Anggota Muda & PPNIA (~1 tahun)
| Aspek | Detail |
|---|---|
| Isi kegiatan | Pematerian, presentasi (pra & pasca ekspedisi), pendakian/kegiatan (jumlah bebas, sesuai keputusan DP), ekspedisi akhir |
| Ekspedisi akhir | Dirancang sendiri oleh Anggota Muda; kelulusan dinilai dari presentasi pra & pasca |
| Kehadiran | Dicatat per pertemuan untuk semua jenis kegiatan (bina jasmani, pematerian, presentasi, pendakian, ekspedisi) |
| Evaluasi berkala | Ada evaluasi di tengah masa PPNIA sebagai peringatan dini untuk yang kurang aktif/siap |
| Evaluasi akhir | Kombinasi skor kuantitatif (kriteria fleksibel, ditentukan DP tiap periode) + keputusan kualitatif rapat DP |
| Approval | Seluruh Dewan Pengurus (DP) |
| Gugur | Tidak ada istilah gugur — batasnya hanya masa kuliah aktif. **Catatan gap aturan:** kasus "lulus kuliah tapi belum lulus PPNIA" belum diatur di AD/ART |

### 3.5 Status Anggota Biasa (NIA resmi)
| Aspek | Detail |
|---|---|
| Format NIA | Contoh: `GW.30.232.AB` = Gandawesi . angkatan ke-30 . nomor urut global . singkatan nama angkatan |
| Penomoran | Nomor urut global diisi **manual** oleh admin (bukan auto-generate), pengecekan duplikat dikelola admin di luar sistem |
| Setelah dapat status ini | Bisa dipilih jadi Ketua Organisasi (Ketua DP) / Ketua Medan Operasi (hasil dicatat, tanpa voting online), bisa jadi pengurus, wajib LPJ |
| LPJ | Dua jenis: LPJ kepengurusan tahunan & LPJ per kegiatan/ekspedisi yang dipegang |
| Riwayat jabatan | Disimpan penuh (siapa menjabat apa, periode berapa) — basis halaman Struktur Organisasi (opsional, tidak mandatory) |
| Pencabutan status | Ada mekanismenya di aturan organisasi, tapi belum pernah dipakai |
| Iuran menunggak | Murni catatan administratif, tidak ada sanksi otomatis |

### 3.6 Status Anggota Luar Biasa (alumni)
| Aspek | Detail |
|---|---|
| Trigger | Manual oleh admin berdasarkan laporan lisan, tanpa perlu bukti dokumen |
| Hak suara | Tetap punya hak suara dalam pemilihan ketua, jika hadir di rapat |
| Peran di diklat | Pelatih/pendamping/instruktur (bukan peserta) |
| Bisa jadi pengurus? | Tidak — posisi kepengurusan khusus Anggota Biasa yang masih aktif kuliah |
| Sifat status | Permanen, tidak bisa kembali ke Anggota Biasa |
| Iuran | Tetap wajib bulanan, tarif berbeda dari Anggota Biasa |

### 3.7 Dewan Penasehat
| Aspek | Detail |
|---|---|
| Sumber | Dipilih dari Anggota Luar Biasa |
| Yang memilih | Ketua Organisasi (Ketua DP) |
| Jumlah | Fleksibel, tidak dipatok |
| Masa jabatan | Mengikuti periode Dewan Pengurus yang menjabat |
| Sifat peran | Pasif — dihubungi saat dibutuhkan |
| Beda dengan instruktur diklat | Ya, dua peran terpisah meski sama-sama berasal dari Anggota Luar Biasa |
| Pencatatan | Field sederhana: anggota, periode mulai, periode selesai |

> **Catatan istilah penting:**
> 1. "DP" pada seluruh alur approval kaderisasi (Siswa, PPNIA) merujuk ke **Dewan Pengurus**, bukan Dewan Penasehat. Dua entitas ini harus dibedakan jelas di sistem (tabel/role terpisah).
> 2. **Ketua Organisasi dan Ketua Dewan Pengurus (Ketua DP) adalah entitas dan jabatan yang SAMA, bukan hal yang berbeda.** Dewan Pengurus adalah badan eksekutif organisasi Gandawesi yang dikepalai langsung oleh Ketua Organisasi.

---

## 4. Modul Fitur

### 4.1 Pendaftaran & Kaderisasi (inti)
- Form pendaftaran calon anggota per periode/angkatan
- Tracking status per tahap (lihat Bagian 3)
- Riwayat gugur (Calon Siswa/Siswa/Medan Operasi) — tersimpan, bisa daftar ulang tahun depan
- Presensi per sesi (bina jasmani, pematerian, presentasi, dll)
- Post-test online per materi (soal & jawaban lewat HP)
- Catatan tes kesehatan (awal & akhir) — catatan panitia + upload surat dokter
- Checklist kelengkapan alat (pribadi/kelompok, sumber: beli/pinjam luar/pinjam Gandawesi)
- Evaluasi berkala (peringatan dini selama PPNIA)
- Evaluasi akhir dengan kriteria dinamis (kuantitatif) + keputusan kualitatif
- Input NIA manual oleh admin setelah kelulusan

### 4.2 Event
- Kalender kegiatan (pendakian, diklat, rapat, kopdar) — sukarela, tanpa syarat wajib
- Pendaftaran peserta per event
- Presensi/kehadiran event

### 4.3 Artikel/Berita & Forum Diskusi
- Kategori: berita organisasi, laporan ekspedisi, tips
- Draft anggota → review redaksi admin → publish
- **Kolom Komentar & Diskusi Artikel (`/artikel/[slug]`)**:
  - Ruang diskusi publik untuk berbagi wawasan teknis, navigasi jalur, maupun apresiasi atas ekspedisi yang dituntaskan.
  - **Badge Keanggotaan Terverifikasi Otomatis**: Anggota yang login secara otomatis dikenali dengan lencana hijau `[Anggota Terverifikasi · NIA GW.xx.xxx.GW]`, sedangkan pembaca umum berstatus `[Tamu Publik]`.
  - Dilengkapi fitur moderasi penghapusan komentar spam oleh admin/pengurus.

### 4.4 Direktori Anggota
- Cari anggota by angkatan/status keanggotaan
- Profil anggota: NIA, angkatan, kontak

### 4.5 Inventaris Alat
- Daftar alat milik Gandawesi
- Pengajuan peminjaman → approval oleh admin
- Status: dipinjam/dikembalikan

### 4.6 KTA Digital & Sistem Sertifikat (Internal & Eksternal)
- **KTA Digital**:
  - Diterbitkan untuk anggota yang telah mengantongi Nomor Induk Anggota (NIA) resmi.
  - Dilengkapi foto profil asli dan **QR Code dinamis** yang terhubung langsung ke portal verifikasi publik (`/verifikasi/kta?nia=...`).
  - Mendukung layout cetak khusus (`@media print`) dengan tata letak bersih.
- **Sistem Piagam & Sertifikat**:
  - **Sertifikat Internal**: Piagam kelulusan kaderisasi (Diksar, PPNIA, pelantikan lapangan) atau kepanitiaan yang diterbitkan dan disahkan oleh Dewan Pengurus Gandawesi.
  - **Sertifikat Eksternal (Delegasi Anggota)**: Piagam pelatihan, kompetisi panjat tebing FPTI, sertifikasi pemandu gunung APGI, atau diklat Vertical Rescue BASARNAS yang diikuti oleh anggota sebagai utusan/delegasi resmi Gandawesi.
  - **Sertifikat / Piagam Institusional**: Penghargaan resmi dari mitra luar kampus yang dianugerahkan langsung kepada lembaga organisasi Gandawesi FPTI UPI (misal: Piagam Apresiasi Konservasi dari Balai Besar Taman Nasional atau Ormawa Award dari Rektorat UPI).
  - Dilengkapi fitur pengunggahan berkas pindaian (scan) fisik berformat WebP ke Supabase Storage, tombol download dokumen asli, serta integrasi nomor registrasi ke portal verifikasi publik.

### 4.7 Struktur Organisasi & Jabatan
- Riwayat jabatan penuh (anggota, jabatan, periode mulai-selesai)
- Halaman publik "Struktur Organisasi" per periode (opsional, tidak mandatory)
- Termasuk: Ketua Organisasi, Ketua Medan Operasi, Pengurus lain, Dewan Penasehat

### 4.8 Keuangan & Ekspor Laporan
- **Iuran wajib**: nominal per status keanggotaan (Anggota Muda/Biasa/Luar Biasa), nominal bisa berubah tergantung kebijakan pengurus yang menjabat
  - Anggota Muda mulai wajib iuran sejak status ini
  - Perubahan status di tengah bulan → iuran bulan itu tetap pakai tarif lama, tarif baru berlaku bulan berikutnya
  - Tunggakan = catatan administratif saja, tanpa sanksi otomatis
  - Konfirmasi bayar iuran mendukung unggah foto struk/screenshot transfer bank langsung dari HP dengan kompresi WebP otomatis.
- **RAB per event**: rencana anggaran + realisasi
- **Buku kas umum**: pemasukan (iuran, sponsorship, donasi, subsidi kampus, usaha mandiri) & pengeluaran, dengan bukti nota fisik terkompresi.
- **Ekspor Laporan Administratif (Excel / CSV)**:
  - Tombol ekspor Buku Kas (CSV) dan Rekap Iuran (CSV) berstandar UTF-8 BOM untuk pelaporan pertanggungjawaban bendahara.
- **Laporan keuangan periodik**: transparansi ke anggota
- **LPJ**: kepengurusan tahunan & per kegiatan/ekspedisi

### 4.9 Peta GIS Interaktif & Galeri Dokumentasi Ekspedisi
- **Peta GIS Interaktif Topografi Lintas Jalur (`/ekspedisi`)**:
  - Visualisasi berbasis Leaflet GIS & OpenStreetMap (100% open-source & gratis, tanpa limit kuota atau biaya API berbayar).
  - Menampilkan pos survei bertingkat: *Basecamp / Titik Awal* (biru), *Pos Jalur / Camp Transit* (hijau zamrud), *Puncak / Target Survei* (merah beranimasi), dan *Objek Khusus / Sump / Jeram* (amber).
  - Garis jejak lintasan (Polyline), pop-up koordinat GPS, elevasi mdpl, tingkat kesulitan (mudah, sedang, sulit, ekstrem), serta floating HUD ringkasan operasional.
  - Sinkronisasi interaktif dua arah antara kartu daftar rute dan tampilan peta ("Fokus di Peta").
- **Modul CMS Admin Ekspedisi**:
  - Input nama rute, lokasi, tanggal, deskripsi, tim partisipan, koordinat GPS (lat/lng), elevasi puncak (mdpl), tingkat kesulitan, serta format daftar titik pos waypoint.
  - `ImageUploader` WebP untuk mengunggah dokumentasi foto lapangan langsung ke Supabase Storage bucket `expeditions`.

### 4.10 Sponsorship/Donasi
- Halaman informasi cara berkontribusi (individu, brand, alumni)

### 4.11 Dashboard Admin
- Kelola seluruh modul di atas
- Statistik anggota per angkatan/status
- Approval di titik-titik keputusan (khusus role terkait: DANLAT, Ketua Organisasi / Ketua DP, seluruh Dewan Pengurus)

### 4.12 Layanan Verifikasi Publik Bebas Login
- **Verifikasi KTA Publik (`/verifikasi/kta`)**:
  - Dapat diakses secara terbuka tanpa login oleh pihak luar (petugas pos registrasi pendakian gunung, Balai Taman Nasional, panitia lomba panjat tebing/SAR, sponsor).
  - Memverifikasi keabsahan Nomor Induk Anggota (NIA) atau kode QR KTA.
  - Menampilkan nama lengkap, foto profil, status keanggotaan aktif, nomor & nama angkatan, program studi, dan tanggal pengesahan.
- **Verifikasi E-Sertifikat Publik (`/verifikasi/sertifikat`)**:
  - Memeriksa keabsahan nomor registrasi sertifikat digital dan piagam penghargaan.
  - Menampilkan kop resmi sertifikat, nama penerima (anggota atau institusi Gandawesi), jenis pencapaian, tanggal terbit, nama instansi penerbit (internal maupun eksternal), serta tombol akses dokumen scan asli.

### 4.13 Manajemen Storage & Kompresi Berkas Otomatis Sisi Klien
- Untuk mencegah penumpukan kuota penyimpanan Supabase Storage (kuota gratis 1 GB), seluruh input gambar di seluruh aplikasi diintegrasikan dengan komponen `ImageUploader` yang mengompresi gambar dari smartphone/kamera (JPG, PNG, HEIC) ke format modern **WebP** dengan kualitas 80-85%.
- Kompresi mereduksi ukuran file hingga **95-98%** (misal foto 5MB menjadi ~100-180 KB).
- Struktur bucket Supabase Storage:
  - `avatars`: Foto profil anggota (persegi 400x400 WebP).
  - `articles`: Foto cover dan ilustrasi artikel/jurnal (resolusi HD WebP).
  - `receipts`: Struk dan bukti transfer bank pembayaran iuran kas.
  - `documents`: Surat dokter tes kesehatan, surat persetujuan orang tua, dan pindaian (scan) sertifikat fisik.
  - `expeditions`: Dokumentasi galeri foto medan dan rute ekspedisi.

### 4.14 Sistem Ekspor Laporan Administratif (Excel / CSV dengan UTF-8 BOM)
- Menyediakan fungsi universal `exportToCSV` dengan Byte Order Mark (`\uFEFF`) agar seluruh karakter teks langsung terpisah menjadi kolom tabel yang rapi saat dibuka di Microsoft Excel Windows tanpa kendala decoding.
- Diterapkan pada 3 modul panel admin utama:
  1. **Seleksi Calon Siswa**: Ekspor rekap biodata pendaftar, kelengkapan berkas, catatan kesehatan dokter, skor & rekomendasi wawancara, status kelulusan Danlat.
  2. **Buku Kas & Iuran**: Ekspor buku kas umum dan rekapitulasi iuran anggota per periode.
  3. **Inventaris & Aset**: Ekspor log riwayat peminjaman alat dan master katalog aset fisik.

---

## 5. Pertanyaan Terbuka / Perlu Keputusan Pengurus

Hal-hal berikut belum diatur jelas di AD/ART organisasi atau sengaja diserahkan ke kebijakan pengurus saat itu — sistem sebaiknya dirancang fleksibel untuk mengakomodasi, bukan mengunci aturan kaku:

1. Kasus "sudah lulus kuliah tapi belum lulus PPNIA" — belum ada ketentuan resmi
2. Kriteria/bobot penilaian evaluasi akhir PPNIA — ditentukan DP tiap periode, bukan tetap
3. Nominal iuran per status — bisa berubah sesuai kebijakan pengurus yang menjabat
4. Mekanisme pencabutan status Anggota Biasa — ada aturannya tapi belum pernah dipraktikkan

---

*Dokumen ini dibuat berdasarkan diskusi eksplorasi fitur — siap dijadikan acuan desain database (ERD) dan pengembangan sistem.*
