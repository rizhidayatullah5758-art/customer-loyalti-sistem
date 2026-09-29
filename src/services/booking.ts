import type { Database } from '@/src/types/database';
import { supabase } from '@/src/lib/supabase';

export type VehicleCategory = Database['public']['Enums']['vehicle_category'];
export type BookingStatus = Database['public']['Enums']['booking_status'];

export const VEHICLE_CATEGORIES: Array<{
  value: VehicleCategory;
  label: string;
  examples: string;
}> = [
  { value: 'small', label: 'Small', examples: 'Beat / Fazzio' },
  { value: 'medium', label: 'Medium', examples: 'NMAX / ADV / Filano / PCX' },
  { value: 'large', label: 'Large', examples: 'XMAX / Forza / Royal Enfield' },
  { value: 'big_bike', label: 'Big Bike', examples: 'Moge / 250cc+' },
  { value: 'luxury', label: 'Luxury', examples: 'Harley / H2' },
];

function normalizeError(message: string) {
  const checks: Array<[string, string]> = [
    ['PROFILE_INCOMPLETE', 'Lengkapi foto profil terlebih dahulu.'],
    ['MEMBER_NOT_ELIGIBLE', 'Akun member tidak dapat melakukan booking.'],
    ['SERVICE_NOT_BOOKABLE', 'Layanan ini sedang tidak dapat dibooking.'],
    ['SLOT_NOT_AVAILABLE', 'Slot sudah tidak tersedia. Pilih slot lain.'],
    ['SLOT_FULL', 'Slot sudah penuh. Pilih slot lain.'],
    ['PRIORITY_DAILY_LIMIT_REACHED', 'Batas booking priority harian sudah tercapai.'],
    ['PRIORITY_ACCESS_NOT_AVAILABLE', 'Priority booking belum tersedia untuk level Anda.'],
    ['RESCHEDULE_LIMIT_REACHED', 'Batas reschedule sudah tercapai.'],
    ['RESCHEDULE_TOO_LATE', 'Reschedule harus dilakukan minimal 5 jam sebelum jadwal.'],
    ['PREMIUM_RESCHEDULE_WINDOW_EXCEEDED', 'Jadwal baru Premium Wash maksimal 7 hari dari jadwal sebelumnya.'],
    ['BOOKING_CANNOT_RESCHEDULE', 'Booking ini sudah tidak dapat di-reschedule.'],
    ['BOOKING_CANNOT_CANCEL', 'Booking ini sudah tidak dapat dibatalkan.'],
    ['SAME_SLOT', 'Pilih jadwal yang berbeda.'],
  ];

  for (const [code, text] of checks) {
    if (message.includes(code)) return text;
  }
  return 'Terjadi kendala. Silakan coba kembali.';
}

export async function listServices() {
  const { data, error } = await supabase
    .from('services')
    .select(`
      id,
      code,
      name_id,
      name_en,
      description_id,
      booking_enabled,
      requires_deposit,
      minimum_deposit,
      duration_minutes,
      duration_label,
      capacity_default,
      consultation_only,
      home_service_whatsapp,
      workshop_only,
      active,
      sort_order,
      service_prices (
        id,
        vehicle_category,
        amount,
        price_label,
        active
      )
    `)
    .eq('active', true)
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}

export async function getService(serviceId: string) {
  const { data, error } = await supabase
    .from('services')
    .select(`
      id,
      code,
      name_id,
      name_en,
      description_id,
      booking_enabled,
      requires_deposit,
      minimum_deposit,
      duration_minutes,
      duration_label,
      capacity_default,
      consultation_only,
      home_service_whatsapp,
      workshop_only,
      active,
      sort_order,
      service_prices (
        id,
        vehicle_category,
        amount,
        price_label,
        active
      )
    `)
    .eq('id', serviceId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAvailableSlots(serviceId: string) {
  const { data, error } = await supabase.rpc('available_booking_slots', {
    p_service_id: serviceId,
  });

  if (error) throw new Error(normalizeError(error.message));
  return data ?? [];
}

export async function createBooking(input: {
  serviceId: string;
  slotId: string;
  vehicleType: string;
  vehicleCategory: VehicleCategory;
  notes?: string;
}) {
  const { data, error } = await supabase.rpc('create_member_booking', {
    p_service_id: input.serviceId,
    p_slot_id: input.slotId,
    p_vehicle_type: input.vehicleType.trim(),
    p_vehicle_category: input.vehicleCategory,
    p_notes: input.notes?.trim() || null,
  });

  if (error) throw new Error(normalizeError(error.message));
  return data;
}

export async function listMyBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_code,
      status,
      quoted_total,
      deposit_required,
      deposit_forfeited,
      reschedule_count,
      used_priority_access,
      vehicle_type,
      vehicle_category,
      notes,
      confirmed_at,
      treatment_started_at,
      completed_at,
      cancelled_at,
      no_show_at,
      created_at,
      services (
        id,
        code,
        name_id,
        duration_label,
        requires_deposit
      ),
      booking_slots (
        id,
        starts_at,
        ends_at,
        priority_only
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_code,
      status,
      quoted_total,
      deposit_required,
      deposit_forfeited,
      reschedule_count,
      used_priority_access,
      vehicle_type,
      vehicle_category,
      notes,
      confirmed_at,
      treatment_started_at,
      completed_at,
      cancelled_at,
      no_show_at,
      created_at,
      service_id,
      slot_id,
      services (
        id,
        code,
        name_id,
        duration_label,
        requires_deposit,
        minimum_deposit
      ),
      booking_slots (
        id,
        starts_at,
        ends_at,
        priority_only
      )
    `)
    .eq('id', bookingId)
    .single();

  if (error) throw error;
  return data;
}

export async function rescheduleBooking(bookingId: string, newSlotId: string) {
  const { data, error } = await supabase.rpc('reschedule_member_booking', {
    p_booking_id: bookingId,
    p_new_slot_id: newSlotId,
  });

  if (error) throw new Error(normalizeError(error.message));
  return data;
}

export async function cancelBooking(bookingId: string) {
  const { data, error } = await supabase.rpc('cancel_member_booking', {
    p_booking_id: bookingId,
  });

  if (error) throw new Error(normalizeError(error.message));
  return data;
}

export async function listMyCheckins() {
  const { data, error } = await supabase
    .from('checkins')
    .select('id,booking_id,created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
