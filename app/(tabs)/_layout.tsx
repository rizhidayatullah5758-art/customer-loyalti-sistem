import { Tabs } from 'expo-router';
import { Theme } from '@/src/theme';

export default function TabLayout() {
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
