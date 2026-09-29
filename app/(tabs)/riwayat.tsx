import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import { listMyBookings, listMyCheckins } from '@/src/services/booking';
import { Theme } from '@/src/theme';
import { bookingStatusLabel, formatDate, formatTime } from '@/src/utils/format';

type Booking = Awaited<ReturnType<typeof listMyBookings>>[number];
type Checkin = Awaited<ReturnType<typeof listMyCheckins>>[number];

export default function HistoryScreen() {
  const [mode, setMode] = useState<'treatment' | 'checkin'>('treatment');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingData, checkinData] = await Promise.all([listMyBookings(), listMyCheckins()]);
      setBookings(bookingData);
      setCheckins(checkinData);
    } catch {
      setError('Riwayat belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen scroll>
      <BrandHeader eyebrow="ACTIVITY" title="Riwayat" />

      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          padding: 5,
          borderRadius: 16,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
          marginBottom: 18,
        }}
      >
        <Pressable
          onPress={() => setMode('treatment')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
            backgroundColor: mode === 'treatment' ? Theme.colors.accentSoft : 'transparent',
          }}
        >
          <Text
            style={{
              color: mode === 'treatment' ? Theme.colors.accent : Theme.colors.textMuted,
              fontWeight: '900',
            }}
          >
            TREATMENT
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode('checkin')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
            backgroundColor: mode === 'checkin' ? Theme.colors.accentSoft : 'transparent',
          }}
        >
          <Text
            style={{
              color: mode === 'checkin' ? Theme.colors.accent : Theme.colors.textMuted,
              fontWeight: '900',
            }}
          >
            CHECK-IN
          </Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator color={Theme.colors.accent} /> : null}
      {error ? (
        <Pressable onPress={load}>
          <Text style={{ color: Theme.colors.danger, marginBottom: 14 }}>{error} Ketuk untuk mencoba lagi.</Text>
        </Pressable>
      ) : null}

      {!loading && mode === 'treatment' && bookings.length === 0 ? (
        <Text style={{ color: Theme.colors.textMuted }}>Belum ada riwayat treatment.</Text>
      ) : null}

      {mode === 'treatment'
        ? bookings.map((booking) => (
            <Pressable
              key={booking.id}
              onPress={() =>
                router.push({
                  pathname: '/booking/[id]',
                  params: { id: booking.id },
                })
              }
              style={{
                padding: 18,
                borderRadius: 18,
                backgroundColor: Theme.colors.surface,
                borderWidth: 1,
                borderColor: Theme.colors.border,
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Theme.colors.text, fontSize: 16, fontWeight: '900' }}>
                    {booking.services?.name_id ?? 'Treatment'}
                  </Text>
                  <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginTop: 5 }}>
                    {booking.booking_code}
                  </Text>
                </View>
                <Text style={{ color: Theme.colors.accent, fontSize: 12, fontWeight: '900' }}>
                  {bookingStatusLabel(booking.status)}
                </Text>
              </View>

              {booking.booking_slots ? (
                <Text style={{ color: Theme.colors.textMuted, marginTop: 12 }}>
                  {formatDate(booking.booking_slots.starts_at)} · {formatTime(booking.booking_slots.starts_at)}
                </Text>
              ) : null}
              <Text style={{ color: Theme.colors.textMuted, marginTop: 5 }}>{booking.vehicle_type}</Text>
            </Pressable>
          ))
        : null}

      {!loading && mode === 'checkin' && checkins.length === 0 ? (
        <Text style={{ color: Theme.colors.textMuted }}>Belum ada riwayat check-in.</Text>
      ) : null}

      {mode === 'checkin'
        ? checkins.map((checkin) => (
            <View
              key={checkin.id}
              style={{
                padding: 18,
                borderRadius: 18,
                backgroundColor: Theme.colors.surface,
                borderWidth: 1,
                borderColor: Theme.colors.border,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>Check-in Starpoint Garage</Text>
              <Text style={{ color: Theme.colors.textMuted, marginTop: 7 }}>
                {formatDate(checkin.created_at)} · {formatTime(checkin.created_at)}
              </Text>
            </View>
          ))
        : null}
    </Screen>
  );
}
