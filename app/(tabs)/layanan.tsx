import { Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { BrandHeader } from '@/src/components/BrandHeader';
import { Theme } from '@/src/theme';

const services = [
  ['Premium Signature Wash', 'Mulai Rp30.000'],
  ['Paint Correction & Gloss Booster', 'Mulai Rp125.000'],
  ['Deep Body & Engine Detailing', 'Mulai Rp350.000'],
  ['Nano Coating 10H', 'Mulai Rp1.000.000'],
];

export default function ServicesScreen() {
  return (
    <Screen scroll>
      <BrandHeader eyebrow="SERVICE" title="Layanan" />
      {services.map(([name, price]) => (
        <View
          key={name}
          style={{
            backgroundColor: Theme.colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            padding: 18,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: Theme.colors.text, fontSize: 17, fontWeight: '800' }}>{name}</Text>
          <Text style={{ color: Theme.colors.accent, marginTop: 7, fontWeight: '700' }}>{price}</Text>
        </View>
      ))}
    </Screen>
  );
}
