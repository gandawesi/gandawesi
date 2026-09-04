-- ============================================================
-- Skema Database Gandawesi — PostgreSQL / Supabase
-- Berdasarkan ERD: keanggotaan, kaderisasi, evaluasi, governance,
-- keuangan, event, inventaris, achievement, konten publik
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. KEANGGOTAAN INTI
-- ============================================================

create table angkatan (
    id uuid primary key default gen_random_uuid(),
    nomor_angkatan integer not null unique,
    nama_angkatan text,
    tahun integer,
    created_at timestamptz not null default now()
);

-- Periode pendaftaran: mengatur kapan pendaftaran calon siswa dibuka/ditutup
-- per angkatan. Satu angkatan bisa punya satu periode pendaftaran aktif.
create table periode_pendaftaran (
    id uuid primary key default gen_random_uuid(),
    angkatan_id uuid not null references angkatan(id),
    tanggal_buka date not null,
    tanggal_tutup date not null,
    status text not null default 'buka' check (status in ('buka', 'tutup')),
    catatan text, -- mis. "Pendaftaran Angkatan 31 Tahun 2025"
    created_at timestamptz not null default now()
);

create table anggota (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique references auth.users(id), -- link ke Supabase Auth (1 user 1 akun anggota)
    nama text not null,
    email text unique,
    angkatan_id uuid references angkatan(id),
    periode_pendaftaran_id uuid references periode_pendaftaran(id), -- periode saat mendaftar (calon siswa)
    status_keanggotaan text not null default 'calon_siswa'
        check (status_keanggotaan in (
            'calon_siswa', 'siswa', 'medan_operasi',
            'anggota_muda', 'anggota_biasa', 'anggota_luar_biasa',
            'anggota_kehormatan', 'dicabut'
        )),
    nia text unique, -- diisi manual, format bebas mis. GW.30.232.AB
    is_admin boolean not null default false, -- fallback flag untuk bootstrap admin pertama
    -- biodata lengkap
    tempat_lahir text,
    tanggal_lahir date,
    jenis_kelamin text check (jenis_kelamin in ('L', 'P')),
    no_hp text,
    alamat text,
    nim text,
    jurusan text,
    foto_profil text, -- path/url ke Supabase Storage
    file_persetujuan_ortu text, -- path/url upload surat persetujuan orang tua
    -- metadata status
    tanggal_berubah_status date,
    catatan_status text, -- dipakai untuk kasus pencabutan/pengeluaran
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Trigger: auto-update updated_at setiap kali row anggota diubah
create or replace function update_anggota_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_anggota_updated_at
    before update on anggota
    for each row
    execute function update_anggota_updated_at();

-- Trigger: otomatis promosi status ke 'anggota_biasa' jika NIA diinput untuk 'anggota_muda'
create or replace function handle_anggota_nia_promosi()
returns trigger
language plpgsql
as $$
begin
    if new.nia is not null and trim(new.nia) <> '' and (old.nia is null or trim(old.nia) = '') then
        if new.status_keanggotaan = 'anggota_muda' then
            new.status_keanggotaan = 'anggota_biasa';
            new.tanggal_berubah_status = coalesce(new.tanggal_berubah_status, current_date);
        end if;
    end if;
    return new;
end;
$$;

create trigger trg_anggota_nia_promosi
    before update on anggota
    for each row
    execute function handle_anggota_nia_promosi();

create table riwayat_tahap (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    tahap text not null check (tahap in ('calon_siswa', 'siswa', 'medan_operasi')),
    status text not null check (status in ('dalam_proses', 'lolos', 'gugur')),
    approved_by uuid references anggota(id), -- siapa yang approve (FK, bukan text)
    tanggal date not null default current_date,
    catatan text,
    created_at timestamptz not null default now()
);

-- Trigger: sinkronisasi otomatis status_keanggotaan saat riwayat_tahap dinyatakan 'lolos'
create or replace function sync_status_kaderisasi()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.status = 'lolos' and (old is null or old.status <> 'lolos') then
        if new.tahap = 'calon_siswa' then
            update anggota
            set status_keanggotaan = 'siswa',
                tanggal_berubah_status = new.tanggal
            where id = new.anggota_id;
        elsif new.tahap = 'siswa' then
            update anggota
            set status_keanggotaan = 'medan_operasi',
                tanggal_berubah_status = new.tanggal
            where id = new.anggota_id;
        elsif new.tahap = 'medan_operasi' then
            update anggota
            set status_keanggotaan = 'anggota_muda',
                tanggal_berubah_status = new.tanggal
            where id = new.anggota_id;
        end if;
    end if;
    return new;
end;
$$;

create trigger trg_sync_status_kaderisasi
    after insert or update on riwayat_tahap
    for each row
    execute function sync_status_kaderisasi();

create table tes_kesehatan (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    jenis text not null check (jenis in ('awal', 'akhir')),
    catatan_panitia text,
    file_surat_dokter text, -- path/url ke storage
    tanggal date not null default current_date,
    created_at timestamptz not null default now()
);

-- klaim_akun: dipakai saat user login via Google (auth.users) pertama kali
-- dan ingin menghubungkan akunnya ke record `anggota` yang sudah ada
-- (migrasi data anggota lama yang auth_user_id-nya masih kosong).
create table klaim_akun (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid not null references auth.users(id),
    anggota_id uuid not null references anggota(id),
    status text not null default 'menunggu' check (status in ('menunggu', 'disetujui', 'ditolak')),
    catatan_admin text,
    diproses_oleh uuid references auth.users(id),
    diproses_pada timestamptz,
    created_at timestamptz not null default now(),
    unique (anggota_id) -- satu record anggota lama hanya bisa diklaim oleh satu akun
);

-- Trigger: begitu klaim disetujui, otomatis hubungkan auth_user_id ke anggota dan rekam admin pemroses
create or replace function proses_klaim_akun()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.status = 'disetujui' and old.status <> 'disetujui' then
        update anggota
        set auth_user_id = new.auth_user_id
        where id = new.anggota_id and auth_user_id is null;

        new.diproses_pada = now();
        new.diproses_oleh = coalesce(new.diproses_oleh, auth.uid());
    end if;
    return new;
end;
$$;

create trigger trg_proses_klaim_akun
    before update on klaim_akun
    for each row
    execute function proses_klaim_akun();

-- ============================================================
-- 1b. USER ROLES — Role granular untuk akses sistem
-- ============================================================
-- Menggantikan pola flag `is_admin` tunggal. Satu anggota bisa
-- punya beberapa role sekaligus (mis. pengurus_dp + panitia).
-- Role bersifat temporal: punya periode mulai/selesai, bisa dinonaktifkan.
-- Unique constraint per (anggota, role, periode_mulai) agar mendukung
-- role yang sama di periode berbeda.

create table user_roles (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete cascade,
    role text not null check (role in (
        'admin',                -- super admin, full akses
        'ketua_organisasi',     -- ketua umum organisasi
        'ketua_medan_operasi',  -- approve calon siswa → siswa
        'danlat',               -- instruktur lapangan Medan Operasi
        'ketua_dp',             -- Ketua Dewan Pengurus, approve siswa → medan operasi
        'pengurus_dp',          -- anggota Dewan Pengurus
        'panitia'               -- panitia kaderisasi (input presensi, evaluasi)
    )),
    periode_mulai date,
    periode_selesai date,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    unique (anggota_id, role, periode_mulai) -- boleh role sama di periode berbeda
);

-- ============================================================
-- 2. KADERISASI: PRESENSI, MATERI, ALAT
-- ============================================================

-- Materi HARUS didefinisikan sebelum sesi_kegiatan karena
-- sesi_kegiatan memiliki FK ke materi.
create table materi (
    id uuid primary key default gen_random_uuid(),
    judul text not null,
    angkatan_id uuid references angkatan(id), -- materi untuk angkatan mana
    tanggal date,
    created_at timestamptz not null default now()
);

-- Sesi kegiatan: memberikan konteks pada presensi.
-- Setiap sesi punya judul, jenis, tanggal, dan opsional link ke materi/angkatan.
create table sesi_kegiatan (
    id uuid primary key default gen_random_uuid(),
    jenis_kegiatan text not null check (jenis_kegiatan in (
        'bina_jasmani', 'pematerian', 'presentasi', 'pendakian', 'ekspedisi'
    )),
    judul text not null, -- mis. "Bina Jasmani Sesi 5", "Pematerian: Navigasi Darat"
    materi_id uuid references materi(id), -- opsional, hanya untuk jenis pematerian
    angkatan_id uuid references angkatan(id), -- sesi ini untuk angkatan mana
    tanggal date not null,
    catatan text,
    created_at timestamptz not null default now()
);

-- Presensi kaderisasi: terhubung ke sesi_kegiatan untuk konteks yang kaya.
create table presensi_kaderisasi (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete cascade,
    sesi_kegiatan_id uuid not null references sesi_kegiatan(id) on delete cascade,
    hadir boolean not null default false,
    catatan text, -- mis. "izin sakit", "terlambat 30 menit"
    created_at timestamptz not null default now(),
    unique (anggota_id, sesi_kegiatan_id) -- satu anggota satu presensi per sesi
);

create table soal_post_test (
    id uuid primary key default gen_random_uuid(),
    materi_id uuid not null references materi(id) on delete cascade,
    pertanyaan text not null,
    pilihan jsonb -- array pilihan jawaban mis. ["A. Kompas", "B. Peta", ...]
);

-- Kunci jawaban post-test dipisah di tabel tersendiri yang hanya bisa diakses admin
-- untuk mencegah kebocoran jawaban sebelum/saat ujian. Penilaian dilakukan via RPC submit_post_test.
create table kunci_jawaban_post_test (
    soal_id uuid primary key references soal_post_test(id) on delete cascade,
    jawaban_benar text not null
);

create table hasil_post_test (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    materi_id uuid not null references materi(id) on delete cascade,
    skor numeric(5,2),
    dikerjakan_pada timestamptz not null default now()
);

create table alat_siswa (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete cascade,
    nama_alat text not null,
    jenis text check (jenis in ('pribadi', 'kelompok')),
    sumber text check (sumber in ('beli', 'pinjam_luar', 'pinjam_gandawesi')),
    status text check (status in ('lengkap', 'belum')),
    tanggal_kembali date -- relevan kalau sumber pinjam
);

-- ============================================================
-- 3. EVALUASI (MEDAN OPERASI & PPNIA)
-- ============================================================

create table evaluasi_individu (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    evaluator_id uuid references anggota(id), -- siapa yang mengevaluasi (Danlat/DP/panitia)
    tahap text not null check (tahap in ('medan_operasi', 'ppnia')),
    skor numeric(5,2), -- nilai kuantitatif (opsional)
    catatan text,
    tanggal date not null default current_date,
    created_at timestamptz not null default now()
);

-- Evaluasi kelompok: per angkatan (semua peserta Medan Operasi = satu kelompok).
-- Tidak perlu pivot table sub-kelompok — cukup per angkatan.
create table evaluasi_kelompok (
    id uuid primary key default gen_random_uuid(),
    angkatan_id uuid not null references angkatan(id) on delete cascade,
    evaluator_id uuid references anggota(id), -- siapa yang mengevaluasi
    tahap text not null check (tahap in ('medan_operasi', 'ppnia')),
    catatan text,
    tanggal date not null default current_date,
    created_at timestamptz not null default now()
);

create table evaluasi_berkala (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    periode text not null, -- mis. "2024-Q2"
    status text check (status in ('aman', 'perlu_perhatian', 'kritis')),
    catatan text,
    created_at timestamptz not null default now()
);

create table presentasi (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete cascade,
    jenis text not null check (jenis in ('pra_ekspedisi', 'pasca_ekspedisi')),
    tanggal date,
    file text, -- path/url slide
    catatan text
);

create table rencana_ekspedisi (
    id uuid primary key default gen_random_uuid(),
    pengaju_id uuid not null references anggota(id) on delete cascade, -- penanggung jawab utama
    deskripsi text,
    lokasi text,
    tanggal date,
    status_approval text check (status_approval in ('diajukan', 'disetujui', 'ditolak')) default 'diajukan'
);

-- Tabel pivot: peserta rencana ekspedisi (many-to-many)
-- Ekspedisi akhir PPNIA dirancang bersama oleh beberapa Anggota Muda
create table peserta_ekspedisi (
    id uuid primary key default gen_random_uuid(),
    rencana_ekspedisi_id uuid not null references rencana_ekspedisi(id) on delete cascade,
    anggota_id uuid not null references anggota(id) on delete cascade,
    unique (rencana_ekspedisi_id, anggota_id)
);

create table kriteria_evaluasi (
    id uuid primary key default gen_random_uuid(),
    nama_kriteria text not null,
    periode text, -- kriteria bisa beda tiap periode, ditentukan DP
    created_at timestamptz not null default now()
);

create table nilai_evaluasi (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete cascade,
    kriteria_id uuid not null references kriteria_evaluasi(id) on delete cascade,
    skor numeric,
    catatan text
);

-- ============================================================
-- 4. GOVERNANCE & JABATAN
-- ============================================================

create table jabatan_organisasi (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    jabatan text not null, -- mis. "Ketua Organisasi", "Ketua Medan Operasi", "Pengurus"
    periode_mulai date not null,
    periode_selesai date,
    catatan text, -- bisa dipakai untuk catatan hasil pemilihan (jumlah suara, dll)
    created_at timestamptz not null default now()
);

create table dewan_penasehat (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    periode_mulai date not null,
    periode_selesai date
);

create table lpj (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict, -- penanggung jawab
    jenis text not null check (jenis in ('kepengurusan', 'kegiatan')),
    terkait_id uuid, -- FK longgar ke event.id atau jabatan_organisasi.id tergantung jenis
    file text,
    tanggal date not null default current_date
);

-- ============================================================
-- 5. KEUANGAN
-- ============================================================

create table tarif_iuran (
    id uuid primary key default gen_random_uuid(),
    status_keanggotaan text not null,
    nominal numeric(15,2) not null check (nominal >= 0),
    berlaku_sejak date not null,
    unique (status_keanggotaan, berlaku_sejak)
);

create table iuran (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    periode text not null, -- mis. "2024-06"
    nominal numeric(15,2) not null check (nominal >= 0), -- disalin dari tarif_iuran yang berlaku saat periode itu
    status_bayar text not null default 'menunggak' check (status_bayar in ('lunas', 'menunggak')),
    tanggal_bayar date,
    unique (anggota_id, periode)
);

create table event (
    id uuid primary key default gen_random_uuid(),
    nama text not null,
    jenis text,
    lokasi text,
    tanggal date, -- tanggal mulai
    tanggal_selesai date, -- untuk event multi-hari
    kuota integer check (kuota is null or kuota > 0),
    deskripsi text,
    is_public boolean not null default false, -- apakah tampil ke guest
    status text not null default 'upcoming'
        check (status in ('upcoming', 'ongoing', 'selesai', 'batal')),
    created_at timestamptz not null default now()
);

create table transaksi_kas (
    id uuid primary key default gen_random_uuid(),
    tipe text not null check (tipe in ('masuk', 'keluar')),
    kategori text not null, -- iuran/sponsorship/donasi/subsidi_kampus/usaha_mandiri/operasional/dll
    nominal numeric(15,2) not null check (nominal > 0),
    event_id uuid references event(id), -- nullable, kalau masuk kas umum
    bukti text, -- path/url struk/nota
    keterangan text,
    tanggal date not null default current_date
);

create table event_anggaran (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references event(id) on delete cascade,
    rab numeric(15,2) check (rab is null or rab >= 0),
    realisasi numeric(15,2) check (realisasi is null or realisasi >= 0),
    status text check (status in ('draft', 'disetujui')) default 'draft'
);

create table sponsorship (
    id uuid primary key default gen_random_uuid(),
    nama_sponsor text not null,
    jenis text check (jenis in ('sponsorship', 'donasi')),
    nominal numeric(15,2) check (nominal is null or nominal >= 0),
    event_id uuid references event(id), -- nullable kalau donasi umum
    tanggal date not null default current_date
);

-- Trigger: otomatis catat penerimaan kas saat sponsorship dicatat
create or replace function sync_sponsorship_ke_kas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.nominal is not null and new.nominal > 0 then
        insert into transaksi_kas (tipe, kategori, nominal, event_id, keterangan, tanggal)
        values (
            'masuk',
            coalesce(new.jenis, 'sponsorship'),
            new.nominal,
            new.event_id,
            'Penerimaan ' || coalesce(new.jenis, 'sponsorship') || ': ' || new.nama_sponsor,
            new.tanggal
        );
    end if;
    return new;
end;
$$;

create trigger trg_sponsorship_ke_kas
    after insert on sponsorship
    for each row
    execute function sync_sponsorship_ke_kas();

-- ============================================================
-- 6. EVENT & ARTIKEL
-- ============================================================

create table pendaftaran_event (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete cascade,
    event_id uuid not null references event(id) on delete cascade,
    status text check (status in ('terdaftar', 'batal')) default 'terdaftar',
    created_at timestamptz not null default now(),
    unique (anggota_id, event_id)
);

-- Trigger: validasi batas kuota pendaftaran event
create or replace function check_kuota_event()
returns trigger
language plpgsql
as $$
declare
    v_kuota integer;
    v_terdaftar integer;
begin
    if new.status = 'terdaftar' then
        select kuota into v_kuota from event where id = new.event_id;
        if v_kuota is not null then
            select count(*) into v_terdaftar
            from pendaftaran_event
            where event_id = new.event_id
              and status = 'terdaftar'
              and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

            if v_terdaftar >= v_kuota then
                raise exception 'Pendaftaran gagal: kuota event sudah penuh (maksimal % peserta)', v_kuota;
            end if;
        end if;
    end if;
    return new;
end;
$$;

create trigger trg_check_kuota_event
    before insert or update on pendaftaran_event
    for each row
    execute function check_kuota_event();

create table presensi_event (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete cascade,
    event_id uuid not null references event(id) on delete cascade,
    hadir boolean not null default false
);

create table artikel (
    id uuid primary key default gen_random_uuid(),
    penulis_id uuid references anggota(id),
    judul text not null,
    slug text unique, -- URL-friendly identifier, mis. "laporan-ekspedisi-rinjani-2024"
    konten text,
    kategori text check (kategori in ('berita', 'laporan_ekspedisi', 'tips')),
    thumbnail text, -- path/url gambar cover
    status text not null default 'draft' check (status in ('draft', 'review', 'published')),
    tanggal_publish timestamptz,
    created_at timestamptz not null default now()
);

-- ============================================================
-- 7. INVENTARIS
-- ============================================================

create table alat (
    id uuid primary key default gen_random_uuid(),
    nama_alat text not null,
    kategori text,
    kondisi text check (kondisi in ('baik', 'rusak_ringan', 'rusak_berat')) default 'baik',
    stok integer not null default 0 check (stok >= 0)
);

create table peminjaman_alat (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    alat_id uuid not null references alat(id),
    jumlah integer not null default 1 check (jumlah > 0), -- berapa unit yang dipinjam
    tanggal_pinjam date not null default current_date,
    tanggal_kembali date,
    status text not null default 'diajukan' check (status in ('diajukan', 'disetujui', 'dipinjam', 'dikembalikan', 'ditolak')),
    approved_by uuid references anggota(id) -- siapa yang approve (FK, bukan text)
);

-- Trigger: validasi batas stok alat dan sinkronisasi otomatis saat peminjaman diproses
create or replace function sync_stok_peminjaman_alat()
returns trigger
language plpgsql
as $$
declare
    v_stok_tersedia integer;
begin
    -- Saat disetujui atau langsung dipinjam dari status awal 'diajukan'/'ditolak'
    if (new.status in ('disetujui', 'dipinjam')) and (old is null or old.status in ('diajukan', 'ditolak')) then
        select stok into v_stok_tersedia from alat where id = new.alat_id for update;
        if v_stok_tersedia < new.jumlah then
            raise exception 'Stok alat tidak mencukupi (sisa: % unit, diminta: % unit)', v_stok_tersedia, new.jumlah;
        end if;
        update alat set stok = stok - new.jumlah where id = new.alat_id;

    -- Saat alat dikembalikan
    elsif (new.status = 'dikembalikan') and (old.status in ('disetujui', 'dipinjam')) then
        update alat set stok = stok + new.jumlah where id = new.alat_id;

    -- Jika peminjaman yang sempat disetujui dibatalkan/ditolak
    elsif (new.status in ('ditolak', 'diajukan')) and (old.status in ('disetujui', 'dipinjam')) then
        update alat set stok = stok + old.jumlah where id = new.alat_id;
    end if;

    return new;
end;
$$;

create trigger trg_sync_stok_peminjaman
    before update on peminjaman_alat
    for each row
    execute function sync_stok_peminjaman_alat();

-- ============================================================
-- 8. ACHIEVEMENT
-- ============================================================

create table kta (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    nia text not null,
    tanggal_terbit date not null default current_date,
    file text
);

-- Trigger: validasi penerbitan KTA (defense-in-depth: hanya jika anggota sudah memiliki NIA resmi)
create or replace function validate_kta_penerbitan()
returns trigger
language plpgsql
as $$
declare
    v_nia text;
begin
    select nia into v_nia from anggota where id = new.anggota_id;
    if v_nia is null or trim(v_nia) = '' then
        raise exception 'KTA tidak dapat diterbitkan: anggota belum memiliki NIA resmi';
    end if;
    -- Selalu sinkronkan kolom nia pada kta dengan nia resmi anggota
    new.nia = v_nia;
    return new;
end;
$$;

create trigger trg_validate_kta_penerbitan
    before insert or update on kta
    for each row
    execute function validate_kta_penerbitan();

create table sertifikat (
    id uuid primary key default gen_random_uuid(),
    anggota_id uuid not null references anggota(id) on delete restrict,
    jenis text not null,
    tanggal_terbit date not null default current_date,
    file text
);

-- ============================================================
-- 9. KONTEN PUBLIK
-- ============================================================

-- Konten statis: halaman profil organisasi (visi misi, sejarah, dll).
-- Dikelola admin lewat CMS, ditampilkan ke publik.
create table konten_statis (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique, -- mis. "visi-misi", "sejarah", "tentang"
    judul text not null,
    konten text, -- HTML/markdown
    updated_at timestamptz not null default now()
);

create table rute_ekspedisi (
    id uuid primary key default gen_random_uuid(),
    nama text not null,
    lokasi text,
    tanggal date,
    deskripsi text,
    peserta text, -- deskripsi peserta (cukup text untuk MVP, tidak perlu pivot table)
    foto text[] -- array url foto
);

-- ============================================================
-- 10. RPC FUNCTIONS
-- ============================================================

-- RPC function: update profil anggota (safe, field-limited)
-- Anggota hanya boleh update field biodata tertentu lewat function ini.
-- Field sensitif (status, NIA, angkatan, is_admin) tidak bisa diubah.
create or replace function update_profil_anggota(
    p_nama text default null,
    p_tempat_lahir text default null,
    p_tanggal_lahir date default null,
    p_jenis_kelamin text default null,
    p_no_hp text default null,
    p_alamat text default null,
    p_nim text default null,
    p_jurusan text default null,
    p_foto_profil text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_anggota_id uuid;
begin
    select id into v_anggota_id
    from anggota
    where auth_user_id = auth.uid();

    if v_anggota_id is null then
        raise exception 'Anggota tidak ditemukan untuk user ini';
    end if;

    update anggota set
        nama = coalesce(p_nama, nama),
        tempat_lahir = coalesce(p_tempat_lahir, tempat_lahir),
        tanggal_lahir = coalesce(p_tanggal_lahir, tanggal_lahir),
        jenis_kelamin = coalesce(p_jenis_kelamin, jenis_kelamin),
        no_hp = coalesce(p_no_hp, no_hp),
        alamat = coalesce(p_alamat, alamat),
        nim = coalesce(p_nim, nim),
        jurusan = coalesce(p_jurusan, jurusan),
        foto_profil = coalesce(p_foto_profil, foto_profil)
        -- updated_at otomatis lewat trigger trg_anggota_updated_at
    where id = v_anggota_id;
end;
$$;

-- RPC function: cari anggota yang belum klaim akun (untuk form klaim akun)
-- Mengembalikan kolom publik yang aman (tanpa PII seperti no_hp, alamat, dll)
create or replace function search_unclaimed_anggota(
    p_query text default '',
    p_angkatan_id uuid default null
)
returns table (
    id uuid,
    nama text,
    nomor_angkatan integer,
    nama_angkatan text,
    status_keanggotaan text,
    jurusan text
)
language sql
stable
security definer
set search_path = public
as $$
    select
        a.id,
        a.nama,
        ang.nomor_angkatan,
        ang.nama_angkatan,
        a.status_keanggotaan::text,
        a.jurusan
    from anggota a
    left join angkatan ang on ang.id = a.angkatan_id
    where a.auth_user_id is null
      and a.status_keanggotaan not in ('dicabut')
      and (p_query = '' or a.nama ilike '%' || p_query || '%')
      and (p_angkatan_id is null or a.angkatan_id = p_angkatan_id)
    order by ang.nomor_angkatan desc nulls last, a.nama asc
    limit 30;
$$;

-- RPC function: generate tagihan iuran bulanan untuk seluruh anggota aktif
-- Berjalan idempoten (on conflict do nothing) berdasarkan tarif_iuran yang berlaku
create or replace function generate_tagihan_iuran_bulanan(p_periode text default to_char(current_date, 'YYYY-MM'))
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_count integer := 0;
begin
    insert into iuran (anggota_id, periode, nominal, status_bayar)
    select
        a.id as anggota_id,
        p_periode as periode,
        t.nominal,
        'menunggak' as status_bayar
    from anggota a
    cross join lateral (
        select nominal from tarif_iuran
        where status_keanggotaan = a.status_keanggotaan
          and berlaku_sejak <= current_date
        order by berlaku_sejak desc
        limit 1
    ) t
    where a.status_keanggotaan in ('anggota_muda', 'anggota_biasa', 'anggota_luar_biasa')
    on conflict (anggota_id, periode) do nothing;

    get diagnostics v_count = row_count;
    return v_count;
end;
$$;

-- RPC Function: Submit jawaban post-test dan penilaian otomatis di sisi server
-- Siswa mengirim array jawaban: [{"soal_id": "...", "jawaban": "A"}, ...]
-- Server mencocokkan dengan kunci_jawaban_post_test, menghitung skor, dan menyimpan ke hasil_post_test
create or replace function submit_post_test(
    p_materi_id uuid,
    p_jawaban jsonb
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
    v_anggota_id uuid;
    v_total_soal integer;
    v_benar integer := 0;
    v_skor numeric(5,2) := 0;
    v_item jsonb;
    v_soal_id uuid;
    v_jawaban_user text;
    v_jawaban_benar text;
begin
    select id into v_anggota_id from anggota where auth_user_id = auth.uid();
    if v_anggota_id is null then
        raise exception 'Anggota tidak ditemukan untuk akun ini';
    end if;

    select count(*) into v_total_soal from soal_post_test where materi_id = p_materi_id;
    if v_total_soal = 0 then
        raise exception 'Tidak ada soal untuk materi ini';
    end if;

    for v_item in select * from jsonb_array_elements(p_jawaban)
    loop
        v_soal_id := (v_item->>'soal_id')::uuid;
        v_jawaban_user := trim(v_item->>'jawaban');

        select jawaban_benar into v_jawaban_benar
        from kunci_jawaban_post_test
        where soal_id = v_soal_id;

        if v_jawaban_benar is not null and lower(v_jawaban_user) = lower(v_jawaban_benar) then
            v_benar := v_benar + 1;
        end if;
    end loop;

    v_skor := round((v_benar::numeric / v_total_soal::numeric) * 100, 2);

    insert into hasil_post_test (anggota_id, materi_id, skor, dikerjakan_pada)
    values (v_anggota_id, p_materi_id, v_skor, now());

    return v_skor;
end;
$$;

-- ============================================================
-- 11. INDEKS PERFORMA & FOREIGN KEY
-- ============================================================
-- Postgres tidak otomatis membuat indeks pada foreign key.
-- Indeks berikut mempercepat lookup auth, evaluasi RLS, dan relasi transaksi berulang:

-- Lookup Auth & User Roles (kritis untuk evaluasi RLS pada setiap request)
create index if not exists idx_anggota_auth_user_id on anggota(auth_user_id);
create index if not exists idx_user_roles_anggota_active on user_roles(anggota_id, is_active);
create index if not exists idx_klaim_akun_auth_user on klaim_akun(auth_user_id);

-- Relasi Kaderisasi & Presensi
create index if not exists idx_riwayat_tahap_anggota on riwayat_tahap(anggota_id);
create index if not exists idx_tes_kesehatan_anggota on tes_kesehatan(anggota_id);
create index if not exists idx_sesi_kegiatan_angkatan_tanggal on sesi_kegiatan(angkatan_id, tanggal);
create index if not exists idx_presensi_kaderisasi_anggota on presensi_kaderisasi(anggota_id);
create index if not exists idx_presensi_kaderisasi_sesi on presensi_kaderisasi(sesi_kegiatan_id);
create index if not exists idx_alat_siswa_anggota on alat_siswa(anggota_id);

-- Relasi Evaluasi
create index if not exists idx_evaluasi_individu_anggota on evaluasi_individu(anggota_id);
create index if not exists idx_evaluasi_kelompok_angkatan on evaluasi_kelompok(angkatan_id);
create index if not exists idx_evaluasi_berkala_anggota on evaluasi_berkala(anggota_id);

-- Relasi Keuangan & Event
create index if not exists idx_iuran_status_periode on iuran(status_bayar, periode);
create index if not exists idx_transaksi_kas_tipe_tanggal on transaksi_kas(tipe, tanggal);
create index if not exists idx_pendaftaran_event_event on pendaftaran_event(event_id);
create index if not exists idx_presensi_event_event on presensi_event(event_id);

-- Relasi Operasional & Konten
create index if not exists idx_peminjaman_alat_anggota on peminjaman_alat(anggota_id);
create index if not exists idx_peminjaman_alat_status on peminjaman_alat(status);
create index if not exists idx_artikel_penulis_status on artikel(penulis_id, status);
create index if not exists idx_kta_anggota on kta(anggota_id);
create index if not exists idx_sertifikat_anggota on sertifikat(anggota_id);

-- ============================================================
-- CATATAN IMPLEMENTASI
-- ============================================================
-- 1. Perlindungan Riwayat (NFR-2): Foreign key tabel histori (riwayat_tahap, tes_kesehatan,
--    evaluasi, jabatan, iuran, KTA, sertifikat, LPJ) memakai ON DELETE RESTRICT.
--    Hard delete anggota ditiadakan; nonaktifkan anggota via status_keanggotaan = 'dicabut'.
-- 2. Kunci Jawaban Post-Test: Dipisah ke tabel kunci_jawaban_post_test (hanya bisa dibaca admin).
--    Siswa mengerjakan soal via soal_post_test dan mengirim jawaban ke RPC submit_post_test()
--    untuk penilaian server-side, mencegah kecurangan/kebocoran kunci jawaban.
-- 3. Integritas Inventaris: Trigger trg_sync_stok_peminjaman memvalidasi ketersediaan stok alat
--    dan otomatis mengurangi stok saat disetujui serta menambah kembali saat dikembalikan.
-- 4. Penegakan Kuota Event: Trigger trg_check_kuota_event membatasi jumlah pendaftaran terdaftar
--    agar tidak melebihi kuota event yang ditetapkan.
-- 5. Rekonsiliasi Kas Otomatis: Trigger trg_sponsorship_ke_kas otomatis membuat entri transaksi_kas
--    masuk saat penerimaan sponsorship/donasi dicatat, mencegah selisih pembukuan bendahara.
-- 6. KTA divalidasi dengan trigger database trg_validate_kta_penerbitan
--    (defense-in-depth) memastikan anggota memiliki NIA resmi sebelum diterbitkan.
-- 7. Sinkronisasi status kaderisasi (Calon Siswa -> Siswa -> Medan Operasi -> Anggota Muda)
--    dilakukan otomatis lewat trigger trg_sync_status_kaderisasi pada riwayat_tahap.
--    Promosi Anggota Muda -> Anggota Biasa otomatis lewat trg_anggota_nia_promosi saat NIA diinput.
-- 8. Tagihan iuran bulanan dapat digenerate secara idempoten melalui RPC function
--    generate_tagihan_iuran_bulanan() (bisa dijadwalkan via pg_cron atau cron Edge Function).
-- 9. Aktifkan Row Level Security (RLS) di Supabase menggunakan rls-policy-gandawesi.sql.
--    Tabel anggota diproteksi (own-profile + admin) dan direktori publik dilayani
--    melalui view terproteksi v_anggota_direktori.
-- 10. Role system menggunakan tabel `user_roles` + flag fallback `is_admin`
--     di tabel anggota (untuk bootstrap admin pertama sebelum user_roles terisi).
-- 11. Anggota meng-update profil sendiri lewat RPC function
--     `update_profil_anggota()` — bukan direct UPDATE ke tabel anggota.
-- 12. Supabase Storage buckets yang perlu dibuat:
--     - `avatars` — foto profil anggota
--     - `documents` — surat dokter, persetujuan ortu, LPJ, dll
--     - `slides` — file presentasi
--     - `articles` — thumbnail & media artikel
--     - `certificates` — KTA & sertifikat digital
--     - `receipts` — bukti transaksi keuangan
--     - `expeditions` — foto rute/ekspedisi
