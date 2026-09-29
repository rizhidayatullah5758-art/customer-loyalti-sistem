import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import { getMemberDashboard } from '@/src/services/member';
import { Theme } from '@/src/theme';

type Dashboard = Awaited<ReturnType<typeof getMemberDashboard>>;

function cardStyle(accent = false) {
  return {
    backgroundColor: accent ? Theme.colors.accentSoft : Theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 18,
    marginBottom: 12,
  } as const;
}

export default function ProfileScreen() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      setData(await getMemberDashboard());
    } catch {
      setError('Data profile belum dapat dimuat.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (!data && !error) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Theme.colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        <BrandHeader eyebrow="MEMBERSHIP" title="Profile" />
        <Text style={{ color: Theme.colors.danger }}>{error}</Text>
        <Pressable onPress={load} style={{ marginTop: 16 }}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>Coba lagi</Text>
        </Pressable>
      </Screen>
    );
  }

  const { profile, summary, benefits, avatarUrl } = data;
  const level = (summary.level ?? 'classic').toUpperCase();

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <BrandHeader eyebrow="MEMBERSHIP" title="Profile" />
        <Pressable
          onPress={() => router.push('/settings')}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Theme.colors.surface,
            borderWidth: 1,
            borderColor: Theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </Pressable>
      </View>

      <View style={[cardStyle(), { alignItems: 'center' }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 86, height: 86, borderRadius: 43, marginBottom: 12 }} />
        ) : (
          <View
            style={{
              width: 86,
              height: 86,
              borderRadius: 43,
              backgroundColor: Theme.colors.surfaceElevated,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: Theme.colors.accent, fontSize: 26, fontWeight: '900' }}>
              {profile.full_name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={{ color: Theme.colors.text, fontSize: 22, fontWeight: '900' }}>{profile.full_name}</Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 4 }}>@{profile.username}</Text>
        <View
          style={{
            marginTop: 12,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: profile.status === 'active' ? '#123122' : Theme.colors.accentSoft,
          }}
        >
          <Text
            style={{
              color: profile.status === 'active' ? Theme.colors.success : Theme.colors.accent,
              fontSize: 12,
              fontWeight: '800',
            }}
          >
            {profile.status === 'active' ? 'MEMBER AKTIF' : 'AKTIVASI DI OUTLET'}
          </Text>
        </View>
      </View>

      <View style={cardStyle()}>
        <Text style={{ color: Theme.colors.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>MEMBER ID</Text>
        <Text style={{ color: Theme.colors.text, fontSize: 26, fontWeight: '900', marginTop: 8 }}>
          {profile.member_code}
        </Text>
      </View>

      <View style={[cardStyle(true), { alignItems: 'center' }]}>
        <Text style={{ color: Theme.colors.text, fontSize: 17, fontWeight: '900', marginBottom: 16 }}>QR Member</Text>
        <View style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 18 }}>
          <QRCode value={`SPG:${profile.member_code}`} size={190} backgroundColor="#FFFFFF" color="#090A0C" />
        </View>
        <Text style={{ color: Theme.colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 14 }}>
          QR ini statis. Staff akan mencocokkan nama dan foto profil saat check-in.
        </Text>
      </View>

      <View style={cardStyle()}>
        <Text style={{ color: Theme.colors.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>LEVEL</Text>
        <Text style={{ color: Theme.colors.accent, fontSize: 28, fontWeight: '900', marginTop: 8 }}>{level}</Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 6 }}>
          {summary.qualifying_points_12m ?? 0} qualifying point dalam 12 bulan terakhir
        </Text>
      </View>

      <View style={cardStyle()}>
        <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 12 }}>Benefit</Text>
        {benefits.map((benefit) => (
          <View key={benefit.id} style={{ flexDirection: 'row', gap: 10, marginBottom: 9 }}>
            <Text style={{ color: Theme.colors.accent }}>•</Text>
            <Text style={{ color: Theme.colors.textMuted, flex: 1, lineHeight: 20 }}>{benefit.title_id}</Text>
          </View>
        ))}
      </View>

      <View style={cardStyle()}>
        <Text style={{ color: Theme.colors.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>POINT</Text>
        <Text style={{ color: Theme.colors.text, fontSize: 32, fontWeight: '900', marginTop: 8 }}>
          {summary.reward_points ?? 0}
        </Text>
        <Text style={{ color: Theme.colors.textMuted }}>Reward Point</Text>
      </View>

      <View style={cardStyle()}>
        <Text style={{ color: Theme.colors.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>REFERRAL</Text>
        <Text style={{ color: Theme.colors.text, fontSize: 24, fontWeight: '900', marginTop: 8 }}>
          {profile.referral_code}
        </Text>
        <Text style={{ color: Theme.colors.textMuted, marginTop: 6 }}>Bagikan kode ini ke calon member baru.</Text>
      </View>
    </Screen>
  );
}
