import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import { listBlockedMembers, unblockStoryMember } from '@/src/services/community';
import { Theme } from '@/src/theme';

type Blocked = Awaited<ReturnType<typeof listBlockedMembers>>[number];

export default function BlockedMembersScreen() {
  const [items, setItems] = useState<Blocked[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setItems(await listBlockedMembers());
    } catch {
      setError('Daftar blokir belum dapat dimuat.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function unblock(item: Blocked) {
    try {
      await unblockStoryMember(item.blocked_id);
      await load();
    } catch {
      Alert.alert('Belum berhasil', 'Member belum dapat dibuka blokirnya.');
    }
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
        <BrandHeader eyebrow="COMMUNITY" title="Member Diblokir" />
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>Tutup</Text>
        </Pressable>
      </View>

      {error ? <Text style={{ color: Theme.colors.danger }}>{error}</Text> : null}

      {!error && items.length === 0 ? (
        <Text style={{ color: Theme.colors.textMuted }}>Tidak ada member yang diblokir.</Text>
      ) : null}

      {items.map((item) => (
        <View
          key={item.blocked_id}
          style={{
            padding: 16,
            borderRadius: 18,
            backgroundColor: Theme.colors.surface,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>
              {item.member?.full_name ?? 'Member Starpoint'}
            </Text>
            <Text style={{ color: Theme.colors.textMuted, marginTop: 4 }}>
              @{item.member?.username ?? 'member'}
            </Text>
          </View>
          <Pressable onPress={() => unblock(item)}>
            <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>BUKA BLOKIR</Text>
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}
