import { supabase } from '@/src/lib/supabase';

function normalizeRewardError(message: string) {
  const checks: Array<[string, string]> = [
    ['ACTIVE_MEMBER_REQUIRED', 'Aktivasi member di outlet diperlukan untuk redeem reward.'],
    ['INSUFFICIENT_POINTS', 'Reward Point belum mencukupi.'],
    ['REWARD_NOT_AVAILABLE', 'Reward ini sudah tidak tersedia.'],
    ['REWARD_ALREADY_APPLIED', 'Satu reward sudah digunakan pada transaksi ini.'],
    ['REWARD_SERVICE_MISMATCH', 'Reward hanya berlaku untuk layanan yang sesuai.'],
    ['REWARD_VEHICLE_CATEGORY_MISMATCH', 'Kategori kendaraan tidak sesuai reward.'],
    ['MIN_TRANSACTION_NOT_MET', 'Minimum transaksi reward belum terpenuhi.'],
    ['SERVICE_REWARD_REQUIRES_UNPAID_BOOKING', 'Reward treatment penuh hanya dapat dipakai sebelum ada pembayaran.'],
    ['BIRTHDAY_REWARD_PREMIUM_WASH_ONLY', 'Birthday reward hanya berlaku untuk Premium Signature Wash.'],
    ['BIRTHDAY_REWARD_NOT_AVAILABLE', 'Birthday Wash belum tersedia atau sudah digunakan.'],
    ['BIRTHDAY_REWARD_REQUIRES_UNPAID_BOOKING', 'Birthday Wash hanya dapat dipakai sebelum ada pembayaran.'],
  ];

  for (const [code, text] of checks) {
    if (message.includes(code)) return text;
  }
  return 'Reward belum berhasil diproses.';
}

export async function syncLoyaltyBenefits() {
  const [membership, birthday] = await Promise.all([
    supabase.rpc('sync_my_membership_rewards'),
    supabase.rpc('sync_my_birthday_reward'),
  ]);

  if (membership.error) throw membership.error;
  if (birthday.error) throw birthday.error;
  return birthday.data;
}

export async function getRewardsDashboard() {
  const birthday = await syncLoyaltyBenefits();

  const [balanceResult, catalogResult, rewardsResult, ledgerResult] = await Promise.all([
    supabase.from('member_point_balances').select('*').maybeSingle(),
    supabase
      .from('reward_catalog')
      .select(
        'id,code,title_id,reward_type,service_id,vehicle_category,points_cost,voucher_amount,min_transaction,validity_days,sort_order,services(id,code,name_id)',
      )
      .eq('active', true)
      .order('sort_order'),
    supabase
      .from('member_rewards')
      .select(
        'id,source,status,points_spent,issued_at,expires_at,used_at,booking_id,reward_catalog_id,benefit_template_id,reward_catalog(id,code,title_id,reward_type,service_id,vehicle_category,points_cost,voucher_amount,min_transaction,validity_days),membership_benefit_templates(id,code,title_id,benefit_type,amount,min_transaction,period_days)',
      )
      .order('issued_at', { ascending: false }),
    supabase
      .from('point_ledger')
      .select('id,delta,qualifying_delta,reason,description,created_at,booking_id,payment_id,reward_id')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  if (balanceResult.error) throw balanceResult.error;
  if (catalogResult.error) throw catalogResult.error;
  if (rewardsResult.error) throw rewardsResult.error;
  if (ledgerResult.error) throw ledgerResult.error;

  return {
    balance: balanceResult.data,
    catalog: catalogResult.data ?? [],
    rewards: rewardsResult.data ?? [],
    ledger: ledgerResult.data ?? [],
    birthday,
  };
}

export async function redeemReward(catalogId: string) {
  const { data, error } = await supabase.rpc('redeem_reward', {
    p_reward_catalog_id: catalogId,
  });

  if (error) throw new Error(normalizeRewardError(error.message));
  return data;
}

export async function applyRewardToBooking(memberRewardId: string, bookingId: string) {
  const { data, error } = await supabase.rpc('apply_member_reward_to_booking', {
    p_member_reward_id: memberRewardId,
    p_booking_id: bookingId,
  });

  if (error) throw new Error(normalizeRewardError(error.message));
  return data;
}

export async function applyBirthdayRewardToBooking(bookingId: string) {
  const { data, error } = await supabase.rpc('apply_birthday_reward_to_booking', {
    p_booking_id: bookingId,
  });

  if (error) throw new Error(normalizeRewardError(error.message));
  return data;
}

export function pointReasonLabel(reason: string) {
  const map: Record<string, string> = {
    transaction_base: 'Point transaksi',
    membership_bonus: 'Bonus membership',
    story_daily: 'Bonus Story',
    referral_referrer: 'Bonus referral',
    referral_new_member: 'Bonus member baru',
    redemption: 'Redeem reward',
    admin_adjustment: 'Penyesuaian Admin',
  };
  return map[reason] ?? reason;
}
