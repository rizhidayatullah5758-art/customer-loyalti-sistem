import * as ImagePicker from 'expo-image-picker';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { supabase } from '@/src/lib/supabase';
import { registerMember } from '@/src/services/auth';
import { uploadMemberAvatar } from '@/src/services/profile';
import { Theme } from '@/src/theme';

type PickedPhoto = {
  uri: string;
  base64: string;
  mimeType?: string | null;
  fileSize?: number | null;
};

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function choosePhoto() {
    setError('');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) return;
    const asset = result.assets[0];

    if (!asset.base64) {
      setError('Foto tidak dapat diproses. Silakan pilih foto lain.');
      return;
    }

    if ((asset.fileSize ?? 0) > 3 * 1024 * 1024) {
      setError('Ukuran foto maksimal 3 MB.');
      return;
    }

    setPhoto({
      uri: asset.uri,
      base64: asset.base64,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
    });
  }

  async function handleRegister() {
    setError('');

    if (!photo) {
      setError('Foto profil wajib dipilih.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);
    try {
      await registerMember({
        fullName,
        username,
        email,
        password,
        birthDate,
        referralCode,
      });

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Akun berhasil dibuat, tetapi sesi belum siap.');

      try {
        await uploadMemberAvatar({
          userId: userData.user.id,
          base64: photo.base64,
          mimeType: photo.mimeType,
          birthDate,
          fullName,
        });
        router.replace('/(tabs)');
      } catch {
        Alert.alert(
          'Akun berhasil dibuat',
          'Foto profil belum berhasil disimpan. Anda dapat mengunggah ulang dari Pengaturan.',
        );
        router.replace('/settings');
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Pendaftaran gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <BrandHeader eyebrow="NEW MEMBER" title="Daftar Member" />

      <View
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
        }}
      >
        <Pressable
          onPress={choosePhoto}
          style={{
            alignSelf: 'center',
            width: 110,
            height: 110,
            borderRadius: 55,
            borderWidth: 1,
            borderColor: Theme.colors.accent,
            backgroundColor: Theme.colors.surfaceElevated,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          {photo ? (
            <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ color: Theme.colors.accent, textAlign: 'center', fontWeight: '800' }}>
              PILIH{'\\n'}FOTO
            </Text>
          )}
        </Pressable>

        <FormField label="Nama" value={fullName} onChangeText={setFullName} placeholder="Nama lengkap" />
        <FormField
          label="Username"
          value={username}
          onChangeText={(value) => setUsername(value.toLowerCase().replace(/s/g, ''))}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="username"
          hint="4–20 karakter. Huruf kecil, angka, titik, dan underscore."
        />
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="nama@email.com"
        />
        <FormField
          label="Tanggal lahir"
          value={birthDate}
          onChangeText={setBirthDate}
          keyboardType="numbers-and-punctuation"
          placeholder="YYYY-MM-DD"
          hint="Tanggal lahir dapat diubah sendiri maksimal 1 kali setelah pendaftaran."
        />
        <FormField
          label="Kode referral"
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
          placeholder="Opsional"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Minimal 8 karakter"
          hint="Wajib mengandung huruf dan angka."
        />
        <FormField
          label="Konfirmasi password"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
          placeholder="Ulangi password"
        />

        {error ? (
          <Text style={{ color: Theme.colors.danger, marginBottom: 14, lineHeight: 20 }}>{error}</Text>
        ) : null}

        <PrimaryButton
          title="BUAT AKUN"
          onPress={handleRegister}
          loading={loading}
          disabled={
            !fullName.trim() ||
            !username.trim() ||
            !email.trim() ||
            !birthDate.trim() ||
            !password ||
            !passwordConfirm ||
            !photo
          }
        />

        <Text style={{ color: Theme.colors.textMuted, marginTop: 18 }}>
          Sudah punya akun?{' '}
          <Link href="/(auth)/login" style={{ color: Theme.colors.text, fontWeight: '800' }}>
            Masuk
          </Link>
        </Text>
      </View>
    </Screen>
  );
}
