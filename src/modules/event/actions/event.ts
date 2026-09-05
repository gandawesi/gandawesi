'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  EventItem,
  CreateEventPayload,
  UpdateEventPayload,
  PendaftaranEventItem,
  PresensiEventItem,
} from '@/lib/types/event';

// Initial fallback mock data for testing & offline mode
let MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    nama: 'Latihan Bersama Single Rope Technique (SRT) Tebing Citatah 125',
    jenis: 'Latihan Alam',
    lokasi: 'Tebing Citatah 125, Padalarang, Bandung Barat',
    tanggal: '2025-07-12',
    tanggal_selesai: '2025-07-13',
    kuota: 25,
    deskripsi: 'Latihan pemantapan teknik ascending, descending, pass knot, dan rigging jalur vertical rescue untuk anggota muda dan biasa.',
    is_public: true,
    status: 'upcoming',
    created_at: '2025-06-01T08:00:00Z',
    pendaftar_count: 18,
    user_registered: true,
    user_hadir: false,
  },
  {
    id: 'evt-2',
    nama: 'Fun Climbing Dies Natalis Gandawesi FPTI UPI ke-34',
    jenis: 'Kompetisi Internal',
    lokasi: 'Wall Climbing Sporthall UPI Bumi Siliwangi',
    tanggal: '2025-07-26',
    tanggal_selesai: '2025-07-27',
    kuota: 40,
    deskripsi: 'Ajang silaturahmi olahraga panjat dinding kategori Lead & Boulder terbuka untuk anggota aktif, siswa, dan alumni keluarga besar Gandawesi.',
    is_public: true,
    status: 'upcoming',
    created_at: '2025-06-05T09:30:00Z',
    pendaftar_count: 32,
    user_registered: false,
    user_hadir: false,
  },
  {
    id: 'evt-3',
    nama: 'Bakti Sosial Konservasi Mata Air & Penanaman Bibit Hutan Jayagiri',
    jenis: 'Pengabdian Masyarakat',
    lokasi: 'Kawasan Hutan Lindung Jayagiri, Lembang',
    tanggal: '2025-08-09',
    tanggal_selesai: '2025-08-09',
    kuota: 30,
    deskripsi: 'Aksi nyata pelestarian mata air dan penanaman 200 bibit pohon endemik Jawa Barat bekerjasama dengan Perhutani dan warga desa setempat.',
    is_public: true,
    status: 'upcoming',
    created_at: '2025-06-10T11:00:00Z',
    pendaftar_count: 15,
    user_registered: false,
    user_hadir: false,
  },
  {
    id: 'evt-4',
    nama: 'Musyawarah Anggota (MUSANG) Gandawesi XXXI',
    jenis: 'Rapat Organisasi',
    lokasi: 'Gedung Geugeut-Winda Lt. 2 UPI Bandung',
    tanggal: '2025-05-20',
    tanggal_selesai: '2025-05-21',
    kuota: 60,
    deskripsi: 'Laporan pertanggungjawaban Pengurus 2024-2025, amandemen AD/ART, dan pemilihan Ketua Umum Gandawesi periode 2025-2026.',
    is_public: false,
    status: 'selesai',
    created_at: '2025-04-15T14:00:00Z',
    pendaftar_count: 52,
    user_registered: true,
    user_hadir: true,
  },
  {
    id: 'evt-5',
    nama: 'Ekspedisi Arung Jeram & Pemetaan Sungai Citarik Arus Deras',
    jenis: 'Ekspedisi',
    lokasi: 'Sungai Citarik, Cikidang, Sukabumi',
    tanggal: '2025-05-02',
    tanggal_selesai: '2025-05-04',
    kuota: 16,
    deskripsi: 'Eksplorasi debit air, pemetaan jeram grade III-IV, dan simulasi flip-recovery perahu karet.',
    is_public: true,
    status: 'selesai',
    created_at: '2025-03-25T10:00:00Z',
    pendaftar_count: 16,
    user_registered: false,
    user_hadir: false,
  },
];

let MOCK_PENDAFTARAN: Record<string, PendaftaranEventItem[]> = {
  'evt-1': [
    {
      id: 'reg-1',
      event_id: 'evt-1',
      anggota_id: 'am-1',
      status: 'terdaftar',
      created_at: '2025-06-02T10:00:00Z',
      anggota_nama: 'Alya Putri Salsabila',
      anggota_nim: '2304521',
      anggota_nia: 'GW.32.235.GW',
      status_keanggotaan: 'anggota_biasa',
      hadir: false,
    },
    {
      id: 'reg-2',
      event_id: 'evt-1',
      anggota_id: 'am-2',
      status: 'terdaftar',
      created_at: '2025-06-02T11:15:00Z',
      anggota_nama: 'Aditya Pratama Ramadhan',
      anggota_nim: '2304522',
      anggota_nia: 'GW.32.236.GW',
      status_keanggotaan: 'anggota_biasa',
      hadir: false,
    },
    {
      id: 'reg-3',
      event_id: 'evt-1',
      anggota_id: 'am-3',
      status: 'terdaftar',
      created_at: '2025-06-03T09:20:00Z',
      anggota_nama: 'Farhan Dwi Cahyo',
      anggota_nim: '2304523',
      anggota_nia: 'GW.32.237.GW',
      status_keanggotaan: 'anggota_biasa',
      hadir: false,
    },
  ],
  'evt-4': [
    {
      id: 'reg-4',
      event_id: 'evt-4',
      anggota_id: 'am-1',
      status: 'terdaftar',
      created_at: '2025-05-10T10:00:00Z',
      anggota_nama: 'Alya Putri Salsabila',
      anggota_nim: '2304521',
      anggota_nia: 'GW.32.235.GW',
      status_keanggotaan: 'anggota_biasa',
      hadir: true,
    },
    {
      id: 'reg-5',
      event_id: 'evt-4',
      anggota_id: 'am-2',
      status: 'terdaftar',
      created_at: '2025-05-11T12:00:00Z',
      anggota_nama: 'Aditya Pratama Ramadhan',
      anggota_nim: '2304522',
      anggota_nia: 'GW.32.236.GW',
      status_keanggotaan: 'anggota_biasa',
      hadir: true,
    },
  ],
};

// Helper to get current anggota id
async function getCurrentAnggotaId(supabase: any): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: anggota } = await supabase
    .from('anggota')
    .select('id')
    .eq('auth_user_id', session.user.id)
    .single();

  return anggota?.id || null;
}

// ============================================================
// 1. GET EVENTS (PUBLIC / MEMBER / ADMIN)
// ============================================================
export async function getEvents(options?: {
  status?: string;
  isPublicOnly?: boolean;
}): Promise<EventItem[]> {
  try {
    const supabase = await createClient();
    const anggotaId = await getCurrentAnggotaId(supabase);

    let query = supabase.from('event').select('*, pendaftaran_event(id, anggota_id, status)');

    if (options?.isPublicOnly) {
      query = query.eq('is_public', true);
    }
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query.order('tanggal', { ascending: false });

    if (error || !data || data.length === 0) {
      // Return filtered mock
      let result = [...MOCK_EVENTS];
      if (options?.isPublicOnly) {
        result = result.filter((e) => e.is_public);
      }
      if (options?.status && options.status !== 'all') {
        result = result.filter((e) => e.status === options.status);
      }
      return result;
    }

    return data.map((item: any) => {
      const activeRegistrations = (item.pendaftaran_event || []).filter(
        (p: any) => p.status === 'terdaftar'
      );
      const isRegistered = anggotaId
        ? activeRegistrations.some((p: any) => p.anggota_id === anggotaId)
        : false;

      return {
        id: item.id,
        nama: item.nama,
        jenis: item.jenis || 'Kegiatan Umum',
        lokasi: item.lokasi || 'Sekretariat Gandawesi',
        tanggal: item.tanggal,
        tanggal_selesai: item.tanggal_selesai,
        kuota: item.kuota,
        deskripsi: item.deskripsi,
        is_public: item.is_public,
        status: item.status,
        created_at: item.created_at,
        pendaftar_count: activeRegistrations.length,
        user_registered: isRegistered,
      };
    });
  } catch {
    let result = [...MOCK_EVENTS];
    if (options?.isPublicOnly) {
      result = result.filter((e) => e.is_public);
    }
    if (options?.status && options.status !== 'all') {
      result = result.filter((e) => e.status === options.status);
    }
    return result;
  }
}

// ============================================================
// 2. GET EVENT BY ID
// ============================================================
export async function getEventById(id: string): Promise<EventItem | null> {
  try {
    const supabase = await createClient();
    const anggotaId = await getCurrentAnggotaId(supabase);

    const { data: event, error } = await supabase
      .from('event')
      .select('*, pendaftaran_event(id, anggota_id, status)')
      .eq('id', id)
      .single();

    if (error || !event) {
      const mock = MOCK_EVENTS.find((e) => e.id === id);
      return mock || null;
    }

    const activeRegistrations = (event.pendaftaran_event || []).filter(
      (p: any) => p.status === 'terdaftar'
    );
    const isRegistered = anggotaId
      ? activeRegistrations.some((p: any) => p.anggota_id === anggotaId)
      : false;

    // Check attendance if registered
    let userHadir = false;
    if (anggotaId && isRegistered) {
      const { data: presensi } = await supabase
        .from('presensi_event')
        .select('hadir')
        .eq('event_id', id)
        .eq('anggota_id', anggotaId)
        .single();
      userHadir = !!presensi?.hadir;
    }

    return {
      id: event.id,
      nama: event.nama,
      jenis: event.jenis || 'Kegiatan',
      lokasi: event.lokasi || 'Sekretariat Gandawesi',
      tanggal: event.tanggal,
      tanggal_selesai: event.tanggal_selesai,
      kuota: event.kuota,
      deskripsi: event.deskripsi,
      is_public: event.is_public,
      status: event.status,
      created_at: event.created_at,
      pendaftar_count: activeRegistrations.length,
      user_registered: isRegistered,
      user_hadir: userHadir,
    };
  } catch {
    return MOCK_EVENTS.find((e) => e.id === id) || null;
  }
}

// ============================================================
// 3. CREATE EVENT (ADMIN)
// ============================================================
export async function createEvent(
  payload: CreateEventPayload
): Promise<{ success: boolean; data?: EventItem; error?: string }> {
  try {
    const supabase = await createClient();

    const insertData = {
      nama: payload.nama.trim(),
      jenis: payload.jenis.trim(),
      lokasi: payload.lokasi.trim(),
      tanggal: payload.tanggal,
      tanggal_selesai: payload.tanggal_selesai || null,
      kuota: payload.kuota ? Number(payload.kuota) : null,
      deskripsi: payload.deskripsi?.trim() || null,
      is_public: payload.is_public ?? false,
      status: payload.status || 'upcoming',
    };

    const { data, error } = await supabase.from('event').insert(insertData).select().single();

    if (error) {
      console.warn('DB createEvent fallback:', error.message);
      const newMock: EventItem = {
        id: `evt-${Date.now()}`,
        ...insertData,
        created_at: new Date().toISOString(),
        pendaftar_count: 0,
        user_registered: false,
      };
      MOCK_EVENTS.unshift(newMock);
      revalidatePath('/dashboard/event');
      revalidatePath('/dashboard/admin/event');
      return { success: true, data: newMock };
    }

    revalidatePath('/dashboard/event');
    revalidatePath('/dashboard/admin/event');
    return {
      success: true,
      data: {
        ...data,
        pendaftar_count: 0,
        user_registered: false,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal membuat event' };
  }
}

// ============================================================
// 4. UPDATE EVENT (ADMIN)
// ============================================================
export async function updateEvent(
  payload: UpdateEventPayload
): Promise<{ success: boolean; data?: EventItem; error?: string }> {
  try {
    const supabase = await createClient();

    const updateData: any = {};
    if (payload.nama !== undefined) updateData.nama = payload.nama.trim();
    if (payload.jenis !== undefined) updateData.jenis = payload.jenis.trim();
    if (payload.lokasi !== undefined) updateData.lokasi = payload.lokasi.trim();
    if (payload.tanggal !== undefined) updateData.tanggal = payload.tanggal;
    if (payload.tanggal_selesai !== undefined) updateData.tanggal_selesai = payload.tanggal_selesai;
    if (payload.kuota !== undefined) updateData.kuota = payload.kuota ? Number(payload.kuota) : null;
    if (payload.deskripsi !== undefined) updateData.deskripsi = payload.deskripsi;
    if (payload.is_public !== undefined) updateData.is_public = payload.is_public;
    if (payload.status !== undefined) updateData.status = payload.status;

    const { data, error } = await supabase
      .from('event')
      .update(updateData)
      .eq('id', payload.id)
      .select()
      .single();

    if (error) {
      console.warn('DB updateEvent fallback:', error.message);
      const idx = MOCK_EVENTS.findIndex((e) => e.id === payload.id);
      if (idx !== -1) {
        MOCK_EVENTS[idx] = { ...MOCK_EVENTS[idx], ...updateData };
        revalidatePath('/dashboard/event');
        revalidatePath('/dashboard/admin/event');
        return { success: true, data: MOCK_EVENTS[idx] };
      }
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/event');
    revalidatePath('/dashboard/admin/event');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal memperbarui event' };
  }
}

// ============================================================
// 5. DELETE EVENT (ADMIN)
// ============================================================
export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('event').delete().eq('id', id);

    if (error) {
      console.warn('DB deleteEvent fallback:', error.message);
      MOCK_EVENTS = MOCK_EVENTS.filter((e) => e.id !== id);
      delete MOCK_PENDAFTARAN[id];
      revalidatePath('/dashboard/event');
      revalidatePath('/dashboard/admin/event');
      return { success: true };
    }

    revalidatePath('/dashboard/event');
    revalidatePath('/dashboard/admin/event');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus event' };
  }
}

// ============================================================
// 6. REGISTER FOR EVENT (MEMBER)
// ============================================================
export async function registerEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const anggotaId = await getCurrentAnggotaId(supabase);

    if (!anggotaId) {
      // Offline / Mock registration
      const targetEvent = MOCK_EVENTS.find((e) => e.id === eventId);
      if (!targetEvent) return { success: false, error: 'Event tidak ditemukan' };

      if (targetEvent.kuota && targetEvent.pendaftar_count >= targetEvent.kuota) {
        return { success: false, error: `Kuota event sudah penuh (maksimal ${targetEvent.kuota} peserta)` };
      }

      targetEvent.user_registered = true;
      targetEvent.pendaftar_count += 1;

      if (!MOCK_PENDAFTARAN[eventId]) MOCK_PENDAFTARAN[eventId] = [];
      MOCK_PENDAFTARAN[eventId].push({
        id: `reg-${Date.now()}`,
        event_id: eventId,
        anggota_id: 'am-curr',
        status: 'terdaftar',
        created_at: new Date().toISOString(),
        anggota_nama: 'Saya (Anggota Aktif)',
        anggota_nim: '2304525',
        anggota_nia: 'GW.32.239.GW',
        status_keanggotaan: 'anggota_biasa',
        hadir: false,
      });

      revalidatePath('/dashboard/event');
      revalidatePath('/dashboard/admin/event');
      return { success: true };
    }

    // Insert to DB (DB trigger trg_check_kuota_event will validate quota)
    const { error } = await supabase.from('pendaftaran_event').upsert(
      {
        anggota_id: anggotaId,
        event_id: eventId,
        status: 'terdaftar',
      },
      { onConflict: 'anggota_id,event_id' }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/event');
    revalidatePath('/dashboard/admin/event');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mendaftar event' };
  }
}

// ============================================================
// 7. CANCEL REGISTRATION (MEMBER)
// ============================================================
export async function cancelRegistration(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const anggotaId = await getCurrentAnggotaId(supabase);

    if (!anggotaId) {
      const targetEvent = MOCK_EVENTS.find((e) => e.id === eventId);
      if (targetEvent) {
        targetEvent.user_registered = false;
        targetEvent.pendaftar_count = Math.max(0, targetEvent.pendaftar_count - 1);
      }
      if (MOCK_PENDAFTARAN[eventId]) {
        MOCK_PENDAFTARAN[eventId] = MOCK_PENDAFTARAN[eventId].filter(
          (p) => p.anggota_id !== 'am-curr' && p.anggota_id !== 'am-1'
        );
      }
      revalidatePath('/dashboard/event');
      revalidatePath('/dashboard/admin/event');
      return { success: true };
    }

    const { error } = await supabase
      .from('pendaftaran_event')
      .update({ status: 'batal' })
      .eq('anggota_id', anggotaId)
      .eq('event_id', eventId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/event');
    revalidatePath('/dashboard/admin/event');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal membatalkan pendaftaran' };
  }
}

// ============================================================
// 8. GET PARTICIPANTS & ATTENDANCE (ADMIN)
// ============================================================
export async function getEventParticipants(
  eventId: string
): Promise<PendaftaranEventItem[]> {
  try {
    const supabase = await createClient();

    const { data: pendaftar, error } = await supabase
      .from('pendaftaran_event')
      .select(`
        id,
        event_id,
        anggota_id,
        status,
        created_at,
        anggota:anggota_id (
          id,
          nama,
          nim,
          nia,
          status_keanggotaan,
          foto_profil
        )
      `)
      .eq('event_id', eventId)
      .eq('status', 'terdaftar')
      .order('created_at', { ascending: true });

    if (error || !pendaftar || pendaftar.length === 0) {
      return MOCK_PENDAFTARAN[eventId] || [];
    }

    // Fetch attendance records for this event
    const { data: presensiList } = await supabase
      .from('presensi_event')
      .select('anggota_id, hadir')
      .eq('event_id', eventId);

    const presensiMap = new Map<string, boolean>();
    (presensiList || []).forEach((p: any) => presensiMap.set(p.anggota_id, p.hadir));

    return pendaftar.map((p: any) => {
      const a = p.anggota || {};
      return {
        id: p.id,
        event_id: p.event_id,
        anggota_id: p.anggota_id,
        status: p.status,
        created_at: p.created_at,
        anggota_nama: a.nama || 'Anggota',
        anggota_nim: a.nim || null,
        anggota_nia: a.nia || null,
        status_keanggotaan: a.status_keanggotaan || 'anggota',
        foto_profil: a.foto_profil || null,
        hadir: presensiMap.get(p.anggota_id) ?? false,
      };
    });
  } catch {
    return MOCK_PENDAFTARAN[eventId] || [];
  }
}

// ============================================================
// 9. UPDATE PRESENSI (ADMIN)
// ============================================================
export async function updatePresensi(
  eventId: string,
  anggotaId: string,
  hadir: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('presensi_event').upsert(
      {
        event_id: eventId,
        anggota_id: anggotaId,
        hadir: hadir,
      },
      { onConflict: 'event_id,anggota_id' }
    );

    if (error) {
      console.warn('DB updatePresensi fallback:', error.message);
      if (MOCK_PENDAFTARAN[eventId]) {
        const item = MOCK_PENDAFTARAN[eventId].find((p) => p.anggota_id === anggotaId);
        if (item) item.hadir = hadir;
      }
    }

    revalidatePath('/dashboard/event');
    revalidatePath('/dashboard/admin/event');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal mengubah status kehadiran' };
  }
}
