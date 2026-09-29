import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/src/context/AuthContext';
import { Theme } from '@/src/theme';

export default function TabLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background }}>
        <ActivityIndicator color={Theme.colors.accent} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.accent,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: Theme.colors.border,
          height: 66,
          paddingTop: 7,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.4,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'BERANDA' }} />
      <Tabs.Screen name="layanan" options={{ title: 'LAYANAN' }} />
      <Tabs.Screen name="riwayat" options={{ title: 'RIWAYAT' }} />
      <Tabs.Screen name="profile" options={{ title: 'PROFILE' }} />
    </Tabs>
  );
}
