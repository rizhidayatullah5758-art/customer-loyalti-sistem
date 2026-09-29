import { supabase } from '@/src/lib/supabase';

async function signedUrl(bucket: string, path?: string | null, expiresIn = 3600) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

export async function getHomeDashboard() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error('AUTH_REQUIRED');

  await supabase.rpc('sync_story_expirations');

  const now = new Date().toISOString();

  const [profileResult, bannersResult, storiesResult, unreadResult] = await Promise.all([
    supabase
      .from('member_profiles')
      .select('user_id,status,onboarding_completed')
      .eq('user_id', authData.user.id)
      .single(),
    supabase
      .from('banners')
      .select('id,title,image_path,action_type,action_value,sort_order,starts_at,ends_at')
      .eq('active', true)
      .order('sort_order')
      .order('created_at', { ascending: false }),
    supabase
      .from('stories')
      .select(
        'id,member_id,media_path,caption,status,expires_at,created_at,view_count,heart_count,fire_count,like_count',
      )
      .eq('status', 'active')
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (bannersResult.error) throw bannersResult.error;
  if (storiesResult.error) throw storiesResult.error;
  if (unreadResult.error) throw unreadResult.error;

  const storyRows = storiesResult.data ?? [];
  const authorIds = Array.from(new Set(storyRows.map((item) => item.member_id)));
  const storyIds = storyRows.map((item) => item.id);

  const [directoryResult, reactionResult] = await Promise.all([
    authorIds.length
      ? supabase
          .from('member_directory')
          .select('user_id,member_code,username,full_name,avatar_path,status')
          .in('user_id', authorIds)
      : Promise.resolve({ data: [], error: null }),
    storyIds.length
      ? supabase
          .from('story_reactions')
          .select('story_id,reaction')
          .in('story_id', storyIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (directoryResult.error) throw directoryResult.error;
  if (reactionResult.error) throw reactionResult.error;

  const directoryMap = new Map(
    (directoryResult.data ?? []).map((item) => [item.user_id, item]),
  );
  const reactionMap = new Map(
    (reactionResult.data ?? []).map((item) => [item.story_id, item.reaction]),
  );

  const bannerRows = await Promise.all(
    (bannersResult.data ?? []).map(async (item) => ({
      ...item,
      imageUrl: await signedUrl('banners', item.image_path),
    })),
  );

  const avatarPaths = Array.from(
    new Set(
      (directoryResult.data ?? [])
        .map((item) => item.avatar_path)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const avatarPairs = await Promise.all(
    avatarPaths.map(async (path) => [path, await signedUrl('member-avatars', path)] as const),
  );
  const avatarMap = new Map(avatarPairs);

  const stories = await Promise.all(
    storyRows.map(async (item) => {
      const author = directoryMap.get(item.member_id) ?? null;
      return {
        ...item,
        mediaUrl: await signedUrl('story-media', item.media_path),
        author: author
          ? {
              ...author,
              avatarUrl: author.avatar_path ? avatarMap.get(author.avatar_path) ?? null : null,
            }
          : null,
        myReaction: reactionMap.get(item.id) ?? null,
        isMine: item.member_id === authData.user.id,
      };
    }),
  );

  return {
    userId: authData.user.id,
    profile: profileResult.data,
    banners: bannerRows,
    stories,
    unreadNotifications: unreadResult.count ?? 0,
  };
}

export async function recordStoryViews(storyIds: string[]) {
  const uniqueIds = Array.from(new Set(storyIds));
  await Promise.allSettled(
    uniqueIds.map((id) => supabase.rpc('record_story_view', { p_story_id: id })),
  );
}
