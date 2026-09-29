import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BrandHeader } from '@/src/components/BrandHeader';
import { FormField } from '@/src/components/FormField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import {
  createBooking,
  getAvailableSlots,
  getService,
  VEHICLE_CATEGORIES,
  type VehicleCategory,
} from '@/src/services/booking';
import { Theme } from '@/src/theme';
import { formatDate, formatRupiah, formatTime } from '@/src/utils/format';

type Service = Awaited<ReturnType<typeof getService>>;
type Slot = Awaited<ReturnType<typeof getAvailableSlots>>[number];

function getPrice(service: Service, category: VehicleCategory) {
  const categoryPrice = service.service_prices.find(
    (item) => item.active && item.vehicle_category === category,
  )?.amount;
  if (categoryPrice != null) return categoryPrice;

  const flatPrice = service.service_prices.find(
    (item) => item.active && item.vehicle_category == null,
  )?.amount;
  return flatPrice ?? 0;
}

export default function NewBookingScreen() {
  const params = useLocalSearchParams<{ serviceId: string }>();
  const serviceId = Array.isArray(params.serviceId) ? params.serviceId[0] : params.serviceId;

  const [service, setService] = useState<Service | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [vehicleType, setVehicleType] = useState('');
  const [category, setCategory] = useState<VehicleCategory>('small');
  const [notes, setNotes] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (!serviceId) return;
    setLoading(true);
    setError('');
    try {
      const [serviceData, slotData] = await Promise.all([
        getService(serviceId),
        getAvailableSlots(serviceId),
      ]);
      setService(serviceData);
      setSlots(slotData);
    } catch {
      setError('Jadwal booking belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [serviceId]);

  const quotedPrice = useMemo(
    () => (service ? getPrice(service, category) : 0),
    [service, category],
  );

  const deposit = useMemo(() => {
    if (!service?.requires_deposit) return 0;
    if (quotedPrice > 0) return Math.min(service.minimum_deposit, quotedPrice);
    return service.minimum_deposit;
  }, [service, quotedPrice]);

  async function submitBooking() {
    if (!service || !selectedSlot) return;
    setSaving(true);
    setError('');
    try {
      const created = await createBooking({
        serviceId: service.id,
        slotId: selectedSlot.id,
        vehicleType,
        vehicleCategory: category,
        notes,
      });

      router.replace({
        pathname: '/booking/[id]',
        params: { id: created.id },
      });
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Booking belum berhasil.');
      setConfirmStep(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Theme.colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Pressable
        onPress={() => (confirmStep ? setConfirmStep(false) : router.back())}
        style={{ marginBottom: 16 }}
      >
        <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>‹ Kembali</Text>
      </Pressable>

      <BrandHeader eyebrow="BOOKING" title={service?.name_id ?? 'Booking'} />

      {error ? (
        <Text style={{ color: Theme.colors.danger, lineHeight: 20, marginBottom: 16 }}>{error}</Text>
      ) : null}

      {!service ? (
        <Text style={{ color: Theme.colors.textMuted }}>Layanan tidak ditemukan.</Text>
      ) : confirmStep && selectedSlot ? (
        <>
          <View
            style={{
              padding: 18,
              borderRadius: 20,
              backgroundColor: Theme.colors.surface,
              borderWidth: 1,
              borderColor: Theme.colors.border,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 14 }}>
              Konfirmasi Booking
            </Text>

            <Text style={{ color: Theme.colors.textMuted, marginBottom: 6 }}>Layanan</Text>
            <Text style={{ color: Theme.colors.text, fontWeight: '800', marginBottom: 14 }}>
              {service.name_id}
            </Text>

            <Text style={{ color: Theme.colors.textMuted, marginBottom: 6 }}>Motor</Text>
            <Text style={{ color: Theme.colors.text, fontWeight: '800', marginBottom: 14 }}>
              {vehicleType} · {VEHICLE_CATEGORIES.find((item) => item.value === category)?.label}
            </Text>

            <Text style={{ color: Theme.colors.textMuted, marginBottom: 6 }}>Jadwal</Text>
            <Text style={{ color: Theme.colors.text, fontWeight: '800', marginBottom: 14 }}>
              {formatDate(selectedSlot.starts_at)} · {formatTime(selectedSlot.starts_at)}
            </Text>

            <Text style={{ color: Theme.colors.textMuted, marginBottom: 6 }}>Harga treatment</Text>
            <Text style={{ color: Theme.colors.text, fontWeight: '800', marginBottom: 14 }}>
              {quotedPrice > 0 ? formatRupiah(quotedPrice) : 'Konsultasi'}
            </Text>

            {service.requires_deposit ? (
              <View
                style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: Theme.colors.accentSoft,
                  marginTop: 4,
                }}
              >
                <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>
                  DP / pembayaran awal: {formatRupiah(deposit)}
                </Text>
                <Text style={{ color: Theme.colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
                  DP hanya ditampilkan pada tahap konfirmasi ini. DP bersifat non-refundable sesuai ketentuan Starpoint.
                </Text>
              </View>
            ) : (
              <Text style={{ color: Theme.colors.success, fontWeight: '800' }}>
                Premium Signature Wash tidak memerlukan DP.
              </Text>
            )}

            {selectedSlot.access_mode === 'priority' ? (
              <Text style={{ color: Theme.colors.accent, fontWeight: '800', marginTop: 14 }}>
                Priority Booking
              </Text>
            ) : null}
          </View>

          <PrimaryButton title="KONFIRMASI BOOKING" onPress={submitBooking} loading={saving} />
        </>
      ) : (
        <>
          <View
            style={{
              padding: 18,
              borderRadius: 20,
              backgroundColor: Theme.colors.surface,
              borderWidth: 1,
              borderColor: Theme.colors.border,
              marginBottom: 14,
            }}
          >
            <FormField
              label="Jenis motor"
              value={vehicleType}
              onChangeText={setVehicleType}
              placeholder="Contoh: Honda PCX 160"
              hint="Plat nomor tidak diperlukan."
            />

            <Text style={{ color: Theme.colors.text, fontWeight: '800', marginBottom: 10 }}>Kategori motor</Text>
            {VEHICLE_CATEGORIES.map((item) => {
              const active = category === item.value;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => setCategory(item.value)}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: active ? Theme.colors.accent : Theme.colors.border,
                    backgroundColor: active ? Theme.colors.accentSoft : Theme.colors.surfaceElevated,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: active ? Theme.colors.accent : Theme.colors.text, fontWeight: '800' }}>
                    {item.label}
                  </Text>
                  <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>{item.examples}</Text>
                </Pressable>
              );
            })}

            <FormField
              label="Catatan"
              value={notes}
              onChangeText={setNotes}
              placeholder="Opsional"
              multiline
              style={{ minHeight: 86, paddingTop: 14, textAlignVertical: 'top' }}
            />
          </View>

          <Text style={{ color: Theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 10 }}>
            Pilih Jadwal
          </Text>

          {slots.length === 0 ? (
            <View
              style={{
                padding: 18,
                borderRadius: 18,
                backgroundColor: Theme.colors.surface,
                borderWidth: 1,
                borderColor: Theme.colors.border,
                marginBottom: 14,
              }}
            >
              <Text style={{ color: Theme.colors.textMuted, lineHeight: 20 }}>
                Belum ada slot tersedia. Jadwal dibuka dan diatur oleh Admin Starpoint.
              </Text>
              <Pressable onPress={load} style={{ marginTop: 12 }}>
                <Text style={{ color: Theme.colors.accent, fontWeight: '800' }}>Refresh jadwal</Text>
              </Pressable>
            </View>
          ) : (
            slots.map((slot) => {
              const active = selectedSlot?.id === slot.id;
              return (
                <Pressable
                  key={slot.id}
                  onPress={() => setSelectedSlot(slot)}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: active ? Theme.colors.accentSoft : Theme.colors.surface,
                    borderWidth: 1,
                    borderColor: active ? Theme.colors.accent : Theme.colors.border,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>
                        {formatDate(slot.starts_at)}
                      </Text>
                      <Text style={{ color: Theme.colors.textMuted, marginTop: 4 }}>
                        {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: Theme.colors.textMuted, fontSize: 12 }}>
                        Sisa {slot.available_capacity}
                      </Text>
                      {slot.access_mode === 'priority' ? (
                        <Text style={{ color: Theme.colors.accent, fontSize: 11, fontWeight: '900', marginTop: 5 }}>
                          PRIORITY
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}

          <PrimaryButton
            title="LANJUT KE KONFIRMASI"
            onPress={() => setConfirmStep(true)}
            disabled={!vehicleType.trim() || !selectedSlot}
          />
        </>
      )}
    </Screen>
  );
}
