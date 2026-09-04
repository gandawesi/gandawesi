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

Untuk mendukung wewenang persetujuan yang terdesentralisasi namun aman, sistem memisahkan **Status Keanggotaan** (jalur kaderisasi) dengan **Role Fungsional** (hak akses sistem). Hak akses granular dikelola dalam tabel `user_roles` dengan 7 peran resmi:

| Role (`user_roles.role`) | Nama Peran | Deskripsi & Wewenang Utama | Titik Keputusan / Approval |
|---|---|---|---|
| `admin` | Super Admin | Akses penuh ke seluruh CMS, manajemen akun/role, konfigurasi tarif, dan penutupan buku kas | Seluruh modul sistem |
| `ketua_organisasi` | Ketua Organisasi | Pimpinan tertinggi organisasi, pengawasan umum & LPJ tahunan | Kepengurusan & evaluasi umum |
| `ketua_medan_operasi` | Ketua Medan Operasi | Penanggung jawab operasional diklat lapangan | Approval kelulusan Calon Siswa $\rightarrow$ Siswa |
| `danlat` | Komandan Latihan | Instruktur utama lapangan saat Medan Operasi | Pengisian evaluasi individu & kelompok lapangan |
| `ketua_dp` | Ketua Dewan Pengurus | Pimpinan badan eksekutif Dewan Pengurus | Approval kelulusan Siswa $\rightarrow$ Medan Operasi |
| `pengurus_dp` | Pengurus DP | Anggota aktif Dewan Pengurus | Evaluasi berkala PPNIA & approval akhir PPNIA $\rightarrow$ Anggota Biasa |
| `panitia` | Panitia Kaderisasi | Tim operasional pelaksana diklat | Input presensi kegiatan, catatan kesehatan, & checklist alat |

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
  ↓ lolos → Ketua Medan Operasi / DANLAT yang approve
Siswa (~3 bulan)
  ↓ lolos → Ketua Dewan Pengurus (DP) yang approve
Medan Operasi (~12 hari)
  ↓ lolos → dapat nama angkatan, jadi "Anggota Muda [Angkatan]"
PPNIA (~1 tahun)
  ↓ lolos → seluruh DP yang approve
Evaluasi Akhir → NIA keluar → Anggota Biasa
  ↓ lulus studi
Anggota Luar Biasa (alumni, permanen)
  ↓ sebagian terpilih
Dewan Penasehat
```

Status lain (tidak termasuk jalur linear di atas):
- **Anggota Kehormatan** — dosen, ketua himpunan, dll (diberikan langsung, bukan lewat alur kaderisasi)
- **Dewan Pengurus (DP)** — badan eksekutif aktif, dipilih dari Anggota Biasa
- **Danlat / Instruktur lapangan** — role terpisah dari DP, mendampingi Medan Operasi

### 3.1 Tahap Calon Siswa (~1 bulan)
| Aspek | Detail |
|---|---|
| Aktivitas | Formulir pendaftaran (dibuka 2 minggu), persetujuan orang tua, tes kesehatan awal |
| Tes kesehatan | Dua sumber data: catatan manual dari panitia + upload surat keterangan sehat dari dokter |
| Approval | Ketua Medan Operasi / DANLAT |
| Gugur | Bisa gugur, riwayat disimpan, boleh daftar lagi tahun berikutnya |

### 3.2 Tahap Siswa (~3 bulan)
| Aspek | Detail |
|---|---|
| Bina jasmani | 2x/minggu, kehadiran dicatat **per sesi** (detail) |
| Pengumpulan alat | Alat pribadi & kelompok — sebagian dibeli sendiri, sebagian pinjam dari organisasi lain, sebagian pinjam dari inventaris Gandawesi |
| Pematerian | Presensi kehadiran + post-test online (soal dibuat admin, dijawab lewat HP) |
| Tes kesehatan akhir | Pola sama seperti tes awal, untuk membandingkan ada peningkatan atau tidak |
| Kelulusan | Tidak ada bobot/skor otomatis — keputusan penuh panitia/admin |
| Approval | Ketua Dewan Pengurus (DP) |
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
| Setelah dapat status ini | Bisa dipilih jadi ketua organisasi/ketua Medan Operasi (hasil dicatat, tanpa voting online), bisa jadi pengurus, wajib LPJ |
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
| Yang memilih | Ketua Organisasi / Dewan Pengurus |
| Jumlah | Fleksibel, tidak dipatok |
| Masa jabatan | Mengikuti periode Dewan Pengurus yang menjabat |
| Sifat peran | Pasif — dihubungi saat dibutuhkan |
| Beda dengan instruktur diklat | Ya, dua peran terpisah meski sama-sama berasal dari Anggota Luar Biasa |
| Pencatatan | Field sederhana: anggota, periode mulai, periode selesai |

> **Catatan istilah penting:** "DP" pada seluruh alur approval kaderisasi (Siswa, PPNIA) merujuk ke **Dewan Pengurus**, bukan Dewan Penasehat. Dua entitas ini harus dibedakan jelas di sistem (tabel/role terpisah).

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

### 4.3 Artikel/Berita
- Kategori: berita organisasi, laporan ekspedisi, tips
- Draft anggota → review admin → publish

### 4.4 Direktori Anggota
- Cari anggota by angkatan/status keanggotaan
- Profil anggota: NIA, angkatan, kontak

### 4.5 Inventaris Alat
- Daftar alat milik Gandawesi
- Pengajuan peminjaman → approval oleh admin
- Status: dipinjam/dikembalikan

### 4.6 KTA Digital & Sertifikat
- Hanya untuk anggota yang sudah punya NIA (Anggota Biasa ke atas)
- Sertifikat terkait pencapaian (kaderisasi, ekspedisi, dll)

### 4.7 Struktur Organisasi & Jabatan
- Riwayat jabatan penuh (anggota, jabatan, periode mulai-selesai)
- Halaman publik "Struktur Organisasi" per periode (opsional, tidak mandatory)
- Termasuk: Ketua Organisasi, Ketua Medan Operasi, Pengurus lain, Dewan Penasehat

### 4.8 Keuangan
- **Iuran wajib**: nominal per status keanggotaan (Anggota Muda/Biasa/Luar Biasa), nominal bisa berubah tergantung kebijakan pengurus yang menjabat
  - Anggota Muda mulai wajib iuran sejak status ini
  - Perubahan status di tengah bulan → iuran bulan itu tetap pakai tarif lama, tarif baru berlaku bulan berikutnya
  - Tunggakan = catatan administratif saja, tanpa sanksi otomatis
- **RAB per event**: rencana anggaran + realisasi
- **Buku kas umum**: pemasukan (iuran, sponsorship, donasi, subsidi kampus, usaha mandiri) & pengeluaran, dengan bukti transaksi
- **Laporan keuangan periodik**: transparansi ke anggota
- **LPJ**: kepengurusan tahunan & per kegiatan/ekspedisi

### 4.9 Peta Rute/Ekspedisi
- Dokumentasi rute pendakian/ekspedisi yang pernah dilakukan (galeri pencapaian ke publik)

### 4.10 Sponsorship/Donasi
- Halaman informasi cara berkontribusi (individu, brand, alumni)

### 4.11 Dashboard Admin
- Kelola seluruh modul di atas
- Statistik anggota per angkatan/status
- Approval di titik-titik keputusan (khusus role terkait: Ketua Medan Operasi/DANLAT, Ketua DP, seluruh DP)

---

## 5. Pertanyaan Terbuka / Perlu Keputusan Pengurus

Hal-hal berikut belum diatur jelas di AD/ART organisasi atau sengaja diserahkan ke kebijakan pengurus saat itu — sistem sebaiknya dirancang fleksibel untuk mengakomodasi, bukan mengunci aturan kaku:

1. Kasus "sudah lulus kuliah tapi belum lulus PPNIA" — belum ada ketentuan resmi
2. Kriteria/bobot penilaian evaluasi akhir PPNIA — ditentukan DP tiap periode, bukan tetap
3. Nominal iuran per status — bisa berubah sesuai kebijakan pengurus yang menjabat
4. Mekanisme pencabutan status Anggota Biasa — ada aturannya tapi belum pernah dipraktikkan

---

*Dokumen ini dibuat berdasarkan diskusi eksplorasi fitur — siap dijadikan acuan desain database (ERD) dan pengembangan sistem.*
