import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/src/context/AuthContext';
import { Theme } from '@/src/theme';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background }}>
        <ActivityIndicator color={Theme.colors.accent} />
      </View>
    );
  }

  return <Redirect href={session ? '/(tabs)' : '/(auth)/login'} />;
}
