import * as ImagePicker from 'expo-image-picker';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { requestPasswordReset } from '@/src/services/auth';
import { getMemberDashboard } from '@/src/services/member';
import { uploadMemberAvatar } from '@/src/services/profile';
import { Theme } from '@/src/theme';

type Dashboard = Awaited<ReturnType<typeof getMemberDashboard>>;

export default function SettingsScreen() {
  const { session, loading: authLoading, signOut } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    getMemberDashboard().then(setData).catch(() => undefined);
  }, [session]);

  if (!authLoading && !session) return <Redirect href="/(auth)/login" />;

  async function changePhoto() {
    if (!session || !data) return;

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
      Alert.alert('Foto gagal diproses', 'Silakan pilih foto lain.');
      return;
    }

    if ((asset.fileSize ?? 0) > 3 * 1024 * 1024) {
      Alert.alert('Foto terlalu besar', 'Ukuran foto maksimal 3 MB.');
      return;
    }

    setBusy(true);
    try {
      await uploadMemberAvatar({
        userId: session.user.id,
        base64: asset.base64,
        mimeType: asset.mimeType,
        birthDate: data.profile.birth_date,
        fullName: data.profile.full_name,
      });
      setData(await getMemberDashboard());
      Alert.alert('Berhasil', 'Foto profil sudah diperbarui.');
    } catch {
      Alert.alert('Belum berhasil', 'Foto profil belum dapat diperbarui.');
    } finally {
      setBusy(false);
    }
  }

  async function sendResetLink() {
    if (!data?.authEmail) return;
    setBusy(true);
    try {
      await requestPasswordReset(data.authEmail);
      Alert.alert('Email dikirim', 'Link reset password telah dikirim ke email akun Anda.');
    } catch {
      Alert.alert('Belum berhasil', 'Link reset password belum dapat dikirim.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <BrandHeader eyebrow="ACCOUNT" title="Pengaturan" />
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>Tutup</Text>
        </Pressable>
      </View>

      <View
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: Theme.colors.text, fontSize: 17, fontWeight: '900' }}>Profil</Text>
        {data?.avatarUrl ? (
          <Image
            source={{ uri: data.avatarUrl }}
            style={{ width: 72, height: 72, borderRadius: 36, marginTop: 16, marginBottom: 12 }}
          />
        ) : null}
        <Text style={{ color: Theme.colors.textMuted, marginBottom: 14 }}>{data?.authEmail ?? 'Memuat akun…'}</Text>
        <PrimaryButton title="GANTI FOTO PROFIL" onPress={changePhoto} loading={busy} disabled={!data} />
      </View>

      <Pressable
        onPress={() => router.push('/rewards')}
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: Theme.colors.text, fontSize: 17, fontWeight: '900' }}>
          Voucher, Reward & Point
        </Text>
        <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginTop: 7 }}>
          Lihat voucher membership, birthday reward, katalog redeem dan riwayat point.
        </Text>
        <Text style={{ color: Theme.colors.accent, fontWeight: '900', marginTop: 12 }}>
          BUKA LOYALTY CENTER ›
        </Text>
      </Pressable>

      <View
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: Theme.colors.text, fontSize: 17, fontWeight: '900', marginBottom: 8 }}>Keamanan</Text>
        <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginBottom: 14 }}>
          Perubahan password dilakukan melalui link aman yang dikirim ke email akun.
        </Text>
        <PrimaryButton title="KIRIM LINK RESET PASSWORD" onPress={sendResetLink} loading={busy} disabled={!data} />
      </View>

      <Pressable
        onPress={handleLogout}
        style={{
          minHeight: 52,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Theme.colors.danger,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        <Text style={{ color: Theme.colors.danger, fontWeight: '900' }}>LOGOUT</Text>
      </Pressable>
    </Screen>
  );
}
