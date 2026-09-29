import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { getService, VEHICLE_CATEGORIES } from '@/src/services/booking';
import { Theme } from '@/src/theme';
import { formatRupiah } from '@/src/utils/format';

type Service = Awaited<ReturnType<typeof getService>>;

function categoryName(value: string | null) {
  if (!value) return 'Semua kategori';
  return VEHICLE_CATEGORIES.find((item) => item.value === value)?.label ?? value;
}

export default function ServiceDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const serviceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!serviceId) return;

    setLoading(true);
    getService(serviceId)
      .then((data) => {
        setService(data);
        setError('');
      })
      .catch(() => setError('Detail layanan belum dapat dimuat.'))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const prices = useMemo(
    () =>
      (service?.service_prices ?? [])
        .filter((item) => item.active)
        .sort((a, b) => {
          const order = ['small', 'medium', 'large', 'big_bike', 'luxury'];
          return order.indexOf(a.vehicle_category ?? '') - order.indexOf(b.vehicle_category ?? '');
        }),
    [service],
  );

  async function openWhatsApp() {
    if (!service) return;
    const text = encodeURIComponent(
      `Halo Starpoint Garage, saya ingin konfirmasi Home Service untuk ${service.name_id}.`,
    );
    await Linking.openURL(`https://wa.me/6281345115758?text=${text}`);
  }

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
        <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>‹ Kembali</Text>
      </Pressable>

      {loading ? <ActivityIndicator color={Theme.colors.accent} /> : null}
      {error ? <Text style={{ color: Theme.colors.danger }}>{error}</Text> : null}

      {service ? (
        <>
          <BrandHeader eyebrow="SERVICE DETAIL" title={service.name_id} />

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
            {service.description_id ? (
              <Text style={{ color: Theme.colors.textMuted, lineHeight: 21, marginBottom: 12 }}>
                {service.description_id}
              </Text>
            ) : null}

            {service.duration_label ? (
              <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>
                Estimasi: {service.duration_label}
              </Text>
            ) : null}

            {service.workshop_only ? (
              <Text style={{ color: Theme.colors.textMuted, marginTop: 8 }}>Workshop only</Text>
            ) : null}

            {service.home_service_whatsapp ? (
              <Pressable onPress={openWhatsApp} style={{ marginTop: 14 }}>
                <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>
                  Konfirmasi Home Service via WhatsApp
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View
            style={{
              padding: 18,
              borderRadius: 20,
              backgroundColor: Theme.colors.surface,
              borderWidth: 1,
              borderColor: Theme.colors.border,
              marginBottom: 18,
            }}
          >
            <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 12 }}>
              Harga
            </Text>

            {prices.length === 0 ? (
              <Text style={{ color: Theme.colors.textMuted }}>Harga melalui konsultasi.</Text>
            ) : (
              prices.map((price) => (
                <View
                  key={price.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: 12,
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: Theme.colors.border,
                  }}
                >
                  <Text style={{ color: Theme.colors.textMuted }}>{categoryName(price.vehicle_category)}</Text>
                  <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>
                    {price.amount != null ? formatRupiah(price.amount) : price.price_label ?? 'Konsultasi'}
                  </Text>
                </View>
              ))
            )}
          </View>

          {service.booking_enabled ? (
            <PrimaryButton
              title="BOOKING SEKARANG"
              onPress={() =>
                router.push({
                  pathname: '/booking/new/[serviceId]',
                  params: { serviceId: service.id },
                })
              }
            />
          ) : (
            <View
              style={{
                padding: 16,
                borderRadius: 16,
                backgroundColor: Theme.colors.surface,
                borderWidth: 1,
                borderColor: Theme.colors.border,
              }}
            >
              <Text style={{ color: Theme.colors.textMuted }}>
                Booking online untuk layanan ini sedang tidak tersedia.
              </Text>
            </View>
          )}
        </>
      ) : null}
    </Screen>
  );
}
