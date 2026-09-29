import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/src/services/notifications';
import { Theme } from '@/src/theme';
import { formatDate, formatTime } from '@/src/utils/format';

type NotificationItem = Awaited<ReturnType<typeof listNotifications>>[number];

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setItems(await listNotifications());
    } catch {
      setError('Notifikasi belum dapat dimuat.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function openItem(item: NotificationItem) {
    if (!item.read_at) {
      await markNotificationRead(item.id);
    }

    const payload =
      item.data && typeof item.data === 'object' && !Array.isArray(item.data)
        ? item.data
        : {};

    const bookingId =
      'booking_id' in payload && typeof payload.booking_id === 'string'
        ? payload.booking_id
        : null;

    if (bookingId) {
      router.push({ pathname: '/booking/[id]', params: { id: bookingId } });
      return;
    }

    await load();
  }

  async function markAll() {
    await markAllNotificationsRead();
    await load();
  }

  return (
    <Screen scroll>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <BrandHeader eyebrow="MEMBER UPDATE" title="Notifikasi" />
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>Tutup</Text>
        </Pressable>
      </View>

      {items.some((item) => !item.read_at) ? (
        <Pressable onPress={markAll} style={{ marginBottom: 14 }}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>
            TANDAI SEMUA SUDAH DIBACA
          </Text>
        </Pressable>
      ) : null}

      {error ? <Text style={{ color: Theme.colors.danger }}>{error}</Text> : null}

      {!error && items.length === 0 ? (
        <Text style={{ color: Theme.colors.textMuted }}>Belum ada notifikasi.</Text>
      ) : null}

      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => openItem(item)}
          style={{
            padding: 16,
            borderRadius: 18,
            backgroundColor: item.read_at ? Theme.colors.surface : Theme.colors.accentSoft,
            borderWidth: 1,
            borderColor: item.read_at ? Theme.colors.border : Theme.colors.accent,
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {!item.read_at ? (
              <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>●</Text>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>{item.title}</Text>
              <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginTop: 6 }}>
                {item.body}
              </Text>
              <Text style={{ color: Theme.colors.textMuted, fontSize: 11, marginTop: 8 }}>
                {formatDate(item.created_at)} · {formatTime(item.created_at)}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}
