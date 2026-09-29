import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { loginWithUsername } from '@/src/services/auth';
import { Theme } from '@/src/theme';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      await loginWithUsername(username, password);
      router.replace('/(tabs)');
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <BrandHeader eyebrow="MEMBER ACCESS" title="Masuk" />

      <View
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
        }}
      >
        <FormField
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="contoh: rizkygarage"
          textContentType="username"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          textContentType="password"
        />

        {error ? (
          <Text style={{ color: Theme.colors.danger, marginBottom: 14, lineHeight: 20 }}>{error}</Text>
        ) : null}

        <PrimaryButton
          title="MASUK"
          onPress={handleLogin}
          loading={loading}
          disabled={!username.trim() || !password}
        />

        <View style={{ marginTop: 18, gap: 12 }}>
          <Link href="/(auth)/forgot-password" style={{ color: Theme.colors.accent, fontWeight: '700' }}>
            Lupa password?
          </Link>
          <Text style={{ color: Theme.colors.textMuted }}>
            Belum menjadi member?{' '}
            <Link href="/(auth)/register" style={{ color: Theme.colors.text, fontWeight: '800' }}>
              Daftar sekarang
            </Link>
          </Text>
        </View>
      </View>
    </Screen>
  );
}
