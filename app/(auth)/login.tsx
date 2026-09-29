import { Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { BrandHeader } from '@/src/components/BrandHeader';
import { Theme } from '@/src/theme';

export default function LoginScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="MEMBER ACCESS" title="Login" />
      <View style={{ padding: 18, borderRadius: 18, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }}>
        <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>Username + Password</Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 8 }}>
          Form aktif akan dihubungkan ke Supabase Auth pada fase Member Core.
        </Text>
      </View>
    </Screen>
  );
}
