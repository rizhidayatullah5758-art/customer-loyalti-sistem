import { router, useFocusEffect } from 'expo-router';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';

import { BrandHeader } from '@/src/components/BrandHeader';
import { Screen } from '@/src/components/Screen';
import {
  blockStoryMember,
  deleteStory,
  reportStory,
  setStoryReaction,
} from '@/src/services/community';
import { getHomeDashboard, recordStoryViews } from '@/src/services/home';
import { Theme } from '@/src/theme';
import { formatDate, formatTime } from '@/src/utils/format';

type HomeData = Awaited<ReturnType<typeof getHomeDashboard>>;
type Story = HomeData['stories'][number];
type Banner = HomeData['banners'][number];

function cardStyle() {
  return {
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  } as const;
}

function reactionLabel(
  reaction: 'heart' | 'fire' | 'like',
  count: number,
  active: boolean,
) {
  const icon = reaction === 'heart' ? '❤️' : reaction === 'fire' ? '🔥' : '👍';
  return `${icon} ${count}${active ? ' •' : ''}`;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const bannerWidth = Math.max(280, width - 36);
  const bannerRef = useRef<FlatList<Banner>>(null);

  const [data, setData] = useState<HomeData | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    if (!data) setLoading(true);
    try {
      const next = await getHomeDashboard();
      setData(next);

      if (next.profile.status === 'active' && next.stories.length) {
        await recordStoryViews(next.stories.map((item) => item.id));
      }
    } catch {
      setError('Beranda belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    const count = data?.banners.length ?? 0;
    if (count <= 1) return;

    const timer = setInterval(() => {
      setBannerIndex((current) => {
        const next = (current + 1) % count;
        bannerRef.current?.scrollToOffset({
          offset: next * bannerWidth,
          animated: true,
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [data?.banners.length, bannerWidth]);

  async function openBanner(item: Banner) {
    if (!item.action_value || item.action_type === 'none') return;

    try {
      if (item.action_type === 'url') {
        await Linking.openURL(item.action_value);
        return;
      }

      if (item.action_type === 'whatsapp') {
        const digits = item.action_value.replace(/[^0-9]/g, '');
        const number = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
        await Linking.openURL(`https://wa.me/${number}`);
        return;
      }

      if (item.action_type === 'service') {
        router.push({
          pathname: '/service/[id]',
          params: { id: item.action_value },
        });
        return;
      }

      if (item.action_type === 'route') {
        router.push(item.action_value as never);
      }
    } catch {
      Alert.alert('Link belum dapat dibuka', 'Silakan coba kembali.');
    }
  }

  async function react(story: Story, reaction: 'heart' | 'fire' | 'like') {
    setActionBusy(true);
    try {
      await setStoryReaction(
        story.id,
        story.myReaction === reaction ? null : reaction,
      );
      await load();
    } catch (value) {
      Alert.alert(
        'Reaction belum tersimpan',
        value instanceof Error ? value.message : 'Silakan coba kembali.',
      );
    } finally {
      setActionBusy(false);
    }
  }

  function report(story: Story) {
    Alert.alert('Laporkan Story', 'Pilih alasan laporan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Spam',
        onPress: async () => {
          try {
            await reportStory(story.id, 'Spam');
            Alert.alert('Laporan dikirim', 'Admin akan meninjau Story ini.');
          } catch (value) {
            Alert.alert(
              'Belum berhasil',
              value instanceof Error ? value.message : 'Laporan belum terkirim.',
            );
          }
        },
      },
      {
        text: 'Konten tidak pantas',
        onPress: async () => {
          try {
            await reportStory(story.id, 'Konten tidak pantas');
            Alert.alert('Laporan dikirim', 'Admin akan meninjau Story ini.');
          } catch (value) {
            Alert.alert(
              'Belum berhasil',
              value instanceof Error ? value.message : 'Laporan belum terkirim.',
            );
          }
        },
      },
      {
        text: 'Pelecehan / mengganggu',
        onPress: async () => {
          try {
            await reportStory(story.id, 'Pelecehan atau mengganggu');
            Alert.alert('Laporan dikirim', 'Admin akan meninjau Story ini.');
          } catch (value) {
            Alert.alert(
              'Belum berhasil',
              value instanceof Error ? value.message : 'Laporan belum terkirim.',
            );
          }
        },
      },
    ]);
  }

  function block(story: Story) {
    Alert.alert(
      'Blokir member?',
      `Story dari ${story.author?.full_name ?? 'member ini'} tidak akan tampil lagi di feed Anda.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Blokir',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockStoryMember(story.member_id);
              await load();
            } catch (value) {
              Alert.alert(
                'Belum berhasil',
                value instanceof Error ? value.message : 'Member belum dapat diblokir.',
              );
            }
          },
        },
      ],
    );
  }

  function removeOwnStory(story: Story) {
    Alert.alert('Hapus Story?', 'Story akan langsung hilang dari feed.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteStory(story.id);
            await load();
          } catch (value) {
            Alert.alert(
              'Belum berhasil',
              value instanceof Error ? value.message : 'Story belum dapat dihapus.',
            );
          }
        },
      },
    ]);
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
        <BrandHeader eyebrow="STARPOINT GARAGE" title="Beranda" />
        <Pressable
          onPress={() => router.push('/notifications')}
          style={{
            minWidth: 46,
            height: 42,
            borderRadius: 21,
            paddingHorizontal: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Theme.colors.surface,
            borderWidth: 1,
            borderColor: Theme.colors.border,
          }}
        >
          <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>
            🔔{data?.unreadNotifications ? ` ${data.unreadNotifications}` : ''}
          </Text>
        </Pressable>
      </View>

      {error ? (
        <Pressable onPress={load}>
          <Text style={{ color: Theme.colors.danger, marginBottom: 14 }}>
            {error} Ketuk untuk mencoba lagi.
          </Text>
        </Pressable>
      ) : null}

      {loading && !data ? (
        <Text style={{ color: Theme.colors.textMuted, marginBottom: 16 }}>
          Memuat Beranda…
        </Text>
      ) : null}

      {data?.banners.length ? (
        <>
          <FlatList
            ref={bannerRef}
            horizontal
            pagingEnabled
            data={data.banners}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={bannerWidth}
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              setBannerIndex(
                Math.round(event.nativeEvent.contentOffset.x / bannerWidth),
              );
            }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => openBanner(item)}
                style={{
                  width: bannerWidth,
                  paddingRight: 10,
                }}
              >
                <View
                  style={{
                    ...cardStyle(),
                    overflow: 'hidden',
                    minHeight: 178,
                    backgroundColor: Theme.colors.accentSoft,
                  }}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: '100%', aspectRatio: 16 / 7 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        minHeight: 178,
                        padding: 20,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Text
                        style={{
                          color: Theme.colors.accent,
                          fontSize: 12,
                          fontWeight: '900',
                          letterSpacing: 1,
                        }}
                      >
                        STARPOINT GARAGE
                      </Text>
                      <Text
                        style={{
                          color: Theme.colors.text,
                          fontSize: 22,
                          fontWeight: '900',
                          marginTop: 8,
                        }}
                      >
                        {item.title}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )}
          />
          {data.banners.length > 1 ? (
            <Text
              style={{
                color: Theme.colors.textMuted,
                fontSize: 11,
                textAlign: 'center',
                marginTop: 7,
              }}
            >
              {bannerIndex + 1} / {data.banners.length}
            </Text>
          ) : null}
        </>
      ) : (
        <View
          style={{
            ...cardStyle(),
            minHeight: 170,
            padding: 20,
            justifyContent: 'flex-end',
            backgroundColor: Theme.colors.accentSoft,
          }}
        >
          <Text
            style={{
              color: Theme.colors.accent,
              fontWeight: '900',
              fontSize: 12,
              letterSpacing: 1.2,
            }}
          >
            STARPOINT MEMBER
          </Text>
          <Text
            style={{
              color: Theme.colors.text,
              fontWeight: '900',
              fontSize: 24,
              marginTop: 8,
            }}
          >
            Rawat motor. Kumpulkan benefit.
          </Text>
        </View>
      )}

      {data?.profile.status !== 'active' ? (
        <View
          style={{
            ...cardStyle(),
            padding: 16,
            marginTop: 16,
            backgroundColor: Theme.colors.accentSoft,
          }}
        >
          <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>
            Aktivasi member di outlet
          </Text>
          <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginTop: 6 }}>
            Story Member tersedia setelah akun diaktifkan melalui scan pertama di Starpoint Garage.
          </Text>
        </View>
      ) : null}

      <View
        style={{
          marginTop: 28,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <View>
          <Text style={{ color: Theme.colors.text, fontSize: 20, fontWeight: '900' }}>
            Story Member
          </Text>
          <Pressable onPress={() => router.push('/community-guidelines')}>
            <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>
              Community Guidelines
            </Text>
          </Pressable>
        </View>

        {data?.profile.status === 'active' ? (
          <Pressable
            onPress={() => router.push('/story/new')}
            style={{
              borderRadius: 14,
              backgroundColor: Theme.colors.accent,
              paddingHorizontal: 14,
              paddingVertical: 11,
            }}
          >
            <Text style={{ color: Theme.colors.background, fontWeight: '900' }}>
              + STORY
            </Text>
          </Pressable>
        ) : null}
      </View>

      {data?.profile.status === 'active' && data.stories.length === 0 ? (
        <View style={{ ...cardStyle(), padding: 18 }}>
          <Text style={{ color: Theme.colors.text, fontWeight: '800' }}>
            Belum ada Story aktif.
          </Text>
          <Text style={{ color: Theme.colors.textMuted, lineHeight: 20, marginTop: 7 }}>
            Story berupa foto akan tampil selama 24 jam.
          </Text>
        </View>
      ) : null}

      {data?.profile.status === 'active'
        ? data.stories.map((story) => (
            <View
              key={story.id}
              style={{
                ...cardStyle(),
                overflow: 'hidden',
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {story.author?.avatarUrl ? (
                  <Image
                    source={{ uri: story.author.avatarUrl }}
                    style={{ width: 42, height: 42, borderRadius: 21 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: Theme.colors.surfaceElevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: Theme.colors.accent, fontWeight: '900' }}>
                      {(story.author?.full_name ?? 'M').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={{ color: Theme.colors.text, fontWeight: '900' }}>
                    {story.author?.full_name ?? 'Member Starpoint'}
                  </Text>
                  <Text style={{ color: Theme.colors.textMuted, fontSize: 11, marginTop: 3 }}>
                    @{story.author?.username ?? 'member'} · {formatDate(story.created_at)} ·{' '}
                    {formatTime(story.created_at)}
                  </Text>
                </View>

                {story.isMine ? (
                  <Pressable onPress={() => removeOwnStory(story)}>
                    <Text style={{ color: Theme.colors.danger, fontSize: 12, fontWeight: '800' }}>
                      HAPUS
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {story.mediaUrl ? (
                <Image
                  source={{ uri: story.mediaUrl }}
                  style={{ width: '100%', aspectRatio: 4 / 5 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    aspectRatio: 4 / 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Theme.colors.surfaceElevated,
                  }}
                >
                  <Text style={{ color: Theme.colors.textMuted }}>Foto tidak tersedia</Text>
                </View>
              )}

              <View style={{ padding: 14 }}>
                {story.caption ? (
                  <Text style={{ color: Theme.colors.text, lineHeight: 20, marginBottom: 12 }}>
                    {story.caption}
                  </Text>
                ) : null}

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {(['heart', 'fire', 'like'] as const).map((reaction) => {
                    const count =
                      reaction === 'heart'
                        ? story.heart_count
                        : reaction === 'fire'
                          ? story.fire_count
                          : story.like_count;

                    return (
                      <Pressable
                        key={reaction}
                        disabled={actionBusy}
                        onPress={() => react(story, reaction)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 7,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor:
                            story.myReaction === reaction
                              ? Theme.colors.accent
                              : Theme.colors.border,
                          backgroundColor:
                            story.myReaction === reaction
                              ? Theme.colors.accentSoft
                              : Theme.colors.surfaceElevated,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              story.myReaction === reaction
                                ? Theme.colors.accent
                                : Theme.colors.text,
                            fontSize: 12,
                            fontWeight: '800',
                          }}
                        >
                          {reactionLabel(reaction, count, story.myReaction === reaction)}
                        </Text>
                      </Pressable>
                    );
                  })}

                  <Text style={{ color: Theme.colors.textMuted, fontSize: 12, marginLeft: 'auto' }}>
                    👁 {story.view_count}
                  </Text>
                </View>

                {!story.isMine ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 18,
                      marginTop: 14,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: Theme.colors.border,
                    }}
                  >
                    <Pressable onPress={() => report(story)}>
                      <Text style={{ color: Theme.colors.textMuted, fontSize: 12, fontWeight: '800' }}>
                        LAPORKAN
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => block(story)}>
                      <Text style={{ color: Theme.colors.textMuted, fontSize: 12, fontWeight: '800' }}>
                        BLOKIR MEMBER
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          ))
        : null}
    </Screen>
  );
}
