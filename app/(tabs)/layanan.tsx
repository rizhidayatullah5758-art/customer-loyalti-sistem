import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import { listServices } from '@/src/services/booking';
import { Theme } from '@/src/theme';
import { formatRupiah } from '@/src/utils/format';

type Service = Awaited<ReturnType<typeof listServices>>[number];

function priceSummary(service: Service) {
  const amounts = service.service_prices
    .filter((item) => item.active && item.amount != null)
    .map((item) => item.amount as number);

  if (amounts.length === 0) return 'Konsultasi';
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  if (min === max) return formatRupiah(min);
  return `Mulai ${formatRupiah(min)}`;
}

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setServices(await listServices());
    } catch {
      setError('Daftar layanan belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen scroll>
      <BrandHeader eyebrow="SERVICE" title="Layanan" />

      {loading ? <ActivityIndicator color={Theme.colors.accent} /> : null}
      {error ? (
        <Pressable onPress={load}>
          <Text style={{ color: Theme.colors.danger, marginBottom: 18 }}>{error} Ketuk untuk mencoba lagi.</Text>
        </Pressable>
      ) : null}

      {services.map((service) => (
        <Pressable
          key={service.id}
          onPress={() => router.push({ pathname: '/service/[id]', params: { id: service.id } })}
          style={({ pressed }) => ({
            backgroundColor: Theme.colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Theme.colors.border,
            padding: 18,
            marginBottom: 12,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: Theme.colors.text, fontSize: 17, fontWeight: '800' }}>{service.name_id}</Text>
          <Text style={{ color: Theme.colors.accent, marginTop: 7, fontWeight: '800' }}>
            {priceSummary(service)}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {service.duration_label ? (
              <Text style={{ color: Theme.colors.textMuted, fontSize: 12 }}>{service.duration_label}</Text>
            ) : null}
            {service.workshop_only ? (
              <Text style={{ color: Theme.colors.textMuted, fontSize: 12 }}>Workshop only</Text>
            ) : null}
            {service.home_service_whatsapp ? (
              <Text style={{ color: Theme.colors.textMuted, fontSize: 12 }}>Home Service via WhatsApp</Text>
            ) : null}
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}
