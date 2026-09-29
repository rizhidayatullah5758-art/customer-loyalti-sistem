import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/context/AuthContext';
import { Theme } from '@/src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Theme.colors.background },
            animation: 'fade',
          }}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
