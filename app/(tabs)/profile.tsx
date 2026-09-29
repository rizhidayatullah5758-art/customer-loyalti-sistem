import { Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { BrandHeader } from '@/src/components/BrandHeader';
import { Theme } from '@/src/theme';

const items = ['Member ID', 'QR Member', 'Level', 'Benefit', 'Point', 'Referral'];

export default function ProfileScreen() {
  return (
    <Screen scroll>
      <BrandHeader eyebrow="MEMBERSHIP" title="Profile" />
      {items.map((item, index) => (
        <View
          key={item}
          style={{
            backgroundColor: index === 1 ? Theme.colors.accentSoft : Theme.colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            padding: 18,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: Theme.colors.text, fontWeight: '800', fontSize: 16 }}>{item}</Text>
        </View>
      ))}
    </Screen>
  );
}
