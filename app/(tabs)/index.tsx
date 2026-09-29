import { Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { BrandHeader } from '@/src/components/BrandHeader';
import { Theme } from '@/src/theme';

export default function HomeScreen() {
  return (
    <Screen scroll>
      <BrandHeader eyebrow="STARPOINT GARAGE" title="Beranda" />

      <View style={{
        minHeight: 170,
        borderRadius: 22,
        padding: 20,
        justifyContent: 'flex-end',
        backgroundColor: Theme.colors.accentSoft,
        borderWidth: 1,
        borderColor: Theme.colors.border,
      }}>
        <Text style={{ color: Theme.colors.accent, fontWeight: '800', fontSize: 12, letterSpacing: 1.2 }}>
          MEMBER EXPERIENCE
        </Text>
        <Text style={{ color: Theme.colors.text, fontWeight: '800', fontSize: 24, marginTop: 8 }}>
          Rawat motor. Kumpulkan benefit.
        </Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 8, lineHeight: 20 }}>
          Area banner dinamis akan dikelola langsung dari Admin tanpa update aplikasi.
        </Text>
      </View>

      <Text style={{ color: Theme.colors.text, fontSize: 20, fontWeight: '800', marginTop: 28, marginBottom: 12 }}>
        Story Member
      </Text>

      <View style={{
        borderRadius: 20,
        padding: 18,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
      }}>
        <Text style={{ color: Theme.colors.text, fontWeight: '700' }}>Feed komunitas Starpoint</Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 8, lineHeight: 20 }}>
          Foto member, caption singkat, view count, like dan reaction akan masuk pada fase Community.
        </Text>
      </View>
    </Screen>
  );
}
