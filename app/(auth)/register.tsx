import { Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { BrandHeader } from '@/src/components/BrandHeader';
import { Theme } from '@/src/theme';

export default function RegisterScreen() {
  return (
    <Screen scroll>
      <BrandHeader eyebrow="NEW MEMBER" title="Daftar" />
      <View style={{ padding: 18, borderRadius: 18, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }}>
        <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>Nama · Username · Email · Password</Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 8, lineHeight: 20 }}>
          Foto profil dan tanggal lahir masuk ke profil member. Referral code bersifat opsional.
        </Text>
      </View>
    </Screen>
  );
}
