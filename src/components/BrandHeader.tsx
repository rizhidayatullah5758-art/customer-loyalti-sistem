import { Text, View } from 'react-native';
import { Theme } from '@/src/theme';

export function BrandHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: Theme.colors.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.6 }}>
        {eyebrow}
      </Text>
      <Text style={{ color: Theme.colors.text, fontSize: 30, fontWeight: '900', marginTop: 6 }}>
        {title}
      </Text>
    </View>
  );
}
