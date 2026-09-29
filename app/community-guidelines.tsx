import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import { Theme } from '@/src/theme';

const rules = [
  'Gunakan foto yang relevan dengan komunitas, motor, treatment, atau pengalaman Starpoint.',
  'Jangan unggah konten melecehkan, mengancam, diskriminatif, seksual eksplisit, ilegal, atau membahayakan.',
  'Jangan spam, menipu, menyamar sebagai orang lain, atau membagikan data pribadi orang tanpa izin.',
  'Unggah hanya foto yang Anda berhak gunakan.',
  'Gunakan fitur Laporkan atau Blokir bila menemukan konten/member yang mengganggu.',
  'Admin dapat menghapus Story dan menangguhkan akun bila diperlukan untuk keamanan komunitas.',
];

export default function CommunityGuidelinesScreen() {
  return (
    <Screen scroll>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <BrandHeader eyebrow="STARPOINT COMMUNITY" title="Community Guidelines" />
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>Tutup</Text>
        </Pressable>
      </View>

      <View
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
        }}
      >
        <Text style={{ color: Theme.colors.text, lineHeight: 21, marginBottom: 16 }}>
          Story Member adalah ruang komunitas Starpoint Garage. Semua Story berupa satu foto,
          caption maksimal 100 karakter, dan aktif selama 24 jam.
        </Text>

        {rules.map((rule, index) => (
          <View key={rule} style={{ flexDirection: 'row', gap: 10, marginBottom: 13 }}>
            <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>{index + 1}.</Text>
            <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, flex: 1 }}>{rule}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/blocked-members')}
        style={{
          marginTop: 14,
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Theme.colors.border,
          backgroundColor: Theme.colors.surface,
        }}
      >
        <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>Member Diblokir</Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 5 }}>
          Lihat dan buka blokir member.
        </Text>
      </Pressable>
    </Screen>
  );
}
