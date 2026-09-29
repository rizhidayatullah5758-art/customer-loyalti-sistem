import { Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { BrandHeader } from '@/src/components/BrandHeader';
import { Theme } from '@/src/theme';

export default function HistoryScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="ACTIVITY" title="Riwayat" />
      <View style={{
        backgroundColor: Theme.colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        padding: 18,
      }}>
        <Text style={{ color: Theme.colors.text, fontWeight: '800', fontSize: 17 }}>Check-in & Treatment</Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 8, lineHeight: 20 }}>
          Riwayat utama hanya akan menampilkan check-in dan treatment sesuai spesifikasi V1.
        </Text>
      </View>
    </Screen>
  );
}
