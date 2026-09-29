import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { cancelBooking, getBooking } from '@/src/services/booking';
import { Theme } from '@/src/theme';
import {
  bookingStatusLabel,
  formatDate,
  formatRupiah,
  formatTime,
  vehicleCategoryLabel,
} from '@/src/utils/format';

type Booking = Awaited<ReturnType<typeof getBooking>>;

export default function BookingDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    setError('');
    try {
      setBooking(await getBooking(bookingId));
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

  const service = booking.services;
  const slot = booking.booking_slots;
  const isPremium = service?.code === 'premium_wash';
  const canCancel = booking.status === 'awaiting_payment' || booking.status === 'confirmed';
  const canReschedule = isPremium
    ? ['confirmed', 'late', 'no_show'].includes(booking.status)
    : ['awaiting_payment', 'confirmed'].includes(booking.status) && booking.reschedule_count < 2;

  async function confirmCancel() {
    const currentBooking = booking;

    Alert.alert(
      'Batalkan booking?',
      currentBooking.deposit_required > 0
        ? 'Jika DP sudah dibayar, Rp50.000 atau nilai DP yang tercatat bersifat hangus sesuai ketentuan.'
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

      <BrandHeader eyebrow={booking.booking_code} title={service?.name_id ?? 'Booking'} />

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
          {bookingStatusLabel(booking.status)}
        </Text>

        {booking.used_priority_access ? (
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
          {booking.vehicle_type} · {vehicleCategoryLabel(booking.vehicle_category)}
        </Text>

        <Text style={{ color: Theme.colors.textMuted }}>Jadwal</Text>
        <Text style={{ color: Theme.colors.text, fontWeight: '800', marginTop: 4, marginBottom: 14 }}>
          {slot ? `${formatDate(slot.starts_at)} · ${formatTime(slot.starts_at)} – ${formatTime(slot.ends_at)}` : '-'}
        </Text>

        <Text style={{ color: Theme.colors.textMuted }}>Nilai treatment</Text>
        <Text style={{ color: Theme.colors.text, fontWeight: '800', marginTop: 4 }}>
          {booking.quoted_total > 0 ? formatRupiah(booking.quoted_total) : 'Konsultasi'}
        </Text>

        {booking.deposit_required > 0 ? (
          <>
            <Text style={{ color: Theme.colors.textMuted, marginTop: 14 }}>DP minimum</Text>
            <Text style={{ color: Theme.colors.text, fontWeight: '800', marginTop: 4 }}>
              {formatRupiah(booking.deposit_required)}
            </Text>
          </>
        ) : null}

        {booking.notes ? (
          <>
            <Text style={{ color: Theme.colors.textMuted, marginTop: 14 }}>Catatan</Text>
            <Text style={{ color: Theme.colors.text, marginTop: 4, lineHeight: 20 }}>{booking.notes}</Text>
          </>
        ) : null}
      </View>

      {booking.status === 'awaiting_payment' ? (
        <View
          style={{
            padding: 16,
            borderRadius: 16,
            backgroundColor: Theme.colors.accentSoft,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>Menunggu Pembayaran DP</Text>
          <Text style={{ color: Theme.colors.textMuted, lineHeight: 19, marginTop: 6 }}>
            Metode pembayaran otomatis dan manual akan aktif pada tahap Payment berikutnya.
          </Text>
        </View>
      ) : null}

      {booking.status === 'completed' ? (
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
            Selesai: {booking.completed_at ? `${formatDate(booking.completed_at)} · ${formatTime(booking.completed_at)}` : '-'}
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
                params: { id: booking.id },
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
