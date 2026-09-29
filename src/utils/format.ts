import type { BookingStatus, VehicleCategory } from '@/src/services/booking';

export function formatRupiah(value: number | null | undefined) {
  if (value == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatTime(value: string | null | undefined) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function bookingStatusLabel(status: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    awaiting_payment: 'Menunggu Pembayaran',
    confirmed: 'Confirmed',
    late: 'Late',
    no_show: 'No Show',
    in_treatment: 'In Treatment',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status];
}

export function vehicleCategoryLabel(category: VehicleCategory) {
  const map: Record<VehicleCategory, string> = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    big_bike: 'Big Bike',
    luxury: 'Luxury',
  };
  return map[category];
}
