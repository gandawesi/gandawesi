# Rencana Sprint — Website Gandawesi
**Solo developer · Sprint 1 minggu · 12 sprint (Sprint 0–11) untuk MVP**

Urutan sprint disusun berdasarkan dependensi: fondasi (auth & role) dulu, lalu alur kaderisasi berurutan sesuai tahapannya (karena tiap tahap bergantung pada tahap sebelumnya), baru modul operasional yang lebih independen.

---

## Sprint 0 — Fondasi & Auth
**Tujuan:** Project siap jalan, orang bisa login, role dasar bisa dibedakan.

- Setup project (Next.js + Supabase), deploy skeleton ke hosting
- Jalankan `schema-gandawesi.sql` + `rls-policy-gandawesi.sql` di Supabase
- Setup Supabase Storage buckets (`avatars`, `documents`, `slides`, `articles`, `certificates`, `receipts`, `expeditions`) + storage policies
- Integrasi Google Auth
- Layout dasar + navigasi (beda tampilan guest/anggota/admin)
- Middleware pengecekan role (`is_admin()`, `has_role()`, status keanggotaan) di sisi frontend — menggunakan tabel `user_roles` untuk role granular

**Selesai kalau:** orang bisa login pakai Google, dan sistem tahu apakah dia guest (belum ada row `anggota`), anggota, atau admin/panitia/danlat sesuai role-nya.

---

## Sprint 1 — Profil Anggota & Klaim Akun
**Tujuan:** Data anggota lama (migrasi) bisa dihubungkan ke akun baru.

- Halaman profil anggota (lihat status, angkatan, NIA, biodata lengkap — update lewat RPC `update_profil_anggota`)
- Direktori anggota (list + filter angkatan/status) — mengonsumsi secure view `v_anggota_direktori` agar data sensitif/PII terlindungi
- Form "klaim akun" (cari via email dummy yang dibagikan) → insert ke `klaim_akun`
- Dashboard admin: daftar klaim masuk → approve/reject
- **Migrasi data anggota lama** (item besar):
  - Halaman admin untuk bulk-import dari spreadsheet (CSV/Excel)
  - Mapping kolom spreadsheet → field tabel `anggota`
  - Validasi data (format NIA, email duplikat, angkatan valid)
  - Error handling & laporan import (berapa berhasil/gagal)
  - Setup `user_roles` awal untuk pengurus aktif

**Selesai kalau:** anggota lama bisa klaim akunnya sendiri dan admin bisa approve.

---

## Sprint 2 — Pendaftaran Calon Siswa
**Tujuan:** Alur pendaftaran awal jalan end-to-end.

- Form pendaftaran calon anggota (biodata, upload persetujuan ortu)
- Upload surat keterangan sehat (tes kesehatan awal) oleh calon siswa
- Input catatan kesehatan oleh panitia (admin)
- Dashboard admin: daftar calon siswa per periode
- Approval oleh Ketua Medan Operasi/DANLAT → status jadi Siswa (atau gugur, dengan catatan riwayat)

**Selesai kalau:** satu siklus pendaftaran dari isi form sampai keputusan lolos/gugur bisa dilakukan penuh di sistem.

---

## Sprint 3 — Tahap Siswa
**Tujuan:** Tracking aktivitas 3 bulan tahap Siswa.

- Presensi bina jasmani per sesi (input admin/panitia)
- Checklist kelengkapan alat (pribadi/kelompok, sumber: beli/pinjam luar/pinjam Gandawesi)
- Modul pematerian: admin buat materi + soal & kunci jawaban (tabel terpisah), siswa kerjakan lewat HP dan dinilai aman di server via RPC `submit_post_test`
- Tes kesehatan akhir (pola sama seperti awal, dibandingkan dengan hasil awal)
- Dashboard rekap kehadiran & nilai untuk bahan keputusan panitia
- Approval oleh Ketua DP → status jadi lolos Medan Operasi (atau gugur)

**Selesai kalau:** panitia bisa lihat rekap lengkap satu siswa sebelum memutuskan kelulusan.

---

## Sprint 4 — Medan Operasi & Anggota Muda
**Tujuan:** Transisi ke status Anggota Muda.

- Input evaluasi individu & kelompok Medan Operasi (oleh Danlat/instruktur — role terpisah)
- Pencatatan gugur di tengah proses (jarang tapi perlu ada)
- Input nama angkatan oleh admin (hasil musyawarah anggota muda)
- Perubahan status otomatis jadi "Anggota Muda [Nama Angkatan]"

**Selesai kalau:** satu angkatan bisa keluar dari Medan Operasi dengan nama angkatan tercatat dan status ter-update.

---

## Sprint 5 — PPNIA (bagian 1: aktivitas & presensi)
**Tujuan:** Tracking kegiatan setahun PPNIA.

- Presensi per jenis kegiatan (pematerian, presentasi, pendakian, ekspedisi)
- Form presentasi (pra & pasca ekspedisi) + upload materi
- Rencana ekspedisi (diajukan anggota muda, disetujui DP)
- Evaluasi berkala (watchlist "perlu perhatian" untuk DP)

**Selesai kalau:** DP bisa pantau progres tiap anggota muda selama PPNIA tanpa perlu catatan manual di luar sistem.

---

## Sprint 6 — PPNIA (bagian 2: evaluasi akhir & NIA)
**Tujuan:** Kelulusan PPNIA dan penerbitan NIA.

- UI admin untuk membuat kriteria evaluasi dinamis per periode
- Input nilai evaluasi per kriteria per anggota
- Keputusan kualitatif rapat DP (catatan + status akhir)
- Input NIA manual oleh admin (dengan validasi format & duplikat)
- Perubahan status jadi Anggota Biasa

**Selesai kalau:** satu anggota muda bisa dievaluasi dan resmi jadi Anggota Biasa dengan NIA tercatat.

---

## Sprint 7 — KTA, Sertifikat & Governance
**Tujuan:** Identitas resmi & struktur organisasi.

- Generate KTA digital (gated: hanya kalau NIA sudah ada)
- Generate/upload sertifikat
- Riwayat jabatan organisasi (input admin) + halaman publik struktur organisasi
- Pencatatan Dewan Penasehat (dipilih dari Anggota Luar Biasa)
- Transisi manual ke status Anggota Luar Biasa (dicatat admin berdasar laporan lisan)

**Selesai kalau:** anggota yang sudah NIA bisa download KTA-nya sendiri, dan halaman struktur organisasi tampil publik.

---

## Sprint 8 — Keuangan
**Tujuan:** Iuran & pembukuan dasar.

- Setting tarif iuran per status (bisa diubah admin, berlaku sejak tanggal tertentu)
- Generate tagihan iuran bulanan otomatis (memanggil RPC `generate_tagihan_iuran_bulanan()` via `pg_cron` / cron scheduler / tombol trigger admin)
- Halaman status iuran pribadi (anggota) + rekap tunggakan (admin)
- Buku kas: input transaksi masuk/keluar + kategori + bukti
- RAB per event (rencana vs realisasi)
- LPJ (upload, kepengurusan & kegiatan)

**Selesai kalau:** admin bisa tutup buku kas bulanan dari data yang ada di sistem, tanpa spreadsheet terpisah.

---

## Sprint 9 — Event & Inventaris
**Tujuan:** Operasional kegiatan reguler.

- Kalender & CRUD event (admin)
- Pendaftaran event oleh anggota
- Presensi event
- Daftar alat inventaris (admin)
- Pengajuan & approval peminjaman alat

**Selesai kalau:** event non-kaderisasi bisa dibuat, didaftar, dan alat bisa dipinjam lewat sistem.

---

## Sprint 10 — Konten Publik & Artikel
**Tujuan:** Wajah organisasi ke luar.

- Halaman profil organisasi (visi misi, sejarah) — dikelola lewat tabel `konten_statis`
- Artikel: draft anggota → review admin → publish (dengan kategori & slug)
- Peta rute/ekspedisi (galeri publik)
- Halaman sponsorship/donasi

**Selesai kalau:** guest yang buka website bisa dapat gambaran lengkap organisasi tanpa perlu login.

---

## Sprint 11 — Polish, QA & Deploy
**Tujuan:** Siap dipakai beneran.

- Uji seluruh RLS policy dengan skenario role berbeda (guest/anggota/admin/panitia/danlat/klaim akun)
- **Testing mobile khusus** (NFR-3):
  - Post-test: pastikan soal & jawaban lancar di layar kecil
  - Presensi: pastikan form input cepat & responsif
  - Upload file (surat dokter, persetujuan ortu) dari kamera HP
- **Dashboard analytics/overview** (FR-4.11):
  - Statistik anggota per angkatan/status
  - Ringkasan keuangan (iuran, kas)
  - Overview kaderisasi aktif (berapa calon siswa/siswa/anggota muda)
- Perbaikan bug dari testing internal
- Setup domain, deploy production, backup awal database

**Selesai kalau:** website bisa dipakai untuk periode pendaftaran/kaderisasi berikutnya.

---

## Catatan
- Sprint 2-6 sengaja berurutan ketat karena mengikuti alur kaderisasi yang linear — tidak disarankan dikerjakan paralel/dilompat
- Sprint 7-10 relatif independen satu sama lain, urutannya bisa ditukar sesuai prioritas kamu (misal kalau keuangan lebih mendesak daripada event, majukan Sprint 8)
- Total estimasi: **12 minggu (~3 bulan)** untuk MVP solo development
