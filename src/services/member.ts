import { supabase } from '@/src/lib/supabase';
import { createAvatarSignedUrl } from '@/src/services/profile';

export async function getMemberDashboard() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error('User tidak ditemukan.');

  const userId = authData.user.id;

  const [profileResult, summaryResult] = await Promise.all([
    supabase.from('member_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('member_membership_summary').select('*').eq('member_id', userId).single(),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (summaryResult.error) throw summaryResult.error;

  const { data: benefits, error: benefitError } = await supabase
    .from('membership_benefit_templates')
    .select('id,code,title_id,benefit_type,amount,min_transaction,period_days')
    .eq('level', summaryResult.data.level)
    .eq('active', true)
    .order('code');

  if (benefitError) throw benefitError;

  const avatarUrl = await createAvatarSignedUrl(profileResult.data.avatar_path);

  return {
    profile: profileResult.data,
    summary: summaryResult.data,
    benefits: benefits ?? [],
    avatarUrl,
    authEmail: authData.user.email ?? profileResult.data.email,
  };
}
