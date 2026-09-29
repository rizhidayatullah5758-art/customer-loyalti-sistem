import { ActivityIndicator, Pressable, Text } from 'react-native';

import { Theme } from '@/src/theme';

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDisabled ? Theme.colors.border : Theme.colors.accent,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={Theme.colors.background} />
      ) : (
        <Text style={{ color: Theme.colors.background, fontSize: 16, fontWeight: '900' }}>{title}</Text>
      )}
    </Pressable>
  );
}
