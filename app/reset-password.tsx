import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { supabase } from '@/src/lib/supabase';
import { establishRecoverySession } from '@/src/services/auth';
import { Theme } from '@/src/theme';

export default function ResetPasswordScreen() {
  const url = Linking.useURL();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!url) return;

    establishRecoverySession(url)
      .then(() => {
        setReady(true);
        setError('');
      })
      .catch((value) => {
        setReady(false);
        setError(value instanceof Error ? value.message : 'Link reset tidak valid.');
      });
  }, [url]);

  async function updatePassword() {
    setError('');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Password minimal 8 karakter dan harus mengandung huruf serta angka.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError('Password belum berhasil diperbarui.');
      return;
    }

    await supabase.auth.signOut();
    Alert.alert('Password berhasil diubah', 'Silakan login menggunakan password baru.');
    router.replace('/(auth)/login');
  }

  return (
    <Screen>
      <BrandHeader eyebrow="ACCOUNT RECOVERY" title="Password Baru" />
      <View
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
        }}
      >
        {!ready ? (
          <Text style={{ color: error ? Theme.colors.danger : Theme.colors.textMuted, lineHeight: 20 }}>
            {error || 'Buka halaman ini melalui link reset password yang dikirim ke email Anda.'}
          </Text>
        ) : (
          <>
            <FormField
              label="Password baru"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Minimal 8 karakter"
            />
            <FormField
              label="Konfirmasi password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="Ulangi password"
            />
            {error ? <Text style={{ color: Theme.colors.danger, marginBottom: 14 }}>{error}</Text> : null}
            <PrimaryButton title="SIMPAN PASSWORD" onPress={updatePassword} loading={loading} />
          </>
        )}
      </View>
    </Screen>
  );
}
