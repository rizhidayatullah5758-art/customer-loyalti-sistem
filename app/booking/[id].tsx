import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { cancelBooking, getBooking } from '@/src/services/booking';
import {
  getBookingPaymentSummary,
  listBookingPayments,
  paymentMethodLabel,
  paymentStatusLabel,
} from '@/src/services/payment';
import { Theme } from '@/src/theme';
import {
  bookingStatusLabel,
  formatDate,
  formatRupiah,
  formatTime,
  vehicleCategoryLabel,
} from '@/src/utils/format';

type Booking = Awaited<ReturnType<typeof getBooking>>;
type PaymentSummary = Awaited<ReturnType<typeof getBookingPaymentSummary>>;
type BookingPayments = Awaited<ReturnType<typeof listBookingPayments>>;

export default function BookingDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>(null);
  const [payments, setPayments] = useState<BookingPayments>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    setError('');
    try {
      const [bookingData, summaryData, paymentData] = await Promise.all([
        getBooking(bookingId),
        getBookingPaymentSummary(bookingId),
        listBookingPayments(bookingId),
      ]);
      setBooking(bookingData);
      setPaymentSummary(summaryData);
      setPayments(paymentData);
    } catch {
      setError('Detail booking belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading && !booking) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Theme.colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!booking) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>‹ Kembali</Text>
        </Pressable>
        <Text style={{ color: Theme.colors.danger }}>{error || 'Booking tidak ditemukan.'}</Text>
      </Screen>
    );
  }

  const currentBooking = booking;
  const service = currentBooking.services;
  const slot = currentBooking.booking_slots;
  const isPremium = service?.code === 'premium_wash';
  const canCancel =
    currentBooking.status === 'awaiting_payment' || currentBooking.status === 'confirmed';
  const canReschedule = isPremium
    ? ['confirmed', 'late', 'no_show'].includes(currentBooking.status)
    : ['awaiting_payment', 'confirmed'].includes(currentBooking.status) &&
      currentBooking.reschedule_count < 2;

  const waitingPayment = payments.find(
    (item) => item.status === 'waiting_verification' && item.kind !== 'reward',
  );

  const canPay =
    !!paymentSummary &&
    paymentSummary.remaining_balance > 0 &&
    !['cancelled', 'no_show'].includes(currentBooking.status);

  async function confirmCancel() {
    Alert.alert(
      'Batalkan booking?',
      currentBooking.deposit_required > 0
        ? 'Jika DP sudah dibayar, nilai DP yang tercatat bersifat hangus sesuai ketentuan.'
        : 'Booking akan dibatalkan.',
      [
        { text: 'Kembali', style: 'cancel' },
        {
          text: 'Batalkan Booking',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await cancelBooking(currentBooking.id);
              await load();
            } catch (value) {
              Alert.alert(
                'Belum berhasil',
                value instanceof Error ? value.message : 'Booking belum dapat dibatalkan.',
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  }

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
        <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>‹ Kembali</Text>
      </Pressable>

      <BrandHeader eyebrow={currentBooking.booking_code} title={service?.name_id ?? 'Booking'} />

      <View
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: Theme.colors.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>
          STATUS
        </Text>
        <Text style={{ color: Theme.colors.accent, fontSize: 22, fontWeight: '900', marginTop: 7 }}>
          {bookingStatusLabel(currentBooking.status)}
        </Text>

        {currentBooking.used_priority_access ? (
          <Text style={{ color: Theme.colors.accent, fontSize: 12, fontWeight: '800', marginTop: 8 }}>
            Priority Booking
          </Text>
        ) : null}
      </View>

      <View
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: Theme.colors.text, fontSize: 17, fontWeight: '900', marginBottom: 14 }}>
          Detail Treatment
        </Text>

        <Text style={{ color: Theme.colors.textMuted }}>Motor</Text>
        <Text style={{ color: Theme.colors.text, fontWeight: '800', marginTop: 4, marginBottom: 14 }}>
          {currentBooking.vehicle_type} · {vehicleCategoryLabel(currentBooking.vehicle_category)}
        </Text>

        <Text style={{ color: Theme.colors.textMuted }}>Jadwal</Text>
        <Text style={{ color: Theme.colors.text, fontWeight: '800', marginTop: 4, marginBottom: 14 }}>
          {slot
            ? `${formatDate(slot.starts_at)} · ${formatTime(slot.starts_at)} – ${formatTime(slot.ends_at)}`
            : '-'}
        </Text>

        <Text style={{ color: Theme.colors.textMuted }}>Nilai treatment</Text>
        <Text style={{ color: Theme.colors.text, fontWeight: '800', marginTop: 4 }}>
          {currentBooking.quoted_total > 0 ? formatRupiah(currentBooking.quoted_total) : 'Konsultasi'}
        </Text>

        {currentBooking.deposit_required > 0 ? (
          <>
            <Text style={{ color: Theme.colors.textMuted, marginTop: 14 }}>DP minimum</Text>
            <Text style={{ color: Theme.colors.text, fontWeight: '800', marginTop: 4 }}>
              {formatRupiah(currentBooking.deposit_required)}
            </Text>
          </>
        ) : null}

        {currentBooking.notes ? (
          <>
            <Text style={{ color: Theme.colors.textMuted, marginTop: 14 }}>Catatan</Text>
            <Text style={{ color: Theme.colors.text, marginTop: 4, lineHeight: 20 }}>
              {currentBooking.notes}
            </Text>
          </>
        ) : null}
      </View>

      {paymentSummary ? (
        <View
          style={{
            padding: 18,
            borderRadius: 20,
            backgroundColor: Theme.colors.surface,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: Theme.colors.text, fontSize: 17, fontWeight: '900', marginBottom: 13 }}>
            Pembayaran
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: Theme.colors.textMuted }}>Sudah dibayar / reward</Text>
            <Text style={{ color: Theme.colors.success, fontWeight: '800' }}>
              {formatRupiah(paymentSummary.paid_total)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>Sisa tagihan</Text>
            <Text
              style={{
                color: paymentSummary.fully_paid ? Theme.colors.success : Theme.colors.accent,
                fontWeight: '900',
              }}
            >
              {formatRupiah(paymentSummary.remaining_balance)}
            </Text>
          </View>

          {waitingPayment ? (
            <View
              style={{
                marginTop: 14,
                borderRadius: 14,
                padding: 13,
                backgroundColor: Theme.colors.accentSoft,
              }}
            >
              <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>
                {paymentStatusLabel(waitingPayment.status)}
              </Text>
              <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginTop: 5 }}>
                {waitingPayment.payment_code} · {paymentMethodLabel(waitingPayment.method)} ·{' '}
                {formatRupiah(waitingPayment.amount)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {canPay ? (
        <View style={{ marginBottom: 10 }}>
          <PrimaryButton
            title={waitingPayment ? 'LIHAT PEMBAYARAN' : 'BAYAR SEKARANG'}
            onPress={() =>
              router.push({
                pathname: '/payment/[bookingId]',
                params: { bookingId: currentBooking.id },
              })
            }
            disabled={busy}
          />
        </View>
      ) : null}

      {currentBooking.status === 'completed' ? (
        <View
          style={{
            padding: 16,
            borderRadius: 16,
            backgroundColor: Theme.colors.surface,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: Theme.colors.success, fontWeight: '900' }}>Treatment selesai</Text>
          <Text style={{ color: Theme.colors.textMuted, marginTop: 6 }}>
            Selesai:{' '}
            {currentBooking.completed_at
              ? `${formatDate(currentBooking.completed_at)} · ${formatTime(currentBooking.completed_at)}`
              : '-'}
          </Text>
        </View>
      ) : null}

      {canReschedule ? (
        <View style={{ marginBottom: 10 }}>
          <PrimaryButton
            title="RESCHEDULE"
            onPress={() =>
              router.push({
                pathname: '/booking/[id]/reschedule',
                params: { id: currentBooking.id },
              })
            }
            disabled={busy}
          />
        </View>
      ) : null}

      {canCancel ? (
        <Pressable
          onPress={confirmCancel}
          disabled={busy}
          style={{
            minHeight: 52,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Theme.colors.danger,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: busy ? 0.6 : 1,
          }}
        >
          <Text style={{ color: Theme.colors.danger, fontWeight: '900' }}>BATALKAN BOOKING</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}
