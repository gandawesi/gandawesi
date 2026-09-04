# Product Requirements Document (PRD)
## Website Gandawesi — Organisasi Pecinta Alam Mahasiswa FPTI UPI

---

## 1. Latar Belakang & Masalah

Gandawesi menjalankan alur kaderisasi keanggotaan yang panjang dan berlapis (Calon Siswa → Siswa → Medan Operasi → Anggota Muda/PPNIA → Anggota Biasa → Anggota Luar Biasa), beserta operasional organisasi (event, keuangan, inventaris, publikasi) yang saat ini kemungkinan besar masih dikelola manual/tersebar (spreadsheet, chat, dokumen fisik).

Tanpa sistem terpusat, ini menyebabkan:
- Riwayat kaderisasi tiap anggota (presensi, evaluasi, tes kesehatan) sulit dilacak dan mudah hilang
- Proses administrasi (NIA, KTA, iuran, LPJ) memakan waktu dan rawan human error
- Tidak ada media publik yang merepresentasikan kredibilitas organisasi ke calon anggota, alumni, dan sponsor

## 2. Tujuan Produk

1. Mendigitalkan seluruh alur kaderisasi keanggotaan, dari pendaftaran sampai Anggota Luar Biasa/Dewan Penasehat
2. Menyediakan sistem administrasi organisasi (keuangan, inventaris, event) yang terpusat dan transparan
3. Menyediakan media publik (artikel, profil organisasi, galeri ekspedisi, sponsorship) untuk membangun kredibilitas ke luar
4. Memberi setiap anggota visibilitas atas status dan riwayat keanggotaannya sendiri

## 3. Target Pengguna & Role

| Role | Deskripsi |
|---|---|
| **Guest** | Publik — calon anggota potensial, alumni, sponsor, masyarakat umum |
| **Admin/Pengurus** | Pengelola sistem — kaderisasi, event, keuangan, konten |
| **Anggota** | Mencakup seluruh status: Calon Siswa, Siswa, Anggota Muda, Anggota Biasa, Anggota Luar Biasa, Anggota Kehormatan, Dewan Penasehat |

Detail lengkap tiap status keanggotaan dan syarat transisinya ada di dokumen **Spesifikasi Fitur** (lihat lampiran).

## 4. Ruang Lingkup

### 4.1 Termasuk (in-scope)
- Modul pendaftaran & kaderisasi (semua tahap, presensi, evaluasi, post-test)
- Modul keanggotaan (profil, status, NIA, KTA digital, sertifikat)
- Modul governance (jabatan, riwayat jabatan, Dewan Penasehat, LPJ)
- Modul keuangan (iuran, tarif dinamis, buku kas, RAB event, sponsorship)
- Modul event (kalender, pendaftaran, presensi)
- Modul artikel/berita
- Modul inventaris alat
- Modul konten publik (peta rute/ekspedisi, halaman sponsorship/donasi)

### 4.2 Tidak termasuk (out-of-scope) — untuk versi awal
- Notifikasi otomatis (email/WhatsApp)
- Voting/pemilihan online (hasil pemilihan cukup dicatat manual)
- Sistem auto-generate nomor urut NIA (tetap manual oleh admin)
- Forum/diskusi internal
- Sanksi otomatis atas tunggakan iuran

## 5. Alur Keanggotaan (Ringkasan)

```
Calon Siswa → Siswa → Medan Operasi → Anggota Muda (PPNIA) → Anggota Biasa (NIA)
→ Anggota Luar Biasa → (sebagian) Dewan Penasehat
```

Detail lengkap tiap tahap, kriteria approval, dan aturan bisnis ada di dokumen **Spesifikasi Fitur** — dokumen ini menjadi acuan utama requirement fungsional.

## 6. Functional Requirements per Modul

### 6.1 Pendaftaran & Kaderisasi
- FR-1.1: Sistem menyediakan form pendaftaran calon anggota per periode/angkatan
- FR-1.2: Sistem mencatat status tiap anggota di tiap tahap (Calon Siswa/Siswa/Medan Operasi) termasuk riwayat gugur
- FR-1.3: Sistem mencatat presensi per sesi untuk bina jasmani, pematerian, presentasi, pendakian, dan ekspedisi
- FR-1.4: Sistem menyediakan post-test online per materi, dibuat oleh admin, dikerjakan anggota via HP
- FR-1.5: Sistem mencatat tes kesehatan (awal & akhir) berupa catatan panitia + upload surat dokter
- FR-1.6: Sistem mencatat checklist kelengkapan alat siswa (pribadi/kelompok, sumber: beli/pinjam luar/pinjam Gandawesi)
- FR-1.7: Sistem mendukung evaluasi individu dan kelompok untuk Medan Operasi
- FR-1.8: Sistem mendukung evaluasi berkala selama PPNIA sebagai peringatan dini
- FR-1.9: Sistem mendukung kriteria evaluasi akhir yang dinamis (dapat diubah tiap periode oleh Dewan Pengurus)
- FR-1.10: Admin dapat menginput NIA secara manual setelah kelulusan evaluasi akhir

### 6.2 Keanggotaan & Profil
- FR-2.1: Setiap anggota memiliki profil dengan status keanggotaan, angkatan, dan riwayat perubahan status
- FR-2.2: Sistem menerbitkan KTA digital dan sertifikat hanya untuk anggota yang sudah memiliki NIA
- FR-2.3: Anggota dapat melihat riwayat kaderisasi dan pencapaian pribadinya sendiri
- FR-2.4: Tersedia direktori anggota yang dapat difilter berdasarkan angkatan/status

### 6.3 Governance
- FR-3.1: Sistem mencatat riwayat jabatan organisasi (anggota, jabatan, periode) secara penuh, bukan hanya jabatan aktif
- FR-3.2: Sistem mencatat keanggotaan Dewan Penasehat (dipilih dari Anggota Luar Biasa) secara terpisah dari role instruktur
- FR-3.3: Sistem menyimpan hasil pemilihan ketua organisasi/ketua Medan Operasi (tanpa fitur voting online)
- FR-3.4: Sistem menyediakan tempat upload/pencatatan LPJ kepengurusan dan LPJ kegiatan
- FR-3.5: (Opsional) Halaman publik struktur organisasi per periode kepengurusan

### 6.4 Keuangan
- FR-4.1: Admin dapat mengatur tarif iuran per status keanggotaan, berlaku sejak tanggal tertentu
- FR-4.2: Sistem menghasilkan tagihan iuran bulanan berdasarkan status anggota yang berlaku di awal periode
- FR-4.3: Anggota dapat melihat status iuran pribadinya (lunas/menunggak)
- FR-4.4: Sistem mencatat transaksi kas (masuk/keluar) dengan kategori sumber dana dan bukti transaksi
- FR-4.5: Sistem mendukung RAB (rencana anggaran) dan realisasi per event
- FR-4.6: Sistem mencatat data sponsorship/donasi, termasuk keterkaitannya ke event tertentu

### 6.5 Event
- FR-5.1: Admin dapat membuat dan mengelola event (nama, jenis, lokasi, tanggal mulai/selesai, kuota, status)
- FR-5.2: Anggota dapat mendaftar ke event
- FR-5.3: Sistem mencatat presensi kehadiran event

### 6.6 Artikel
- FR-6.1: Anggota dapat membuat draft artikel
- FR-6.2: Admin dapat me-review dan mempublikasikan artikel
- FR-6.3: Guest dapat membaca artikel yang sudah dipublikasikan

### 6.7 Inventaris Alat
- FR-7.1: Admin mengelola daftar alat milik organisasi (nama, kategori, kondisi, stok)
- FR-7.2: Anggota dapat mengajukan peminjaman alat
- FR-7.3: Admin menyetujui/menolak pengajuan peminjaman
- FR-7.4: Sistem mencatat status peminjaman (dipinjam/dikembalikan)

### 6.8 Konten Publik
- FR-8.1: Halaman profil organisasi (visi misi, sejarah, struktur)
- FR-8.2: Halaman peta rute/ekspedisi yang pernah dilakukan
- FR-8.3: Halaman sponsorship/donasi

## 7. Non-Functional Requirements

- **NFR-1 Keamanan**: Data sensitif (tes kesehatan, data pribadi calon anggota) harus dilindungi dengan role-based access control; disarankan menerapkan Row Level Security jika memakai Supabase
- **NFR-2 Ketersediaan Data**: Riwayat status dan evaluasi anggota tidak boleh hilang meski status berubah (histori tetap disimpan, bukan overwrite)
- **NFR-3 Aksesibilitas**: Post-test dan presensi harus bisa diakses dari perangkat mobile (anggota mengisi lewat HP)
- **NFR-4 Fleksibilitas Aturan**: Kriteria evaluasi dan tarif iuran harus dapat diubah oleh admin tanpa perlu perubahan kode/database (data-driven, bukan hardcoded)

## 8. Ketergantungan & Referensi

- **Dokumen Spesifikasi Fitur** (`spesifikasi-fitur-gandawesi.md`) — rincian lengkap tiap tahap keanggotaan dan modul fitur
- **ERD** (`erd-gandawesi.mermaid`) — struktur relasi antar entitas (28 tabel, 9 section)
- **Skema SQL** (`schema-gandawesi.sql`) — DDL PostgreSQL/Supabase siap pakai, termasuk RPC function `update_profil_anggota()`
- **RLS Policy** (`rls-policy-gandawesi.sql`) — Row Level Security policies + helper functions (`is_admin()`, `has_role()`, `is_panitia_or_admin()`)
- **Sprint Plan** (`sprint-plan-gandawesi.md`) — rencana pengerjaan 12 sprint (~3 bulan)
- **Supabase Storage Buckets** — didefinisikan di catatan implementasi `schema-gandawesi.sql` (avatars, documents, slides, articles, certificates, receipts, expeditions)

## 9. Risiko & Pertanyaan Terbuka

1. Kasus "lulus kuliah tapi belum lulus PPNIA" belum diatur di AD/ART — perlu keputusan pengurus sebelum sistem menegakkan aturan otomatis di kasus ini
2. Kriteria evaluasi akhir PPNIA yang fleksibel (ditentukan DP tiap periode) membutuhkan UI admin yang cukup fleksibel untuk menambah/mengubah kriteria tanpa bantuan developer

## 10. Metrik Keberhasilan (usulan)

- Seluruh proses pendaftaran & evaluasi kaderisasi tercatat digital (0% tercecer di kertas/chat)
- Waktu penyusunan LPJ kegiatan berkurang karena data keuangan per event sudah terstruktur sejak awal
- Direktori anggota dan riwayat jabatan dapat diakses tanpa perlu bertanya ke pengurus lama

---

*PRD ini disusun berdasarkan eksplorasi fitur dan alur kaderisasi riil Gandawesi. Lihat dokumen Spesifikasi Fitur untuk detail lengkap tiap aturan bisnis.*
