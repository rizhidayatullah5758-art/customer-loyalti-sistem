import { Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { BrandHeader } from '@/src/components/BrandHeader';
import { Theme } from '@/src/theme';

export default function ForgotPasswordScreen() {
  return (
    <Screen>
      <BrandHeader eyebrow="ACCOUNT RECOVERY" title="Lupa Password" />
      <View style={{ padding: 18, borderRadius: 18, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }}>
        <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>Reset melalui email</Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 8 }}>
          Member akan menerima link reset password ke email terdaftar.
        </Text>
      </View>
    </Screen>
  );
}
