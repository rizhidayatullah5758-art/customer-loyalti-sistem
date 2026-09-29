import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, Text, TextInput, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { createStory } from '@/src/services/community';
import { Theme } from '@/src/theme';

export default function NewStoryScreen() {
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  async function choosePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.55,
      base64: true,
    });

    if (result.canceled) return;
    const asset = result.assets[0];

    if ((asset.fileSize ?? 0) > 3 * 1024 * 1024) {
      Alert.alert('Foto terlalu besar', 'Ukuran foto maksimal 3 MB.');
      return;
    }

    if (!asset.base64) {
      Alert.alert('Foto gagal diproses', 'Silakan pilih foto lain.');
      return;
    }

    const encodedBytes = Math.ceil((asset.base64.length * 3) / 4);
    if (encodedBytes > 3 * 1024 * 1024) {
      Alert.alert('Foto masih terlalu besar', 'Pilih foto lain dengan ukuran lebih kecil.');
      return;
    }

    setPhoto(asset);
  }

  async function publish() {
    if (!photo?.base64) return;

    setBusy(true);
    try {
      await createStory({
        base64: photo.base64,
        mimeType: photo.mimeType,
        caption,
      });

      Alert.alert(
        'Story diposting',
        'Story aktif selama 24 jam. Bonus +1 Reward Point hanya diberikan maksimal satu kali per hari.',
      );
      router.replace('/(tabs)');
    } catch (value) {
      Alert.alert(
        'Story belum berhasil',
        value instanceof Error ? value.message : 'Silakan coba kembali.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen scroll>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <BrandHeader eyebrow="COMMUNITY" title="Buat Story" />
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>Tutup</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={choosePhoto}
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: Theme.colors.border,
          backgroundColor: Theme.colors.surface,
          aspectRatio: 4 / 5,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {photo ? (
          <Image
            source={{ uri: photo.uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ alignItems: 'center', padding: 24 }}>
            <Text style={{ color: Theme.colors.accent, fontSize: 18, fontWeight: '900' }}>
              PILIH FOTO
            </Text>
            <Text
              style={{
                color: Theme.colors.textMuted,
                textAlign: 'center',
                lineHeight: 20,
                marginTop: 8,
              }}
            >
              Foto saja, tanpa video. Maksimal 3 MB.
            </Text>
          </View>
        )}
      </Pressable>

      <View
        style={{
          marginTop: 14,
          padding: 16,
          borderRadius: 18,
          backgroundColor: Theme.colors.surface,
          borderWidth: 1,
          borderColor: Theme.colors.border,
        }}
      >
        <Text style={{ color: Theme.colors.text, fontWeight: '900', marginBottom: 8 }}>
          Caption
        </Text>
        <TextInput
          value={caption}
          onChangeText={(value) => setCaption(value.slice(0, 100))}
          multiline
          maxLength={100}
          placeholder="Ceritakan singkat tentang motor atau treatment kamu…"
          placeholderTextColor={Theme.colors.textMuted}
          style={{
            minHeight: 90,
            color: Theme.colors.text,
            textAlignVertical: 'top',
            fontSize: 15,
          }}
        />
        <Text style={{ color: Theme.colors.textMuted, fontSize: 12, textAlign: 'right' }}>
          {caption.length}/100
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/community-guidelines')}
        style={{ paddingVertical: 14 }}
      >
        <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>
          Baca Community Guidelines
        </Text>
      </Pressable>

      <Text style={{ color: Theme.colors.textMuted, fontSize: 12, lineHeight: 19, marginBottom: 14 }}>
        Maksimal 3 Story per hari. Story otomatis kedaluwarsa setelah 24 jam.
      </Text>

      <PrimaryButton
        title="POST STORY"
        onPress={publish}
        loading={busy}
        disabled={!photo?.base64}
      />
    </Screen>
  );
}
