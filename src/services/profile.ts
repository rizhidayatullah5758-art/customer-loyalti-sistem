import { decode } from 'base64-arraybuffer';

import { supabase } from '@/src/lib/supabase';

export async function uploadMemberAvatar(input: {
  userId: string;
  base64: string;
  mimeType?: string | null;
  birthDate: string;
  fullName: string;
}) {
  const extension =
    input.mimeType === 'image/png' ? 'png' : input.mimeType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${input.userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('member-avatars')
    .upload(path, decode(input.base64), {
      contentType: input.mimeType ?? 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { error: profileError } = await supabase.rpc('update_my_member_profile', {
    p_full_name: input.fullName.trim(),
    p_avatar_path: path,
    p_birth_date: input.birthDate,
    p_marketing_notifications: true,
  });

  if (profileError) throw profileError;
  return path;
}

export async function createAvatarSignedUrl(path?: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('member-avatars').createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
