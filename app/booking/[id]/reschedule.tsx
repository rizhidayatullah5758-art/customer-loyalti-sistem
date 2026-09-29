import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import {
  getAvailableSlots,
  getBooking,
  rescheduleBooking,
} from '@/src/services/booking';
import { Theme } from '@/src/theme';
import { formatDate, formatTime } from '@/src/utils/format';

type Booking = Awaited<ReturnType<typeof getBooking>>;
type Slot = Awaited<ReturnType<typeof getAvailableSlots>>[number];

export default function RescheduleBookingScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) return;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const bookingData = await getBooking(bookingId);
        const slotData = await getAvailableSlots(bookingData.service_id);
        setBooking(bookingData);
        setSlots(slotData.filter((slot) => slot.id !== bookingData.slot_id));
      } catch {
        setError('Jadwal reschedule belum dapat dimuat.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [bookingId]);

  async function submit() {
    if (!booking || !selected) return;
    setSaving(true);
    setError('');
    try {
      await rescheduleBooking(booking.id, selected.id);
      router.replace({ pathname: '/booking/[id]', params: { id: booking.id } });
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Reschedule belum berhasil.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
        <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>‹ Kembali</Text>
      </Pressable>

      <BrandHeader eyebrow="RESCHEDULE" title={booking?.services?.name_id ?? 'Pilih Jadwal Baru'} />

      {loading ? <ActivityIndicator color={Theme.colors.accent} /> : null}
      {error ? <Text style={{ color: Theme.colors.danger, marginBottom: 14 }}>{error}</Text> : null}

      {booking ? (
        <View
          style={{
            padding: 16,
            borderRadius: 16,
            backgroundColor: Theme.colors.surface,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            marginBottom: 16,
          }}
        >
          {booking.services?.code === 'premium_wash' ? (
            <Text style={{ color: Theme.colors.textMuted, lineHeight: 20 }}>
              Premium Wash: jadwal baru maksimal 7 hari dari jadwal sebelumnya dan mengikuti slot yang tersedia.
            </Text>
          ) : (
            <Text style={{ color: Theme.colors.textMuted, lineHeight: 20 }}>
              Reschedule maksimal 2× dan harus dilakukan minimal 5 jam sebelum jadwal treatment.
            </Text>
          )}
          <Text style={{ color: Theme.colors.textMuted, marginTop: 8 }}>
            Reschedule terpakai: {booking.reschedule_count}
          </Text>
        </View>
      ) : null}

      {!loading && slots.length === 0 ? (
        <View
          style={{
            padding: 18,
            borderRadius: 18,
            backgroundColor: Theme.colors.surface,
            borderWidth: 1,
            borderColor: Theme.colors.border,
          }}
        >
          <Text style={{ color: Theme.colors.textMuted }}>Belum ada slot pengganti yang tersedia.</Text>
        </View>
      ) : null}

      {slots.map((slot) => {
        const active = selected?.id === slot.id;
        return (
          <Pressable
            key={slot.id}
            onPress={() => setSelected(slot)}
            style={{
              padding: 16,
              borderRadius: 16,
              backgroundColor: active ? Theme.colors.accentSoft : Theme.colors.surface,
              borderWidth: 1,
              borderColor: active ? Theme.colors.accent : Theme.colors.border,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <View>
                <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>{formatDate(slot.starts_at)}</Text>
                <Text style={{ color: Theme.colors.textMuted, marginTop: 4 }}>
                  {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: Theme.colors.textMuted, fontSize: 12 }}>
                  Sisa {slot.available_capacity}
                </Text>
                {slot.access_mode === 'priority' ? (
                  <Text style={{ color: Theme.colors.accent, fontSize: 11, fontWeight: '900', marginTop: 5 }}>
                    PRIORITY
                  </Text>
                ) : null}
              </View>
            </View>
          </Pressable>
        );
      })}

      <View style={{ marginTop: 10 }}>
        <PrimaryButton
          title="KONFIRMASI JADWAL BARU"
          onPress={submit}
          loading={saving}
          disabled={!selected}
        />
      </View>
    </Screen>
  );
}
