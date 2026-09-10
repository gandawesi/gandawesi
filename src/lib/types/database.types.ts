export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StatusKeanggotaan =
  | 'calon_siswa'
  | 'siswa'
  | 'medan_operasi'
  | 'anggota_muda'
  | 'anggota_biasa'
  | 'anggota_luar_biasa'
  | 'anggota_kehormatan'
  | 'dicabut';

export type FunctionalRole =
  | 'admin'
  | 'ketua_organisasi'
  | 'ketua_medan_operasi'
  | 'danlat'
  | 'ketua_dp'
  | 'pengurus_dp'
  | 'panitia';

export interface Database {
  public: {
    Tables: {
      angkatan: {
        Row: {
          id: string;
          nomor_angkatan: number;
          nama_angkatan: string | null;
          tahun: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nomor_angkatan: number;
          nama_angkatan?: string | null;
          tahun?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nomor_angkatan?: number;
          nama_angkatan?: string | null;
          tahun?: number | null;
          created_at?: string;
        };
      };
      periode_pendaftaran: {
        Row: {
          id: string;
          angkatan_id: string;
          tanggal_buka: string;
          tanggal_tutup: string;
          status: 'buka' | 'tutup';
          catatan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          angkatan_id: string;
          tanggal_buka: string;
          tanggal_tutup: string;
          status?: 'buka' | 'tutup';
          catatan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          angkatan_id?: string;
          tanggal_buka?: string;
          tanggal_tutup?: string;
          status?: 'buka' | 'tutup';
          catatan?: string | null;
          created_at?: string;
        };
      };
      anggota: {
        Row: {
          id: string;
          auth_user_id: string | null;
          nama: string;
          email: string | null;
          angkatan_id: string | null;
          periode_pendaftaran_id: string | null;
          status_keanggotaan: StatusKeanggotaan;
          nia: string | null;
          is_admin: boolean;
          tempat_lahir: string | null;
          tanggal_lahir: string | null;
          jenis_kelamin: 'L' | 'P' | null;
          no_hp: string | null;
          alamat: string | null;
          nim: string | null;
          jurusan: string | null;
          foto_profil: string | null;
          file_persetujuan_ortu: string | null;
          tanggal_berubah_status: string | null;
          catatan_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          nama: string;
          email?: string | null;
          angkatan_id?: string | null;
          periode_pendaftaran_id?: string | null;
          status_keanggotaan?: StatusKeanggotaan;
          nia?: string | null;
          is_admin?: boolean;
          tempat_lahir?: string | null;
          tanggal_lahir?: string | null;
          jenis_kelamin?: 'L' | 'P' | null;
          no_hp?: string | null;
          alamat?: string | null;
          nim?: string | null;
          jurusan?: string | null;
          foto_profil?: string | null;
          file_persetujuan_ortu?: string | null;
          tanggal_berubah_status?: string | null;
          catatan_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          nama?: string;
          email?: string | null;
          angkatan_id?: string | null;
          periode_pendaftaran_id?: string | null;
          status_keanggotaan?: StatusKeanggotaan;
          nia?: string | null;
          is_admin?: boolean;
          tempat_lahir?: string | null;
          tanggal_lahir?: string | null;
          jenis_kelamin?: 'L' | 'P' | null;
          no_hp?: string | null;
          alamat?: string | null;
          nim?: string | null;
          jurusan?: string | null;
          foto_profil?: string | null;
          file_persetujuan_ortu?: string | null;
          tanggal_berubah_status?: string | null;
          catatan_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      riwayat_tahap: {
        Row: {
          id: string;
          anggota_id: string;
          tahap: 'calon_siswa' | 'siswa' | 'medan_operasi';
          status: 'dalam_proses' | 'lolos' | 'gugur';
          approved_by: string | null;
          tanggal: string;
          catatan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          tahap: 'calon_siswa' | 'siswa' | 'medan_operasi';
          status: 'dalam_proses' | 'lolos' | 'gugur';
          approved_by?: string | null;
          tanggal?: string;
          catatan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          tahap?: 'calon_siswa' | 'siswa' | 'medan_operasi';
          status?: 'dalam_proses' | 'lolos' | 'gugur';
          approved_by?: string | null;
          tanggal?: string;
          catatan?: string | null;
          created_at?: string;
        };
      };
      tes_kesehatan: {
        Row: {
          id: string;
          anggota_id: string;
          jenis: 'awal' | 'akhir';
          catatan_panitia: string | null;
          file_surat_dokter: string | null;
          tanggal: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          jenis: 'awal' | 'akhir';
          catatan_panitia?: string | null;
          file_surat_dokter?: string | null;
          tanggal?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          jenis?: 'awal' | 'akhir';
          catatan_panitia?: string | null;
          file_surat_dokter?: string | null;
          tanggal?: string;
          created_at?: string;
        };
      };
      klaim_akun: {
        Row: {
          id: string;
          auth_user_id: string;
          anggota_id: string;
          status: 'menunggu' | 'disetujui' | 'ditolak';
          catatan_admin: string | null;
          diproses_oleh: string | null;
          diproses_pada: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          anggota_id: string;
          status?: 'menunggu' | 'disetujui' | 'ditolak';
          catatan_admin?: string | null;
          diproses_oleh?: string | null;
          diproses_pada?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          anggota_id?: string;
          status?: 'menunggu' | 'disetujui' | 'ditolak';
          catatan_admin?: string | null;
          diproses_oleh?: string | null;
          diproses_pada?: string | null;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          anggota_id: string;
          role: FunctionalRole;
          periode_mulai: string | null;
          periode_selesai: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          role: FunctionalRole;
          periode_mulai?: string | null;
          periode_selesai?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          role?: FunctionalRole;
          periode_mulai?: string | null;
          periode_selesai?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      wawancara_calon_siswa: {
        Row: {
          id: string;
          anggota_id: string;
          pewawancara_id: string | null;
          nilai: number | null;
          rekomendasi: 'sangat_direkomendasikan' | 'direkomendasikan' | 'dipertimbangkan' | 'tidak_direkomendasikan' | null;
          catatan: string | null;
          tanggal: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          pewawancara_id?: string | null;
          nilai?: number | null;
          rekomendasi?: 'sangat_direkomendasikan' | 'direkomendasikan' | 'dipertimbangkan' | 'tidak_direkomendasikan' | null;
          catatan?: string | null;
          tanggal?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          pewawancara_id?: string | null;
          nilai?: number | null;
          rekomendasi?: 'sangat_direkomendasikan' | 'direkomendasikan' | 'dipertimbangkan' | 'tidak_direkomendasikan' | null;
          catatan?: string | null;
          tanggal?: string;
          created_at?: string;
        };
      };
      materi_kaderisasi: {
        Row: {
          id: string;
          tahap: 'calon_siswa' | 'siswa' | 'ppnia';
          judul: string;
          deskripsi: string | null;
          file_materi: string | null;
          urutan: number | null;
        };
        Insert: {
          id?: string;
          tahap: 'calon_siswa' | 'siswa' | 'ppnia';
          judul: string;
          deskripsi?: string | null;
          file_materi?: string | null;
          urutan?: number | null;
        };
        Update: {
          id?: string;
          tahap?: 'calon_siswa' | 'siswa' | 'ppnia';
          judul?: string;
          deskripsi?: string | null;
          file_materi?: string | null;
          urutan?: number | null;
        };
      };
      sesi_kegiatan: {
        Row: {
          id: string;
          angkatan_id: string;
          tahap: 'calon_siswa' | 'siswa' | 'ppnia';
          jenis_kegiatan: 'bina_jasmani' | 'pematerian' | 'presentasi' | 'pendakian' | 'ekspedisi';
          nama_sesi: string;
          tanggal: string;
          materi_id: string | null;
          instruktur_id: string | null;
          catatan: string | null;
        };
        Insert: {
          id?: string;
          angkatan_id: string;
          tahap: 'calon_siswa' | 'siswa' | 'ppnia';
          jenis_kegiatan: 'bina_jasmani' | 'pematerian' | 'presentasi' | 'pendakian' | 'ekspedisi';
          nama_sesi: string;
          tanggal: string;
          materi_id?: string | null;
          instruktur_id?: string | null;
          catatan?: string | null;
        };
        Update: {
          id?: string;
          angkatan_id?: string;
          tahap?: 'calon_siswa' | 'siswa' | 'ppnia';
          jenis_kegiatan?: 'bina_jasmani' | 'pematerian' | 'presentasi' | 'pendakian' | 'ekspedisi';
          nama_sesi?: string;
          tanggal?: string;
          materi_id?: string | null;
          instruktur_id?: string | null;
          catatan?: string | null;
        };
      };
      presensi_kaderisasi: {
        Row: {
          id: string;
          sesi_kegiatan_id: string;
          anggota_id: string;
          status_kehadiran: 'hadir' | 'izin' | 'alpa';
          keterangan: string | null;
        };
        Insert: {
          id?: string;
          sesi_kegiatan_id: string;
          anggota_id: string;
          status_kehadiran?: 'hadir' | 'izin' | 'alpa';
          keterangan?: string | null;
        };
        Update: {
          id?: string;
          sesi_kegiatan_id?: string;
          anggota_id?: string;
          status_kehadiran?: 'hadir' | 'izin' | 'alpa';
          keterangan?: string | null;
        };
      };
      alat_siswa: {
        Row: {
          id: string;
          anggota_id: string;
          nama_alat: string;
          kategori: string | null;
          ada: boolean;
          kondisi: string | null;
          catatan: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          nama_alat: string;
          kategori?: string | null;
          ada?: boolean;
          kondisi?: string | null;
          catatan?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          nama_alat?: string;
          kategori?: string | null;
          ada?: boolean;
          kondisi?: string | null;
          catatan?: string | null;
          updated_at?: string;
        };
      };
      jabatan_organisasi: {
        Row: {
          id: string;
          anggota_id: string;
          jabatan: string;
          periode_mulai: string;
          periode_selesai: string | null;
          is_active: boolean;
          catatan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          jabatan: string;
          periode_mulai: string;
          periode_selesai?: string | null;
          is_active?: boolean;
          catatan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          jabatan?: string;
          periode_mulai?: string;
          periode_selesai?: string | null;
          is_active?: boolean;
          catatan?: string | null;
          created_at?: string;
        };
      };
      dewan_penasehat: {
        Row: {
          id: string;
          anggota_id: string;
          periode_mulai: string;
          periode_selesai: string | null;
          is_active: boolean;
          catatan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          periode_mulai: string;
          periode_selesai?: string | null;
          is_active?: boolean;
          catatan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          periode_mulai?: string;
          periode_selesai?: string | null;
          is_active?: boolean;
          catatan?: string | null;
          created_at?: string;
        };
      };
      tarif_iuran: {
        Row: {
          id: string;
          status_keanggotaan: 'anggota_muda' | 'anggota_biasa' | 'anggota_luar_biasa';
          nominal: number;
          berlaku_mulai: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          status_keanggotaan: 'anggota_muda' | 'anggota_biasa' | 'anggota_luar_biasa';
          nominal: number;
          berlaku_mulai: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          status_keanggotaan?: 'anggota_muda' | 'anggota_biasa' | 'anggota_luar_biasa';
          nominal?: number;
          berlaku_mulai?: string;
          created_at?: string;
        };
      };
      iuran: {
        Row: {
          id: string;
          anggota_id: string;
          periode: string;
          nominal: number;
          status_bayar: 'belum' | 'menunggu_konfirmasi' | 'lunas';
          tanggal_bayar: string | null;
          bukti_transfer: string | null;
          verified_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          periode: string;
          nominal: number;
          status_bayar?: 'belum' | 'menunggu_konfirmasi' | 'lunas';
          tanggal_bayar?: string | null;
          bukti_transfer?: string | null;
          verified_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          periode?: string;
          nominal?: number;
          status_bayar?: 'belum' | 'menunggu_konfirmasi' | 'lunas';
          tanggal_bayar?: string | null;
          bukti_transfer?: string | null;
          verified_by?: string | null;
          created_at?: string;
        };
      };
      transaksi_kas: {
        Row: {
          id: string;
          tipe: 'masuk' | 'keluar';
          kategori: 'iuran' | 'sponsorship' | 'donasi' | 'subsidi_kampus' | 'usaha_mandiri' | 'operasional' | 'logistik' | 'kegiatan' | 'lainnya';
          nominal: number;
          tanggal: string;
          deskripsi: string;
          bukti_transaksi: string | null;
          event_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tipe: 'masuk' | 'keluar';
          kategori: 'iuran' | 'sponsorship' | 'donasi' | 'subsidi_kampus' | 'usaha_mandiri' | 'operasional' | 'logistik' | 'kegiatan' | 'lainnya';
          nominal: number;
          tanggal?: string;
          deskripsi: string;
          bukti_transaksi?: string | null;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tipe?: 'masuk' | 'keluar';
          kategori?: 'iuran' | 'sponsorship' | 'donasi' | 'subsidi_kampus' | 'usaha_mandiri' | 'operasional' | 'logistik' | 'kegiatan' | 'lainnya';
          nominal?: number;
          tanggal?: string;
          deskripsi?: string;
          bukti_transaksi?: string | null;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      event: {
        Row: {
          id: string;
          nama: string;
          deskripsi: string | null;
          tanggal_mulai: string;
          tanggal_selesai: string | null;
          lokasi: string | null;
          kuota: number | null;
          is_public: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          deskripsi?: string | null;
          tanggal_mulai: string;
          tanggal_selesai?: string | null;
          lokasi?: string | null;
          kuota?: number | null;
          is_public?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          deskripsi?: string | null;
          tanggal_mulai?: string;
          tanggal_selesai?: string | null;
          lokasi?: string | null;
          kuota?: number | null;
          is_public?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      artikel: {
        Row: {
          id: string;
          penulis_id: string | null;
          judul: string;
          slug: string | null;
          konten: string;
          kategori: 'berita' | 'laporan_ekspedisi' | 'tips';
          thumbnail: string | null;
          status: 'draft' | 'review' | 'published';
          tanggal_publish: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          penulis_id?: string | null;
          judul: string;
          slug?: string | null;
          konten: string;
          kategori: 'berita' | 'laporan_ekspedisi' | 'tips';
          thumbnail?: string | null;
          status?: 'draft' | 'review' | 'published';
          tanggal_publish?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          penulis_id?: string | null;
          judul?: string;
          slug?: string | null;
          konten?: string;
          kategori?: 'berita' | 'laporan_ekspedisi' | 'tips';
          thumbnail?: string | null;
          status?: 'draft' | 'review' | 'published';
          tanggal_publish?: string | null;
          created_at?: string;
        };
      };
      artikel_komentar: {
        Row: {
          id: string;
          artikel_id: string;
          nama: string;
          email: string | null;
          isi: string;
          status_keanggotaan: string | null;
          nia: string | null;
          is_verified_member: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          artikel_id: string;
          nama: string;
          email?: string | null;
          isi: string;
          status_keanggotaan?: string | null;
          nia?: string | null;
          is_verified_member?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          artikel_id?: string;
          nama?: string;
          email?: string | null;
          isi?: string;
          status_keanggotaan?: string | null;
          nia?: string | null;
          is_verified_member?: boolean;
          created_at?: string;
        };
      };
      alat: {
        Row: {
          id: string;
          nama_alat: string;
          kategori: string | null;
          kondisi: 'baik' | 'rusak_ringan' | 'rusak_berat';
          stok: number;
        };
        Insert: {
          id?: string;
          nama_alat: string;
          kategori?: string | null;
          kondisi?: 'baik' | 'rusak_ringan' | 'rusak_berat';
          stok?: number;
        };
        Update: {
          id?: string;
          nama_alat?: string;
          kategori?: string | null;
          kondisi?: 'baik' | 'rusak_ringan' | 'rusak_berat';
          stok?: number;
        };
      };
      peminjaman_alat: {
        Row: {
          id: string;
          anggota_id: string;
          alat_id: string;
          jumlah: number;
          tanggal_pinjam: string;
          tanggal_kembali: string | null;
          status: 'diajukan' | 'disetujui' | 'dipinjam' | 'dikembalikan' | 'ditolak';
          keperluan: string | null;
          approved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          alat_id: string;
          jumlah?: number;
          tanggal_pinjam?: string;
          tanggal_kembali?: string | null;
          status?: 'diajukan' | 'disetujui' | 'dipinjam' | 'dikembalikan' | 'ditolak';
          keperluan?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          alat_id?: string;
          jumlah?: number;
          tanggal_pinjam?: string;
          tanggal_kembali?: string | null;
          status?: 'diajukan' | 'disetujui' | 'dipinjam' | 'dikembalikan' | 'ditolak';
          keperluan?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
      };
      kta: {
        Row: {
          id: string;
          anggota_id: string;
          nia: string;
          tanggal_terbit: string;
          file: string | null;
        };
        Insert: {
          id?: string;
          anggota_id: string;
          nia: string;
          tanggal_terbit?: string;
          file?: string | null;
        };
        Update: {
          id?: string;
          anggota_id?: string;
          nia?: string;
          tanggal_terbit?: string;
          file?: string | null;
        };
      };
      sertifikat: {
        Row: {
          id: string;
          anggota_id: string | null;
          judul: string | null;
          nomor_sertifikat: string | null;
          jenis: string;
          tanggal_terbit: string;
          deskripsi: string | null;
          file: string | null;
          asal: 'internal' | 'eksternal';
          penerima_tipe: 'anggota' | 'organisasi';
          lembaga_penerbit: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          anggota_id?: string | null;
          judul?: string | null;
          nomor_sertifikat?: string | null;
          jenis: string;
          tanggal_terbit?: string;
          deskripsi?: string | null;
          file?: string | null;
          asal?: 'internal' | 'eksternal';
          penerima_tipe?: 'anggota' | 'organisasi';
          lembaga_penerbit?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          anggota_id?: string | null;
          judul?: string | null;
          nomor_sertifikat?: string | null;
          jenis?: string;
          tanggal_terbit?: string;
          deskripsi?: string | null;
          file?: string | null;
          asal?: 'internal' | 'eksternal';
          penerima_tipe?: 'anggota' | 'organisasi';
          lembaga_penerbit?: string | null;
          created_at?: string;
        };
      };
      konten_statis: {
        Row: {
          id: string;
          slug: string;
          judul: string;
          konten: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          judul: string;
          konten?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          judul?: string;
          konten?: string | null;
          updated_at?: string;
        };
      };
      rute_ekspedisi: {
        Row: {
          id: string;
          nama: string;
          lokasi: string | null;
          tanggal: string | null;
          deskripsi: string | null;
          peserta: string | null;
          foto: string[] | null;
          koordinat_lat: number | null;
          koordinat_lng: number | null;
          elevasi_mdpl: number | null;
          tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit' | 'ekstrem' | null;
          waypoints: Json | null;
        };
        Insert: {
          id?: string;
          nama: string;
          lokasi?: string | null;
          tanggal?: string | null;
          deskripsi?: string | null;
          peserta?: string | null;
          foto?: string[] | null;
          koordinat_lat?: number | null;
          koordinat_lng?: number | null;
          elevasi_mdpl?: number | null;
          tingkat_kesulitan?: 'mudah' | 'sedang' | 'sulit' | 'ekstrem' | null;
          waypoints?: Json | null;
        };
        Update: {
          id?: string;
          nama?: string;
          lokasi?: string | null;
          tanggal?: string | null;
          deskripsi?: string | null;
          peserta?: string | null;
          foto?: string[] | null;
          koordinat_lat?: number | null;
          koordinat_lng?: number | null;
          elevasi_mdpl?: number | null;
          tingkat_kesulitan?: 'mudah' | 'sedang' | 'sulit' | 'ekstrem' | null;
          waypoints?: Json | null;
        };
      };
      sponsorship: {
        Row: {
          id: string;
          nama_sponsor: string;
          jenis: 'sponsorship' | 'donasi';
          nominal: number;
          event_id: string | null;
          tanggal: string;
        };
        Insert: {
          id?: string;
          nama_sponsor: string;
          jenis?: 'sponsorship' | 'donasi';
          nominal?: number;
          event_id?: string | null;
          tanggal?: string;
        };
        Update: {
          id?: string;
          nama_sponsor?: string;
          jenis?: 'sponsorship' | 'donasi';
          nominal?: number;
          event_id?: string | null;
          tanggal?: string;
        };
      };
    };
    Views: {
      v_anggota_direktori: {
        Row: {
          id: string;
          nama: string;
          nia: string | null;
          status_keanggotaan: StatusKeanggotaan;
          nomor_angkatan: number | null;
          nama_angkatan: string | null;
          foto_profil: string | null;
          jurusan: string | null;
        };
      };
    };
    Functions: {
      submit_post_test: {
        Args: {
          p_materi_id: string;
          p_jawaban: Json;
        };
        Returns: {
          score: number;
          total_soal: number;
          lulus: boolean;
        };
      };
      update_profil_anggota: {
        Args: {
          p_nama?: string | null;
          p_tempat_lahir?: string | null;
          p_tanggal_lahir?: string | null;
          p_jenis_kelamin?: string | null;
          p_no_hp?: string | null;
          p_alamat?: string | null;
          p_nim?: string | null;
          p_jurusan?: string | null;
          p_foto_profil?: string | null;
        };
        Returns: void;
      };
    };
  };
}

// Convenience helper aliases
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
