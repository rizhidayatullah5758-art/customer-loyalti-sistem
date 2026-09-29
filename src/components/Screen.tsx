import type { PropsWithChildren } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/src/theme';

type Props = PropsWithChildren<{
  scroll?: boolean;
  style?: ViewStyle;
}>;

export function Screen({ children, scroll = false, style }: Props) {
  const content = (
    <View style={[{ flex: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 28 }, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : content}
    </SafeAreaView>
  );
}
