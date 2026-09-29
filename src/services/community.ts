import { decode } from 'base64-arraybuffer';

import { supabase } from '@/src/lib/supabase';

function normalizeCommunityError(message: string) {
  const checks: Array<[string, string]> = [
    ['ACTIVE_MEMBER_REQUIRED', 'Aktivasi member di outlet diperlukan untuk menggunakan Story.'],
    ['STORY_DAILY_LIMIT_REACHED', 'Batas 3 Story hari ini sudah tercapai.'],
    ['STORY_CAPTION_TOO_LONG', 'Caption maksimal 100 karakter.'],
    ['INVALID_STORY_MEDIA_PATH', 'File Story tidak valid.'],
    ['STORY_NOT_AVAILABLE', 'Story sudah tidak tersedia.'],
    ['INVALID_REACTION', 'Reaction tidak valid.'],
    ['INVALID_REPORT_REASON', 'Alasan laporan tidak valid.'],
    ['CANNOT_REPORT_OWN_STORY', 'Story sendiri tidak dapat dilaporkan.'],
    ['INVALID_BLOCK_TARGET', 'Member tersebut tidak dapat diblokir.'],
  ];

  for (const [code, text] of checks) {
    if (message.includes(code)) return text;
  }
  return 'Aksi Story belum berhasil. Silakan coba kembali.';
}

export async function createStory(input: {
  base64: string;
  mimeType?: string | null;
  caption?: string;
}) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error('AUTH_REQUIRED');

  const extension =
    input.mimeType === 'image/png' ? 'png' : input.mimeType === 'image/webp' ? 'webp' : 'jpg';
  const mediaPath = `${authData.user.id}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('story-media')
    .upload(mediaPath, decode(input.base64), {
      contentType: input.mimeType ?? 'image/jpeg',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase.rpc('create_member_story', {
    p_media_path: mediaPath,
    p_caption: input.caption?.trim() || undefined,
  });

  if (error) {
    await supabase.storage.from('story-media').remove([mediaPath]);
    throw new Error(normalizeCommunityError(error.message));
  }

  return data;
}

export async function deleteStory(storyId: string) {
  const { data: story, error: lookupError } = await supabase
    .from('stories')
    .select('id,media_path')
    .eq('id', storyId)
    .single();

  if (lookupError) throw lookupError;

  const { error } = await supabase.rpc('delete_my_story', {
    p_story_id: storyId,
  });
  if (error) throw new Error(normalizeCommunityError(error.message));

  await supabase.storage.from('story-media').remove([story.media_path]);
}

export async function setStoryReaction(
  storyId: string,
  reaction: 'heart' | 'fire' | 'like' | null,
) {
  const { error } = await supabase.rpc('set_story_reaction', {
    p_story_id: storyId,
    p_reaction: reaction ?? '',
  });
  if (error) throw new Error(normalizeCommunityError(error.message));
}

export async function reportStory(storyId: string, reason: string) {
  const { data, error } = await supabase.rpc('report_story', {
    p_story_id: storyId,
    p_reason: reason,
  });
  if (error) throw new Error(normalizeCommunityError(error.message));
  return data;
}

export async function blockStoryMember(memberId: string) {
  const { error } = await supabase.rpc('block_story_member', {
    p_member_id: memberId,
  });
  if (error) throw new Error(normalizeCommunityError(error.message));
}

export async function unblockStoryMember(memberId: string) {
  const { error } = await supabase.rpc('unblock_story_member', {
    p_member_id: memberId,
  });
  if (error) throw new Error(normalizeCommunityError(error.message));
}

export async function listBlockedMembers() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error('AUTH_REQUIRED');

  const { data: blocks, error: blockError } = await supabase
    .from('story_member_blocks')
    .select('blocked_id,created_at')
    .eq('blocker_id', authData.user.id)
    .order('created_at', { ascending: false });

  if (blockError) throw blockError;
  const ids = (blocks ?? []).map((item) => item.blocked_id);
  if (!ids.length) return [];

  const { data: members, error: memberError } = await supabase
    .from('member_directory')
    .select('user_id,username,full_name,member_code,avatar_path')
    .in('user_id', ids);

  if (memberError) throw memberError;
  const map = new Map((members ?? []).map((item) => [item.user_id, item]));

  return (blocks ?? []).map((item) => ({
    ...item,
    member: map.get(item.blocked_id) ?? null,
  }));
}
