-- ============================================================
-- SEED & SETUP AWAL GANDAWESI
-- Jalankan skrip ini di SQL Editor Supabase setelah menjalankan
-- schema-gandawesi.sql dan rls-policy-gandawesi.sql
-- ============================================================

-- 1. BUAT STORAGE BUCKETS
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('slides', 'slides', false),
  ('articles', 'articles', true),
  ('certificates', 'certificates', false),
  ('receipts', 'receipts', false),
  ('expeditions', 'expeditions', true)
on conflict (id) do nothing;

-- Policy Storage: Avatars (Publik bisa baca, user login bisa upload)
create policy "avatars_public_select" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_authenticated_insert" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars_owner_update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Policy Storage: Documents (Pemilik & Admin)
create policy "documents_authenticated_select" on storage.objects
  for select using (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "documents_authenticated_insert" on storage.objects
  for insert with check (bucket_id = 'documents' and auth.role() = 'authenticated');

-- 2. SEED DATA ANGKATAN RESMI
insert into angkatan (nomor_angkatan, nama_angkatan, tahun)
values
  (32, 'Giri Wardhana', 2025),
  (31, 'Cakrawala Sunda', 2024),
  (30, 'Elang Merbabu', 2023),
  (29, 'Kabut Lembah', 2022),
  (28, 'Tapak Rimba', 2021),
  (27, 'Pijar Lembah', 2020),
  (26, 'Badai Puncak', 2019)
on conflict (nomor_angkatan) do nothing;

-- 3. SEED PERIODE PENDAFTARAN AKTIF (ANGKATAN 32)
insert into periode_pendaftaran (angkatan_id, tanggal_buka, tanggal_tutup, status, catatan)
select
  id,
  current_date - interval '14 days',
  current_date + interval '60 days',
  'buka',
  'Penerimaan Calon Siswa Diklat Angkatan 32 Gandawesi FPTI UPI'
from angkatan
where nomor_angkatan = 32
on conflict do nothing;

-- 4. SEED ANGGOTA LAMA UNTUK FITUR KLAIM AKUN (auth_user_id IS NULL)
insert into anggota (nama, angkatan_id, status_keanggotaan, nia, jenis_kelamin, nim, jurusan, no_hp, alamat)
select
  'Bambang Trihatmodjo',
  a.id,
  'anggota_biasa',
  'GW.27.180.AB',
  'L',
  '1904123',
  'Pendidikan Geografi',
  '081234567801',
  'Jl. Setiabudhi No. 229 Bandung'
from angkatan a where a.nomor_angkatan = 27
on conflict (email) do nothing;

insert into anggota (nama, angkatan_id, status_keanggotaan, nia, jenis_kelamin, nim, jurusan, no_hp, alamat)
select
  'Bayu Wicaksono',
  a.id,
  'anggota_biasa',
  'GW.28.195.AB',
  'L',
  '2005432',
  'Pendidikan Bahasa Inggris',
  '081234567802',
  'Jl. Gegerkalong Hilir No. 12 Bandung'
from angkatan a where a.nomor_angkatan = 28
on conflict (email) do nothing;

insert into anggota (nama, angkatan_id, status_keanggotaan, nia, jenis_kelamin, nim, jurusan, no_hp, alamat)
select
  'Annisa Nurul Hidayah',
  a.id,
  'anggota_muda',
  null,
  'P',
  '2103214',
  'Pendidikan Biologi',
  '081234567803',
  'Jl. Isola Asri No. 5 Bandung'
from angkatan a where a.nomor_angkatan = 29
on conflict (email) do nothing;
