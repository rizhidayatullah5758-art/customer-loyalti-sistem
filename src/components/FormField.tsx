import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

import { Theme } from '@/src/theme';

type Props = TextInputProps & {
  label: string;
  hint?: string;
};

export function FormField({ label, hint, ...props }: Props) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: Theme.colors.text, fontWeight: '700', marginBottom: 8 }}>{label}</Text>
      <TextInput
        placeholderTextColor={Theme.colors.textMuted}
        {...props}
        style={[
          {
            minHeight: 52,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            backgroundColor: Theme.colors.surfaceElevated,
            color: Theme.colors.text,
            paddingHorizontal: 14,
            fontSize: 16,
          },
          props.style,
        ]}
      />
      {hint ? (
        <Text style={{ color: Theme.colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 6 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
