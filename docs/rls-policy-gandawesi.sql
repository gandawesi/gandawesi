-- ============================================================
-- Row Level Security (RLS) — Gandawesi
-- Dijalankan SETELAH schema-gandawesi.sql
-- ============================================================
-- Kolom `is_admin` (anggota) dan `is_public` (event) sudah ada
-- di CREATE TABLE di schema — tidak perlu ALTER TABLE di sini.

-- ------------------------------------------------------------
-- 1. Helper functions
-- ------------------------------------------------------------

-- Mengembalikan id anggota (baris di tabel anggota) untuk user yang sedang login.
create or replace function current_anggota_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
    select id from anggota where auth_user_id = auth.uid()
$$;

-- true kalau user yang login adalah admin.
-- Cek dari tabel user_roles (role = 'admin', aktif) ATAU fallback flag is_admin.
-- Digabungkan dalam satu query untuk efisiensi.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (select true from anggota a
         where a.auth_user_id = auth.uid()
         and (
             a.is_admin = true
             or exists (
                 select 1 from user_roles ur
                 where ur.anggota_id = a.id
                 and ur.role = 'admin'
                 and ur.is_active = true
             )
         )
        ),
        false
    )
$$;

-- true kalau user punya role tertentu yang aktif di tabel user_roles.
create or replace function has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (select true from user_roles ur
         join anggota a on a.id = ur.anggota_id
         where a.auth_user_id = auth.uid()
         and ur.role = p_role
         and ur.is_active = true
        ),
        false
    )
$$;

-- Shortcut: true kalau user punya role apa pun yang berhak input data kaderisasi.
-- Termasuk: admin (via flag ATAU user_roles), panitia, danlat, DP, ketua.
-- Semua cek digabung dalam satu query — tidak ada panggilan fungsi tambahan.
create or replace function is_panitia_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (select true from anggota a
         where a.auth_user_id = auth.uid()
         and (
             a.is_admin = true
             or exists (
                 select 1 from user_roles ur
                 where ur.anggota_id = a.id
                 and ur.role in ('admin', 'panitia', 'danlat', 'pengurus_dp', 'ketua_dp', 'ketua_organisasi', 'ketua_medan_operasi')
                 and ur.is_active = true
             )
         )
        ),
        false
    )
$$;

-- true kalau anggota berstatus aktif (bukan sekadar calon siswa/siswa).
create or replace function is_anggota_aktif()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (select status_keanggotaan in (
            'anggota_muda', 'anggota_biasa', 'anggota_luar_biasa', 'anggota_kehormatan'
        ) from anggota where auth_user_id = auth.uid()),
        false
    )
$$;

-- true kalau record anggota ada dan belum terhubung ke auth_user_id mana pun.
-- security definer agar bisa divalidasi saat klaim_akun meski SELECT anggota dibatasi.
create or replace function is_unclaimed_anggota(p_anggota_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from anggota
        where id = p_anggota_id and auth_user_id is null
    );
$$;

-- ------------------------------------------------------------
-- 2. Aktifkan RLS di semua tabel
-- ------------------------------------------------------------

alter table angkatan enable row level security;
alter table periode_pendaftaran enable row level security;
alter table anggota enable row level security;
alter table riwayat_tahap enable row level security;
alter table tes_kesehatan enable row level security;
alter table klaim_akun enable row level security;
alter table user_roles enable row level security;
alter table sesi_kegiatan enable row level security;
alter table presensi_kaderisasi enable row level security;
alter table materi enable row level security;
alter table soal_post_test enable row level security;
alter table kunci_jawaban_post_test enable row level security;
alter table hasil_post_test enable row level security;
alter table alat_siswa enable row level security;
alter table evaluasi_individu enable row level security;
alter table evaluasi_kelompok enable row level security;
alter table evaluasi_berkala enable row level security;
alter table presentasi enable row level security;
alter table rencana_ekspedisi enable row level security;
alter table peserta_ekspedisi enable row level security;
alter table kriteria_evaluasi enable row level security;
alter table nilai_evaluasi enable row level security;
alter table jabatan_organisasi enable row level security;
alter table dewan_penasehat enable row level security;
alter table lpj enable row level security;
alter table tarif_iuran enable row level security;
alter table iuran enable row level security;
alter table event enable row level security;
alter table transaksi_kas enable row level security;
alter table event_anggaran enable row level security;
alter table sponsorship enable row level security;
alter table pendaftaran_event enable row level security;
alter table presensi_event enable row level security;
alter table artikel enable row level security;
alter table alat enable row level security;
alter table peminjaman_alat enable row level security;
alter table kta enable row level security;
alter table sertifikat enable row level security;
alter table konten_statis enable row level security;
alter table rute_ekspedisi enable row level security;

-- ------------------------------------------------------------
-- 3. KEANGGOTAAN INTI
-- ------------------------------------------------------------

-- angkatan: publik boleh baca
create policy "angkatan_select_public" on angkatan for select using (true);
create policy "angkatan_write_admin" on angkatan for all using (is_admin()) with check (is_admin());

-- periode_pendaftaran: publik boleh baca (calon siswa perlu tahu kapan buka)
create policy "periode_pendaftaran_select_public" on periode_pendaftaran for select using (true);
create policy "periode_pendaftaran_write_admin" on periode_pendaftaran for all using (is_admin()) with check (is_admin());

-- anggota:
--  - Self-registration: login Google dulu, baru insert row sebagai calon_siswa
--  - Anggota lama: admin buat row dulu, lalu diklaim lewat klaim_akun
--  - SELECT: dibatasi hanya baris milik sendiri ATAU admin (mencegah kebocoran PII:
--            no_hp, alamat, file_persetujuan_ortu, catatan_status, dll).
--            Untuk direktori publik/anggota, akses dialihkan ke view terproteksi `v_anggota_direktori`.
--  - UPDATE: admin only (anggota update lewat RPC update_profil_anggota)
--  - DELETE: TIDAK DIIZINKAN lewat API client (NFR-2). Pencabutan anggota via status 'dicabut'.
create policy "anggota_insert_self_registration" on anggota
    for insert
    with check (
        (auth.role() = 'authenticated' and auth_user_id = auth.uid()
            and status_keanggotaan = 'calon_siswa' and is_admin = false)
        or is_admin()
    );

create policy "anggota_select_own_or_admin" on anggota
    for select
    using (auth_user_id = auth.uid() or is_admin());

create policy "anggota_update_admin_only" on anggota
    for update
    using (is_admin())
    with check (is_admin());

-- riwayat_tahap, tes_kesehatan: sensitif — anggota baca milik sendiri
create policy "riwayat_tahap_select_own_or_admin" on riwayat_tahap
    for select using (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "riwayat_tahap_write_admin" on riwayat_tahap
    for insert with check (is_panitia_or_admin());
create policy "riwayat_tahap_update_admin" on riwayat_tahap
    for update using (is_panitia_or_admin()) with check (is_panitia_or_admin());
create policy "riwayat_tahap_delete_admin" on riwayat_tahap
    for delete using (is_admin());

create policy "tes_kesehatan_select_own_or_admin" on tes_kesehatan
    for select using (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "tes_kesehatan_insert_own_or_admin" on tes_kesehatan
    for insert with check (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "tes_kesehatan_update_admin" on tes_kesehatan
    for update using (is_panitia_or_admin()) with check (is_panitia_or_admin());
create policy "tes_kesehatan_delete_admin" on tes_kesehatan
    for delete using (is_admin());

-- ------------------------------------------------------------
-- 3b. USER ROLES
-- ------------------------------------------------------------

create policy "user_roles_select_own_or_admin" on user_roles
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "user_roles_write_admin" on user_roles
    for insert with check (is_admin());
create policy "user_roles_update_admin" on user_roles
    for update using (is_admin()) with check (is_admin());
create policy "user_roles_delete_admin" on user_roles
    for delete using (is_admin());

-- ------------------------------------------------------------
-- 4. KADERISASI: SESI, PRESENSI, MATERI, ALAT
-- ------------------------------------------------------------

create policy "sesi_kegiatan_select_authenticated" on sesi_kegiatan
    for select using (auth.role() = 'authenticated' or is_admin());
create policy "sesi_kegiatan_write_panitia_or_admin" on sesi_kegiatan
    for insert with check (is_panitia_or_admin());
create policy "sesi_kegiatan_update_panitia_or_admin" on sesi_kegiatan
    for update using (is_panitia_or_admin()) with check (is_panitia_or_admin());
create policy "sesi_kegiatan_delete_admin" on sesi_kegiatan
    for delete using (is_admin());

create policy "presensi_kaderisasi_select_own_or_panitia" on presensi_kaderisasi
    for select using (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "presensi_kaderisasi_write_panitia_or_admin" on presensi_kaderisasi
    for insert with check (is_panitia_or_admin());
create policy "presensi_kaderisasi_update_panitia_or_admin" on presensi_kaderisasi
    for update using (is_panitia_or_admin()) with check (is_panitia_or_admin());
create policy "presensi_kaderisasi_delete_admin" on presensi_kaderisasi
    for delete using (is_admin());

create policy "materi_select_authenticated" on materi
    for select using (auth.role() = 'authenticated' or is_admin());
create policy "materi_write_admin" on materi
    for all using (is_admin()) with check (is_admin());

create policy "soal_post_test_select_authenticated" on soal_post_test
    for select using (auth.role() = 'authenticated' or is_admin());
create policy "soal_post_test_write_admin" on soal_post_test
    for all using (is_admin()) with check (is_admin());

-- kunci_jawaban_post_test: rahasia, HANYA admin yang boleh akses langsung.
-- Evaluasi jawaban siswa dilakukan aman di server via RPC submit_post_test().
create policy "kunci_jawaban_post_test_admin_only" on kunci_jawaban_post_test
    for all using (is_admin()) with check (is_admin());

create policy "hasil_post_test_select_own_or_admin" on hasil_post_test
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "hasil_post_test_insert_own" on hasil_post_test
    for insert with check (anggota_id = current_anggota_id() or is_admin());
create policy "hasil_post_test_update_admin" on hasil_post_test
    for update using (is_admin()) with check (is_admin());

create policy "alat_siswa_select_own_or_admin" on alat_siswa
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "alat_siswa_write_own_or_admin" on alat_siswa
    for insert with check (anggota_id = current_anggota_id() or is_admin());
create policy "alat_siswa_update_admin" on alat_siswa
    for update using (is_admin()) with check (is_admin());
create policy "alat_siswa_delete_admin" on alat_siswa
    for delete using (is_admin());

-- ------------------------------------------------------------
-- 5. EVALUASI — sensitif, panitia/danlat input
-- ------------------------------------------------------------

create policy "evaluasi_individu_select_own_or_panitia" on evaluasi_individu
    for select using (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "evaluasi_individu_write_panitia_or_admin" on evaluasi_individu
    for insert with check (is_panitia_or_admin());
create policy "evaluasi_individu_update_panitia_or_admin" on evaluasi_individu
    for update using (is_panitia_or_admin()) with check (is_panitia_or_admin());
create policy "evaluasi_individu_delete_admin" on evaluasi_individu
    for delete using (is_admin());

create policy "evaluasi_kelompok_select_authenticated" on evaluasi_kelompok
    for select using (auth.role() = 'authenticated' or is_admin());
create policy "evaluasi_kelompok_write_panitia_or_admin" on evaluasi_kelompok
    for insert with check (is_panitia_or_admin());
create policy "evaluasi_kelompok_update_panitia_or_admin" on evaluasi_kelompok
    for update using (is_panitia_or_admin()) with check (is_panitia_or_admin());
create policy "evaluasi_kelompok_delete_admin" on evaluasi_kelompok
    for delete using (is_admin());

create policy "evaluasi_berkala_select_own_or_panitia" on evaluasi_berkala
    for select using (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "evaluasi_berkala_write_admin" on evaluasi_berkala
    for all using (is_admin()) with check (is_admin());

create policy "presentasi_select_own_or_panitia" on presentasi
    for select using (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "presentasi_insert_own_or_panitia" on presentasi
    for insert with check (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "presentasi_update_admin" on presentasi
    for update using (is_admin()) with check (is_admin());
create policy "presentasi_delete_admin" on presentasi
    for delete using (is_admin());

create policy "rencana_ekspedisi_select_own_or_panitia" on rencana_ekspedisi
    for select using (pengaju_id = current_anggota_id() or is_panitia_or_admin());
create policy "rencana_ekspedisi_insert_own_or_panitia" on rencana_ekspedisi
    for insert
    with check (
        (pengaju_id = current_anggota_id() and status_approval = 'diajukan')
        or is_panitia_or_admin()
    );
create policy "rencana_ekspedisi_update_own_or_admin" on rencana_ekspedisi
    for update using (pengaju_id = current_anggota_id() or is_admin())
    with check (
        (pengaju_id = current_anggota_id() and status_approval = 'diajukan')
        or is_admin()
    );

create policy "peserta_ekspedisi_select_own_or_panitia" on peserta_ekspedisi
    for select using (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "peserta_ekspedisi_insert_own_or_panitia" on peserta_ekspedisi
    for insert with check (anggota_id = current_anggota_id() or is_panitia_or_admin());
create policy "peserta_ekspedisi_update_admin" on peserta_ekspedisi
    for update using (is_admin()) with check (is_admin());
create policy "peserta_ekspedisi_delete_admin" on peserta_ekspedisi
    for delete using (is_admin());

create policy "kriteria_evaluasi_select_authenticated" on kriteria_evaluasi
    for select using (auth.role() = 'authenticated' or is_admin());
create policy "kriteria_evaluasi_write_admin" on kriteria_evaluasi
    for all using (is_admin()) with check (is_admin());

create policy "nilai_evaluasi_select_own_or_admin" on nilai_evaluasi
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "nilai_evaluasi_write_admin" on nilai_evaluasi
    for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 6. GOVERNANCE & JABATAN — publik
-- ------------------------------------------------------------

create policy "jabatan_organisasi_select_public" on jabatan_organisasi
    for select using (true);
create policy "jabatan_organisasi_write_admin" on jabatan_organisasi
    for all using (is_admin()) with check (is_admin());

create policy "dewan_penasehat_select_public" on dewan_penasehat
    for select using (true);
create policy "dewan_penasehat_write_admin" on dewan_penasehat
    for all using (is_admin()) with check (is_admin());

create policy "lpj_select_own_or_admin" on lpj
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "lpj_insert_own_or_admin" on lpj
    for insert with check (anggota_id = current_anggota_id() or is_admin());
create policy "lpj_update_admin" on lpj
    for update using (is_admin()) with check (is_admin());
create policy "lpj_delete_admin" on lpj
    for delete using (is_admin());

-- ------------------------------------------------------------
-- 7. KEUANGAN
-- ------------------------------------------------------------

create policy "tarif_iuran_select_authenticated" on tarif_iuran
    for select using (auth.role() = 'authenticated' or is_admin());
create policy "tarif_iuran_write_admin" on tarif_iuran
    for all using (is_admin()) with check (is_admin());

create policy "iuran_select_own_or_admin" on iuran
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "iuran_write_admin" on iuran
    for all using (is_admin()) with check (is_admin());

create policy "transaksi_kas_select_authenticated" on transaksi_kas
    for select using (auth.role() = 'authenticated' or is_admin());
create policy "transaksi_kas_write_admin" on transaksi_kas
    for all using (is_admin()) with check (is_admin());

create policy "event_anggaran_select_authenticated" on event_anggaran
    for select using (auth.role() = 'authenticated' or is_admin());
create policy "event_anggaran_write_admin" on event_anggaran
    for all using (is_admin()) with check (is_admin());

create policy "sponsorship_select_public" on sponsorship
    for select using (true);
create policy "sponsorship_write_admin" on sponsorship
    for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 8. EVENT & ARTIKEL
-- ------------------------------------------------------------

create policy "event_select_public_or_member" on event
    for select using (is_public = true or auth.role() = 'authenticated' or is_admin());
create policy "event_write_admin" on event
    for all using (is_admin()) with check (is_admin());

create policy "pendaftaran_event_select_own_or_admin" on pendaftaran_event
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "pendaftaran_event_insert_own" on pendaftaran_event
    for insert with check (anggota_id = current_anggota_id() or is_admin());
create policy "pendaftaran_event_update_own_or_admin" on pendaftaran_event
    for update using (anggota_id = current_anggota_id() or is_admin())
    with check (anggota_id = current_anggota_id() or is_admin());

create policy "presensi_event_select_own_or_admin" on presensi_event
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "presensi_event_write_admin" on presensi_event
    for all using (is_admin()) with check (is_admin());

create policy "artikel_select_published_or_own_or_admin" on artikel
    for select using (status = 'published' or penulis_id = current_anggota_id() or is_admin());
create policy "artikel_insert_own" on artikel
    for insert
    with check (
        (penulis_id = current_anggota_id() and status = 'draft' and tanggal_publish is null)
        or is_admin()
    );
create policy "artikel_update_own_draft_or_admin" on artikel
    for update
    using ((penulis_id = current_anggota_id() and status = 'draft') or is_admin())
    with check (
        ((penulis_id = current_anggota_id() and status in ('draft', 'review') and tanggal_publish is null))
        or is_admin()
    );
create policy "artikel_delete_admin" on artikel
    for delete using (is_admin());

-- ------------------------------------------------------------
-- 9. INVENTARIS
-- ------------------------------------------------------------

create policy "alat_select_authenticated" on alat
    for select using (auth.role() = 'authenticated' or is_admin());
create policy "alat_write_admin" on alat
    for all using (is_admin()) with check (is_admin());

create policy "peminjaman_alat_select_own_or_admin" on peminjaman_alat
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "peminjaman_alat_insert_own" on peminjaman_alat
    for insert
    with check (
        (anggota_id = current_anggota_id() and status = 'diajukan' and approved_by is null)
        or is_admin()
    );
create policy "peminjaman_alat_update_admin" on peminjaman_alat
    for update using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 10. ACHIEVEMENT
-- ------------------------------------------------------------

create policy "kta_select_own_or_admin" on kta
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "kta_write_admin" on kta
    for all using (is_admin()) with check (is_admin());

create policy "sertifikat_select_own_or_admin" on sertifikat
    for select using (anggota_id = current_anggota_id() or is_admin());
create policy "sertifikat_write_admin" on sertifikat
    for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 11. KONTEN PUBLIK
-- ------------------------------------------------------------

create policy "konten_statis_select_public" on konten_statis
    for select using (true);
create policy "konten_statis_write_admin" on konten_statis
    for all using (is_admin()) with check (is_admin());

create policy "rute_ekspedisi_select_public" on rute_ekspedisi
    for select using (true);
create policy "rute_ekspedisi_write_admin" on rute_ekspedisi
    for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 12. KLAIM AKUN
-- ------------------------------------------------------------

create policy "klaim_akun_insert_own" on klaim_akun
    for insert
    with check (
        (auth_user_id = auth.uid()
            and is_unclaimed_anggota(anggota_id)
            and status = 'menunggu'
            and diproses_oleh is null
            and diproses_pada is null)
        or is_admin()
    );

create policy "klaim_akun_select_own_or_admin" on klaim_akun
    for select using (auth_user_id = auth.uid() or is_admin());

create policy "klaim_akun_update_admin" on klaim_akun
    for update using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 13. SECURE VIEW UNTUK DIREKTORI ANGGOTA
-- ------------------------------------------------------------
-- View ini menggantikan akses SELECT langsung ke tabel `anggota`.
-- Dibuat dengan security_invoker = false (berjalan dengan privilege postgres/owner)
-- sehingga mengekspos HANYA kolom publik yang aman bagi sesama anggota:
-- PII sensitif (no_hp, alamat, tempat_lahir, file_persetujuan_ortu, catatan_status)
-- tetap terlindungi rapat di tabel anggota asli.

create or replace view v_anggota_direktori
with (security_invoker = false)
as
select
    a.id,
    a.nama,
    a.angkatan_id,
    ang.nomor_angkatan,
    ang.nama_angkatan,
    a.status_keanggotaan,
    a.nia,
    a.foto_profil,
    a.jurusan
from anggota a
left join angkatan ang on ang.id = a.angkatan_id
where a.status_keanggotaan not in ('dicabut');

-- Berikan izin akses SELECT view kepada seluruh user yang terotentikasi
grant select on v_anggota_direktori to authenticated;
grant execute on function search_unclaimed_anggota to authenticated;
grant execute on function update_profil_anggota to authenticated;

-- ============================================================
-- CATATAN
-- ============================================================
-- 1. Alur akun: login Google → "daftar calon siswa baru" (insert anggota)
--    ATAU "klaim akun anggota lama" (insert klaim_akun → approval admin).
-- 2. "anggota_select_own_or_admin" mengunci tabel anggota hanya untuk profil sendiri & admin.
--    Fitur direktori anggota di frontend WAJIB membaca view `v_anggota_direktori`.
-- 3. Pengecekan keabsahan klaim akun baru menggunakan helper function security definer
--    `is_unclaimed_anggota()` agar lolos proteksi RLS tanpa mengekspos tabel anggota.
-- 4. Role system: tabel user_roles + flag is_admin (fallback bootstrap).
--    Helper functions: is_admin(), has_role(), is_panitia_or_admin().
-- 5. Profil update: hanya lewat RPC update_profil_anggota(), bukan direct UPDATE.
