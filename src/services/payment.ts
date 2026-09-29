import { decode } from 'base64-arraybuffer';

import { supabase } from '@/src/lib/supabase';
import type { Database, Json } from '@/src/types/database';

export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

export type PaymentConfig = {
  bankTransfer: {
    bank: string;
    accountNumber: string;
    accountName: string;
  };
  qris: {
    bank: string;
    displayName: string;
    merchantName: string;
    nmid: string;
    payload: string;
  };
};

function asObject(value: Json | null | undefined): Record<string, Json | undefined> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, Json | undefined>)
    : {};
}

function textValue(value: Json | undefined, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function normalizePaymentError(message: string) {
  const checks: Array<[string, string]> = [
    ['PAYMENT_ALREADY_WAITING_VERIFICATION', 'Masih ada pembayaran yang menunggu verifikasi.'],
    ['PAYMENT_BELOW_MINIMUM', 'Nominal pembayaran di bawah minimum yang diperbolehkan.'],
    ['PAYMENT_EXCEEDS_BALANCE', 'Nominal pembayaran melebihi sisa tagihan.'],
    ['BOOKING_ALREADY_PAID', 'Booking ini sudah lunas.'],
    ['BOOKING_NOT_PAYABLE', 'Booking ini sudah tidak dapat dibayar.'],
    ['INVALID_PROOF_PATH', 'Bukti pembayaran tidak valid.'],
    ['MANUAL_METHOD_REQUIRED', 'Metode pembayaran manual tidak valid.'],
  ];

  for (const [code, text] of checks) {
    if (message.includes(code)) return text;
  }
  return 'Pembayaran belum berhasil diproses.';
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key,value')
    .in('key', ['payment_bank_transfer', 'qris_manual']);

  if (error) throw error;

  const map = new Map((data ?? []).map((item) => [item.key, asObject(item.value)]));
  const bank = map.get('payment_bank_transfer') ?? {};
  const qris = map.get('qris_manual') ?? {};

  return {
    bankTransfer: {
      bank: textValue(bank.bank, 'BRI'),
      accountNumber: textValue(bank.account_number, '760101006310531'),
      accountName: textValue(bank.account_name, 'Noor Purnama Hidayatullah'),
    },
    qris: {
      bank: textValue(qris.bank, 'BRI'),
      displayName: textValue(qris.display_name, 'QRIS BRI Starpoint Garage'),
      merchantName: textValue(qris.merchant_name, 'STARPOINT GARAGE'),
      nmid: textValue(qris.nmid),
      payload: textValue(qris.payload),
    },
  };
}

export async function getBookingPaymentSummary(bookingId: string) {
  const { data, error } = await supabase.rpc('booking_payment_summary', {
    p_booking_id: bookingId,
  });

  if (error) throw new Error(normalizePaymentError(error.message));
  return data?.[0] ?? null;
}

export async function listBookingPayments(bookingId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(
      'id,payment_code,kind,method,status,amount,provider_fee,proof_path,notes,paid_at,verified_at,created_at,expires_at',
    )
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function uploadPaymentProof(input: {
  bookingId: string;
  base64: string;
  mimeType?: string | null;
}) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error('AUTH_REQUIRED');

  const extension =
    input.mimeType === 'image/png' ? 'png' : input.mimeType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${authData.user.id}/${input.bookingId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from('payment-proofs')
    .upload(path, decode(input.base64), {
      contentType: input.mimeType ?? 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;
  return path;
}

export async function submitManualPayment(input: {
  bookingId: string;
  method: Extract<PaymentMethod, 'qris_bri_manual' | 'bank_transfer_bri' | 'cash'>;
  amount: number;
  proofPath?: string | null;
  notes?: string | null;
}) {
  const { data, error } = await supabase.rpc('create_manual_payment', {
    p_booking_id: input.bookingId,
    p_method: input.method,
    p_amount: Math.trunc(input.amount),
    p_proof_path: input.proofPath ?? undefined,
    p_notes: input.notes ?? undefined,
  });

  if (error) throw new Error(normalizePaymentError(error.message));
  return data;
}

export function paymentMethodLabel(method: PaymentMethod) {
  const map: Record<PaymentMethod, string> = {
    duitku_qris: 'Metode nonaktif',
    duitku_va: 'Metode nonaktif',
    duitku_ewallet: 'Metode nonaktif',
    qris_bri_manual: 'QRIS BRI',
    bank_transfer_bri: 'Transfer BRI',
    cash: 'Cash',
    points: 'Reward / Point',
  };
  return map[method];
}

export function paymentStatusLabel(status: PaymentStatus) {
  const map: Record<PaymentStatus, string> = {
    pending: 'Pending',
    waiting_verification: 'Menunggu Verifikasi',
    paid: 'Paid',
    failed: 'Failed',
    expired: 'Expired',
    refunded: 'Refunded',
  };
  return map[status];
}
