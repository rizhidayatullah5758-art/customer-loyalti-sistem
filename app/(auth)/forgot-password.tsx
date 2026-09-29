import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { requestPasswordReset } from '@/src/services/auth';
import { Theme } from '@/src/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleReset() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setMessage('Link reset password sudah dikirim. Periksa inbox dan folder spam email Anda.');
    } catch {
      setError('Permintaan reset belum berhasil. Periksa email lalu coba kembali.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BrandHeader eyebrow="ACCOUNT RECOVERY" title="Lupa Password" />

      <View
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
        }}
      >
        <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginBottom: 16 }}>
          Masukkan email akun member. Kami akan mengirim link untuk membuat password baru.
        </Text>

        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="nama@email.com"
        />

        {message ? <Text style={{ color: Theme.colors.success, marginBottom: 14 }}>{message}</Text> : null}
        {error ? <Text style={{ color: Theme.colors.danger, marginBottom: 14 }}>{error}</Text> : null}

        <PrimaryButton title="KIRIM LINK RESET" onPress={handleReset} loading={loading} disabled={!email.trim()} />

        <Link href="/(auth)/login" style={{ color: Theme.colors.accent, fontWeight: '700', marginTop: 18 }}>
          Kembali ke Login
        </Link>
      </View>
    </Screen>
  );
}
