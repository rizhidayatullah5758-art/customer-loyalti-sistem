import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { BrandHeader } from '@/src/components/BrandHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getBooking } from '@/src/services/booking';
import {
  getBookingPaymentSummary,
  getPaymentConfig,
  listBookingPayments,
  paymentMethodLabel,
  paymentStatusLabel,
  submitManualPayment,
  uploadPaymentProof,
  type PaymentMethod,
} from '@/src/services/payment';
import {
  applyBirthdayRewardToBooking,
  applyRewardToBooking,
  getRewardsDashboard,
} from '@/src/services/rewards';
import { Theme } from '@/src/theme';
import { formatDate, formatRupiah, formatTime } from '@/src/utils/format';

type Booking = Awaited<ReturnType<typeof getBooking>>;
type Summary = Awaited<ReturnType<typeof getBookingPaymentSummary>>;
type Payments = Awaited<ReturnType<typeof listBookingPayments>>;
type Config = Awaited<ReturnType<typeof getPaymentConfig>>;
type Loyalty = Awaited<ReturnType<typeof getRewardsDashboard>>;
type ManualMethod = Extract<
  PaymentMethod,
  'qris_bri_manual' | 'bank_transfer_bri' | 'cash'
>;

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

function rewardTitle(item: Loyalty['rewards'][number]) {
  return (
    item.reward_catalog?.title_id ??
    item.membership_benefit_templates?.title_id ??
    'Reward Member'
  );
}

export default function PaymentScreen() {
  const params = useLocalSearchParams<{ bookingId: string }>();
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [payments, setPayments] = useState<Payments>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [method, setMethod] = useState<ManualMethod>('qris_bri_manual');
  const [amountText, setAmountText] = useState('');
  const [proof, setProof] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    setError('');
    try {
      const [bookingData, summaryData, paymentData, configData, loyaltyData] =
        await Promise.all([
          getBooking(bookingId),
          getBookingPaymentSummary(bookingId),
          listBookingPayments(bookingId),
          getPaymentConfig(),
          getRewardsDashboard(),
        ]);

      setBooking(bookingData);
      setSummary(summaryData);
      setPayments(paymentData);
      setConfig(configData);
      setLoyalty(loyaltyData);

      if (!amountText && summaryData) {
        const suggested =
          summaryData.minimum_payment_now > 0
            ? summaryData.minimum_payment_now
            : summaryData.remaining_balance;
        setAmountText(suggested > 0 ? String(suggested) : '');
      }
    } catch {
      setError('Data pembayaran belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, [bookingId, amountText]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const pendingManual = useMemo(
    () =>
      payments.find(
        (item) =>
          item.status === 'waiting_verification' &&
          item.kind !== 'reward' &&
          ['qris_bri_manual', 'bank_transfer_bri', 'cash'].includes(item.method),
      ),
    [payments],
  );

  const activeRewards = useMemo(() => {
    if (!booking) return [];

    return (loyalty?.rewards ?? []).filter((item) => {
      if (
        item.status !== 'issued' ||
        (item.expires_at && new Date(item.expires_at).getTime() <= Date.now())
      ) {
        return false;
      }

      const catalog = item.reward_catalog;
      const benefit = item.membership_benefit_templates;
      const serviceCode = booking.services?.code;

      if (catalog) {
        if (booking.quoted_total < catalog.min_transaction) return false;

        if (catalog.reward_type === 'service') {
          return (
            catalog.service_id === booking.service_id &&
            (!catalog.vehicle_category ||
              catalog.vehicle_category === booking.vehicle_category)
          );
        }

        if (catalog.reward_type === 'addon') {
          if (catalog.code === 'deep_addon_25k') {
            return ['addon_tar', 'addon_rust', 'addon_degreaser'].includes(
              serviceCode ?? '',
            );
          }
          return !catalog.service_id || catalog.service_id === booking.service_id;
        }

        if (catalog.reward_type === 'voucher' && catalog.code === 'voucher_30k') {
          return serviceCode === 'paint_correction';
        }

        return catalog.reward_type === 'voucher';
      }

      if (benefit) {
        if (booking.quoted_total < benefit.min_transaction) return false;
        if (benefit.benefit_type === 'addon' && benefit.code === 'allin_free') {
          return serviceCode === 'addon_allin';
        }
        return benefit.benefit_type === 'voucher';
      }

      return false;
    });
  }, [loyalty, booking]);

  async function chooseProof() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.75,
      base64: true,
    });

    if (result.canceled) return;
    const asset = result.assets[0];

    if ((asset.fileSize ?? 0) > 5 * 1024 * 1024) {
      Alert.alert('Bukti terlalu besar', 'Ukuran bukti pembayaran maksimal 5 MB.');
      return;
    }

    if (!asset.base64) {
      Alert.alert('Bukti gagal diproses', 'Silakan pilih gambar lain.');
      return;
    }

    setProof(asset);
  }

  async function submitPayment() {
    if (!booking || !summary) return;

    const amount = Number(amountText.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Nominal belum valid', 'Masukkan nominal pembayaran.');
      return;
    }

    if (amount < summary.minimum_payment_now) {
      Alert.alert(
        'Nominal terlalu kecil',
        `Minimum pembayaran saat ini ${formatRupiah(summary.minimum_payment_now)}.`,
      );
      return;
    }

    if (amount > summary.remaining_balance) {
      Alert.alert('Nominal terlalu besar', 'Nominal melebihi sisa tagihan.');
      return;
    }

    setBusy(true);
    try {
      let proofPath: string | undefined;

      if (proof?.base64) {
        proofPath = await uploadPaymentProof({
          bookingId: booking.id,
          base64: proof.base64,
          mimeType: proof.mimeType,
        });
      }

      await submitManualPayment({
        bookingId: booking.id,
        method,
        amount,
        proofPath,
        notes: proofPath ? 'Bukti pembayaran diunggah member.' : 'Member memilih Saya Sudah Bayar.',
      });

      setProof(null);
      Alert.alert(
        'Pembayaran dikirim',
        method === 'cash'
          ? 'Pembayaran cash menunggu konfirmasi staff.'
          : 'Pembayaran menunggu verifikasi staff Starpoint.',
      );
      await load();
    } catch (value) {
      Alert.alert(
        'Belum berhasil',
        value instanceof Error ? value.message : 'Pembayaran belum dapat diproses.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function useReward(rewardId: string) {
    if (!booking) return;

    setBusy(true);
    try {
      await applyRewardToBooking(rewardId, booking.id);
      Alert.alert('Reward diterapkan', 'Nilai reward sudah mengurangi tagihan booking.');
      await load();
    } catch (value) {
      Alert.alert(
        'Reward belum dapat digunakan',
        value instanceof Error ? value.message : 'Silakan pilih reward lain.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function useBirthdayReward() {
    if (!booking) return;

    setBusy(true);
    try {
      await applyBirthdayRewardToBooking(booking.id);
      Alert.alert('Birthday Wash diterapkan', 'Premium Signature Wash Anda menjadi gratis.');
      await load();
    } catch (value) {
      Alert.alert(
        'Birthday Wash belum dapat digunakan',
        value instanceof Error ? value.message : 'Silakan coba kembali.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading && !booking) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Theme.colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!booking || !summary || !config) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>‹ Kembali</Text>
        </Pressable>
        <Text style={{ color: Theme.colors.danger }}>
          {error || 'Pembayaran tidak ditemukan.'}
        </Text>
      </Screen>
    );
  }

  const fullyPaid = summary.fully_paid;
  const isPremiumWash = booking.services?.code === 'premium_wash';
  const birthday = loyalty?.birthday;
  const birthdayAvailable =
    isPremiumWash &&
    birthday?.status === 'available' &&
    new Date(`${birthday.starts_on}T00:00:00+07:00`).getTime() <= Date.now() &&
    new Date(`${birthday.expires_on}T23:59:59+07:00`).getTime() >= Date.now();

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
        <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>‹ Kembali</Text>
      </Pressable>

      <BrandHeader eyebrow={booking.booking_code} title="Pembayaran" />

      <View style={cardStyle()}>
        <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900' }}>
          {booking.services?.name_id ?? 'Treatment'}
        </Text>
        {booking.booking_slots ? (
          <Text style={{ color: Theme.colors.textMuted, marginTop: 6 }}>
            {formatDate(booking.booking_slots.starts_at)} · {formatTime(booking.booking_slots.starts_at)}
          </Text>
        ) : null}

        <View style={{ marginTop: 18, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: Theme.colors.textMuted }}>Total treatment</Text>
            <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>
              {formatRupiah(summary.quoted_total)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: Theme.colors.textMuted }}>Sudah dibayar / reward</Text>
            <Text style={{ color: Theme.colors.success, fontWeight: '800' }}>
              {formatRupiah(summary.paid_total)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: Theme.colors.border,
            }}
          >
            <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>Sisa tagihan</Text>
            <Text style={{ color: fullyPaid ? Theme.colors.success : Theme.colors.accent, fontWeight: '900' }}>
              {formatRupiah(summary.remaining_balance)}
            </Text>
          </View>
        </View>

        {!fullyPaid && summary.minimum_payment_now > 0 ? (
          <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginTop: 12 }}>
            Minimum pembayaran sekarang {formatRupiah(summary.minimum_payment_now)}.
          </Text>
        ) : null}
      </View>

      {fullyPaid ? (
        <View style={cardStyle()}>
          <Text style={{ color: Theme.colors.success, fontSize: 19, fontWeight: '900' }}>
            LUNAS
          </Text>
          <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginTop: 8 }}>
            Tidak ada sisa pembayaran untuk booking ini.
          </Text>
        </View>
      ) : null}

      {pendingManual ? (
        <View style={cardStyle()}>
          <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>
            Menunggu Verifikasi
          </Text>
          <Text style={{ color: Theme.colors.text, fontWeight: '800', marginTop: 8 }}>
            {pendingManual.payment_code} · {formatRupiah(pendingManual.amount)}
          </Text>
          <Text style={{ color: Theme.colors.textMuted, marginTop: 6 }}>
            {paymentMethodLabel(pendingManual.method)}
          </Text>
          <Text style={{ color: Theme.colors.textMuted, lineHeight: 19, marginTop: 8 }}>
            Staff Starpoint akan mengonfirmasi pembayaran ini. Pembayaran baru dapat dibuat setelah status ini selesai diverifikasi.
          </Text>
        </View>
      ) : null}

      {!fullyPaid && activeRewards.length > 0 ? (
        <View style={cardStyle()}>
          <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900' }}>
            Reward Aktif
          </Text>
          <Text style={{ color: Theme.colors.textMuted, lineHeight: 19, marginTop: 6, marginBottom: 12 }}>
            Maksimal satu reward per transaksi. Reward tidak dapat digabung dengan promo.
          </Text>

          {activeRewards.map((item) => (
            <View
              key={item.id}
              style={{
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: Theme.colors.border,
              }}
            >
              <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>
                {rewardTitle(item)}
              </Text>
              {item.expires_at ? (
                <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>
                  Berlaku sampai {formatDate(item.expires_at)}
                </Text>
              ) : null}
              <Pressable
                disabled={busy || !!pendingManual}
                onPress={() => useReward(item.id)}
                style={{ marginTop: 8 }}
              >
                <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>
                  GUNAKAN KE BOOKING INI
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {!fullyPaid && birthdayAvailable ? (
        <View style={cardStyle()}>
          <Text style={{ color: Theme.colors.accent, fontSize: 18, fontWeight: '900' }}>
            Birthday Premium Signature Wash
          </Text>
          <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginTop: 7 }}>
            Berlaku untuk semua kategori motor sampai {birthday ? formatDate(birthday.expires_on) : '-'}.
          </Text>
          <Pressable
            disabled={busy || !!pendingManual}
            onPress={useBirthdayReward}
            style={{ marginTop: 12 }}
          >
            <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>
              GUNAKAN BIRTHDAY WASH
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!fullyPaid && !pendingManual ? (
        <>
          <View style={cardStyle()}>
            <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 12 }}>
              Pilih Metode Manual
            </Text>

            {(
              [
                ['qris_bri_manual', 'QRIS BRI'],
                ['bank_transfer_bri', 'Transfer BRI'],
                ['cash', 'Cash di Outlet'],
              ] as Array<[ManualMethod, string]>
            ).map(([value, label]) => {
              const active = method === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => {
                    setMethod(value);
                    if (value === 'cash') setProof(null);
                  }}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: active ? Theme.colors.accent : Theme.colors.border,
                    backgroundColor: active ? Theme.colors.accentSoft : Theme.colors.surfaceElevated,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: active ? Theme.colors.accent : Theme.colors.text, fontWeight: '900' }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {method === 'qris_bri_manual' ? (
            <View style={[cardStyle(), { alignItems: 'center' }]}>
              <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900' }}>
                {config.qris.displayName}
              </Text>
              <Text style={{ color: Theme.colors.textMuted, marginTop: 5 }}>
                {config.qris.merchantName}
              </Text>
              {config.qris.payload ? (
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: 16,
                    borderRadius: 18,
                    marginTop: 16,
                  }}
                >
                  <QRCode
                    value={config.qris.payload}
                    size={220}
                    backgroundColor="#FFFFFF"
                    color="#090A0C"
                  />
                </View>
              ) : null}
              {config.qris.nmid ? (
                <Text style={{ color: Theme.colors.textMuted, fontSize: 11, marginTop: 10 }}>
                  NMID {config.qris.nmid}
                </Text>
              ) : null}
              <Text
                style={{
                  color: Theme.colors.textMuted,
                  textAlign: 'center',
                  lineHeight: 19,
                  marginTop: 12,
                }}
              >
                Ini QRIS BRI Starpoint yang sama dengan QRIS resmi outlet. Setelah transfer, unggah bukti atau pilih Saya Sudah Bayar.
              </Text>
            </View>
          ) : null}

          {method === 'bank_transfer_bri' ? (
            <View style={cardStyle()}>
              <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900' }}>
                Transfer {config.bankTransfer.bank}
              </Text>
              <Text style={{ color: Theme.colors.textMuted, marginTop: 12 }}>Nomor rekening</Text>
              <Text style={{ color: Theme.colors.accent, fontSize: 24, fontWeight: '900', marginTop: 5 }}>
                {config.bankTransfer.accountNumber}
              </Text>
              <Text style={{ color: Theme.colors.textMuted, marginTop: 8 }}>
                a.n. {config.bankTransfer.accountName}
              </Text>
            </View>
          ) : null}

          {method === 'cash' ? (
            <View style={cardStyle()}>
              <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900' }}>
                Cash di Outlet
              </Text>
              <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginTop: 8 }}>
                Bayar ke staff Starpoint. Status menjadi Paid setelah staff mengonfirmasi pembayaran.
              </Text>
            </View>
          ) : null}

          <View style={cardStyle()}>
            <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900' }}>
              Nominal Pembayaran
            </Text>
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="number-pad"
              placeholder="50000"
              placeholderTextColor={Theme.colors.textMuted}
              style={{
                minHeight: 54,
                marginTop: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: Theme.colors.border,
                backgroundColor: Theme.colors.surfaceElevated,
                color: Theme.colors.text,
                paddingHorizontal: 14,
                fontSize: 20,
                fontWeight: '800',
              }}
            />
            <Pressable onPress={() => setAmountText(String(summary.remaining_balance))} style={{ marginTop: 10 }}>
              <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>BAYAR LUNAS</Text>
            </Pressable>

            {method !== 'cash' ? (
              <>
                <Pressable
                  onPress={chooseProof}
                  style={{
                    minHeight: 50,
                    marginTop: 16,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: Theme.colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>
                    {proof ? 'GANTI BUKTI PEMBAYARAN' : 'UNGGAH BUKTI (OPSIONAL)'}
                  </Text>
                </Pressable>

                {proof ? (
                  <Image
                    source={{ uri: proof.uri }}
                    style={{ height: 180, borderRadius: 14, marginTop: 12 }}
                    resizeMode="contain"
                  />
                ) : null}
              </>
            ) : null}
          </View>

          <PrimaryButton
            title={proof || method === 'cash' ? 'KIRIM PEMBAYARAN' : 'SAYA SUDAH BAYAR'}
            onPress={submitPayment}
            loading={busy}
          />
        </>
      ) : null}

      <View style={cardStyle()}>
        <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 }}>
          Riwayat Pembayaran
        </Text>
        {payments.length === 0 ? (
          <Text style={{ color: Theme.colors.textMuted }}>Belum ada pembayaran.</Text>
        ) : (
          payments.map((item) => (
            <View
              key={item.id}
              style={{
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: Theme.colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>
                    {item.payment_code}
                  </Text>
                  <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>
                    {paymentMethodLabel(item.method)} · {formatDate(item.created_at)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>
                    {formatRupiah(item.amount)}
                  </Text>
                  <Text
                    style={{
                      color: item.status === 'paid' ? Theme.colors.success : Theme.colors.accent,
                      fontSize: 11,
                      fontWeight: '800',
                      marginTop: 4,
                    }}
                  >
                    {paymentStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}
