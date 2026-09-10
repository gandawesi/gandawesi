# Gandawesi FPTI UPI — Sistem Informasi Manajemen Organisasi

Sistem informasi terpadu dan platform digital resmi **Perhimpunan Mahasiswa Pecinta Alam Gandawesi**, Fakultas Pendidikan Teknologi dan Kejuruan (FPTI), Universitas Pendidikan Indonesia (UPI) Bandung.

---

## Ringkasan Fitur Utama

Sistem ini melayani 3 entitas pengguna utama: **Publik / Guest**, **Anggota (Kaderisasi Berjenjang)**, dan **Dewan Pengurus & Danlat (CMS Governance)**.

### 1. Layanan Publik & Portal Kredibilitas (Bebas Login)
* **Beranda & Profil Organisasi**: Sejarah, visi, misi, kode etik, dan etalase **Prestasi & Rekognisi Lembaga** (Balai Besar Taman Nasional, Rektorat UPI).
* **Verifikasi KTA Publik (`/verifikasi/kta`)**: Validasi keaslian KTA anggota resmi secara mandiri via Nomor Induk Anggota (NIA) atau scan QR Code KTA.
* **Verifikasi E-Sertifikat Publik (`/verifikasi/sertifikat`)**: Validasi nomor registrasi piagam kaderisasi internal dan arsip rekognisi eksternal (BASARNAS, FPTI, dll).
* **Katalog Ekspedisi & Jurnal**: Portofolio ekspedisi rimba, gunung, dan caving beserta artikel/jurnal kepecintaalaman.
* **Pendaftaran Calon Siswa (`/daftar`)**: Formulir pendaftaran online dilengkapi portal pelacakan status seleksi mandiri.

### 2. Portal Anggota (Member Dashboard)
* **KTA Digital Interaktif**: Tampilan ID card tampak depan/belakang dengan foto profil dan QR Code dinamis.
* **Kurikulum Kaderisasi**: Pelacakan bina jasmani, modul materi, ujian post-test online, checklist logistik alat, dan agenda 4 pilar PPNIA (12 sesi kegiatan).
* **Lemari Sertifikat**: Akses seluruh piagam internal kaderisasi dan delegasi luar kampus, lengkap dengan tautan unduh pindaian (scan) fisik asli.
* **Iuran & Inventaris**: Riwayat pembayaran iuran, unggah bukti transfer, katalog alat outdoor, dan pengajuan peminjaman logistik.

### 3. Panel Admin, Pengurus DP & Danlat
* **Seleksi Calon Siswa**: Evaluasi berkas medis, skor & rekomendasi wawancara motivasi, wewenang prerogatif ACC kelulusan oleh **Komandan Latihan (Danlat)**, tab **Arsip Gugur AD/ART**, dan **Ekspor Rekap Excel (CSV)**.
* **Evaluasi Siswa & Sidang DP**: Presensi latihan fisik harian, bank soal post-test, dan sidang kelulusan Siswa $\rightarrow$ Medan Operasi oleh **Ketua Organisasi / Ketua DP**.
* **Manajemen Keuangan & Aset**: Buku Kas Umum, verifikasi iuran, anggaran per event, master katalog alat, dan ekspor laporan terstandarisasi UTF-8 BOM.
* **Manajemen Sertifikat & Storage**: Penerbitan piagam massal, pengarsipan sertifikat delegasi/institusional, dan kompresi WebP otomatis untuk menghemat kuota cloud.

---

## Arsitektur & Teknologi

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org) dengan Turbopack
* **Bahasa**: TypeScript 5
* **Styling**: Tailwind CSS & Lucide Icons
* **Backend / Database**: Supabase (PostgreSQL 15 dengan Row Level Security / RLS)
* **Autentikasi**: Supabase Auth (Google OAuth & Email Magic Link)
* **Storage**: Supabase Storage Buckets (`avatars`, `articles`, `receipts`, `documents`, `expeditions`) dengan kompresi WebP otomatis di sisi klien (penghematan ukuran 95–98%)
* **Ekspor Dokumen**: Standar CSV dengan UTF-8 Byte Order Mark (`\uFEFF`) untuk kompatibilitas penuh Microsoft Excel Windows

---

## Dokumentasi Lengkap (`docs/`)

Spesifikasi teknis dan perancangan sistem tersimpan rapi di direktori [`docs/`](file:///d:/gandawesi%20project/docs):

1. [daftar-halaman-gandawesi.md](file:///d:/gandawesi%20project/docs/daftar-halaman-gandawesi.md): Direktori lengkap 38 rute antarmuka pengguna (Publik, Anggota, Admin) beserta wewenang fungsinya.
2. [spesifikasi-fitur-gandawesi.md](file:///d:/gandawesi%20project/docs/spesifikasi-fitur-gandawesi.md): Aturan bisnis, alur kaderisasi, wewenang Danlat/DP, penyimpanan WebP, verifikasi publik, dan ekspor excel.
3. [prd-gandawesi.md](file:///d:/gandawesi%20project/docs/prd-gandawesi.md): Product Requirements Document, functional & non-functional requirements.
4. [schema-gandawesi.sql](file:///d:/gandawesi%20project/docs/schema-gandawesi.sql): Skema database PostgreSQL lengkap dengan constraint, trigger kuota/stok, dan RPC.
5. [rls-policy-gandawesi.sql](file:///d:/gandawesi%20project/docs/rls-policy-gandawesi.sql): Matriks kebijakan Row Level Security (RLS) per peran pengguna.
6. [erd-gandawesi.mermaid](file:///d:/gandawesi%20project/docs/erd-gandawesi.mermaid): Diagram relasi entitas visual (Mermaid ERD).
7. [sprint-plan-gandawesi.md](file:///d:/gandawesi%20project/docs/sprint-plan-gandawesi.md): Roadmap dan rekapitulasi penyelesaian sprint implementasi.

---

## Memulai Pengembangan Lokal

```bash
# 1. Pasang dependensi
npm install

# 2. Siapkan file konfigurasi environment
cp .env.example .env.local

# 3. Jalankan server pengembangan lokal
npm run dev

# 4. Validasi type-check & build produksi
npm run build
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
