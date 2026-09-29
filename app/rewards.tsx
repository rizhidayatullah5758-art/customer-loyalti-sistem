import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import {
  getRewardsDashboard,
  pointReasonLabel,
  redeemReward,
} from '@/src/services/rewards';
import { Theme } from '@/src/theme';
import { formatDate, formatRupiah } from '@/src/utils/format';

type Dashboard = Awaited<ReturnType<typeof getRewardsDashboard>>;

function cardStyle() {
  return {
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 18,
    marginBottom: 12,
  } as const;
}

function memberRewardTitle(item: Dashboard['rewards'][number]) {
  return (
    item.reward_catalog?.title_id ??
    item.membership_benefit_templates?.title_id ??
    'Reward Member'
  );
}

export default function RewardsScreen() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await getRewardsDashboard());
    } catch {
      setError('Reward dan point belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const activeRewards = useMemo(
    () =>
      (data?.rewards ?? []).filter(
        (item) =>
          item.status === 'issued' &&
          (!item.expires_at || new Date(item.expires_at).getTime() > Date.now()),
      ),
    [data],
  );

  async function handleRedeem(id: string, title: string, cost: number) {
    Alert.alert(
      'Redeem reward?',
      `${title} membutuhkan ${cost} Reward Point. Reward berlaku 30 hari dan point tidak dapat dikembalikan setelah redeem.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            setBusyId(id);
            try {
              await redeemReward(id);
              Alert.alert('Berhasil', 'Reward sudah masuk ke Reward Aktif.');
              await load();
            } catch (value) {
              Alert.alert(
                'Belum berhasil',
                value instanceof Error ? value.message : 'Reward belum dapat diredeem.',
              );
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  }

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <BrandHeader eyebrow="LOYALTY" title="Reward & Point" />
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>Tutup</Text>
        </Pressable>
      </View>

      {loading && !data ? <ActivityIndicator color={Theme.colors.accent} /> : null}
      {error ? (
        <Pressable onPress={load}>
          <Text style={{ color: Theme.colors.danger, marginBottom: 14 }}>
            {error} Ketuk untuk mencoba lagi.
          </Text>
        </Pressable>
      ) : null}

      {data ? (
        <>
          <View style={cardStyle()}>
            <Text style={{ color: Theme.colors.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>
              REWARD POINT
            </Text>
            <Text style={{ color: Theme.colors.text, fontSize: 36, fontWeight: '900', marginTop: 7 }}>
              {data.balance?.reward_points ?? 0}
            </Text>
            <Text style={{ color: Theme.colors.textMuted, marginTop: 4 }}>
              {data.balance?.qualifying_points_12m ?? 0} qualifying point · rolling 12 bulan
            </Text>
            <Text style={{ color: Theme.colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 10 }}>
              Base point: setiap Rp10.000 pembayaran tunai/gateway = 1 point. Pembulatan ke bawah. Reward Point tidak kedaluwarsa.
            </Text>
          </View>

          <View style={cardStyle()}>
            <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900' }}>
              Birthday Wash
            </Text>
            {data.birthday ? (
              <>
                <Text
                  style={{
                    color: data.birthday.status === 'available' ? Theme.colors.success : Theme.colors.textMuted,
                    fontWeight: '900',
                    marginTop: 8,
                  }}
                >
                  {data.birthday.status.toUpperCase()}
                </Text>
                <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginTop: 6 }}>
                  1× Premium Signature Wash untuk semua kategori motor. Berlaku {formatDate(data.birthday.starts_on)} – {formatDate(data.birthday.expires_on)}.
                </Text>
              </>
            ) : (
              <Text style={{ color: Theme.colors.textMuted, marginTop: 8 }}>
                Birthday reward belum tersedia.
              </Text>
            )}
          </View>

          <View style={cardStyle()}>
            <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900' }}>
              Reward Aktif
            </Text>
            <Text style={{ color: Theme.colors.textMuted, lineHeight: 19, marginTop: 6, marginBottom: 8 }}>
              Reward hanya dapat digunakan satu per transaksi dan tidak dapat digabung dengan promo.
            </Text>

            {activeRewards.length === 0 ? (
              <Text style={{ color: Theme.colors.textMuted, marginTop: 8 }}>
                Belum ada reward aktif.
              </Text>
            ) : (
              activeRewards.map((item) => (
                <View
                  key={item.id}
                  style={{
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: Theme.colors.border,
                  }}
                >
                  <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>
                    {memberRewardTitle(item)}
                  </Text>
                  <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginTop: 5 }}>
                    {item.source === 'membership' ? 'Benefit membership' : 'Redeem point'}
                    {item.expires_at ? ` · sampai ${formatDate(item.expires_at)}` : ''}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={cardStyle()}>
            <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 }}>
              Katalog Reward
            </Text>

            {data.catalog.map((item) => {
              const affordable = (data.balance?.reward_points ?? 0) >= item.points_cost;
              return (
                <View
                  key={item.id}
                  style={{
                    paddingVertical: 13,
                    borderTopWidth: 1,
                    borderTopColor: Theme.colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>
                        {item.title_id}
                      </Text>
                      <Text style={{ color: Theme.colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                        {item.services?.name_id ?? (item.voucher_amount ? `Voucher ${formatRupiah(item.voucher_amount)}` : 'Reward Starpoint')}
                        {item.min_transaction > 0 ? ` · min. transaksi ${formatRupiah(item.min_transaction)}` : ''}
                      </Text>
                    </View>
                    <Text style={{ color: Theme.colors.accent, fontSize: 16, fontWeight: '900' }}>
                      {item.points_cost} pts
                    </Text>
                  </View>

                  <Pressable
                    disabled={!affordable || busyId !== null}
                    onPress={() => handleRedeem(item.id, item.title_id, item.points_cost)}
                    style={{ marginTop: 9, opacity: affordable ? 1 : 0.45 }}
                  >
                    <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>
                      {busyId === item.id ? 'MEMPROSES…' : affordable ? 'REDEEM' : 'POINT BELUM CUKUP'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={cardStyle()}>
            <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 }}>
              Riwayat Point
            </Text>
            {data.ledger.length === 0 ? (
              <Text style={{ color: Theme.colors.textMuted }}>Belum ada transaksi point.</Text>
            ) : (
              data.ledger.map((item) => (
                <View
                  key={item.id}
                  style={{
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: Theme.colors.border,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>
                      {pointReasonLabel(item.reason)}
                    </Text>
                    <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>
                      {item.description || formatDate(item.created_at)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: item.delta >= 0 ? Theme.colors.success : Theme.colors.danger,
                      fontWeight: '900',
                    }}
                  >
                    {item.delta > 0 ? '+' : ''}{item.delta}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
