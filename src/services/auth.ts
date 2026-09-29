import * as Linking from 'expo-linking';

import { Env } from '@/src/config/env';
import { supabase } from '@/src/lib/supabase';

type AuthSessionPayload = {
  access_token: string;
  refresh_token: string;
};

type MemberAuthResponse = {
  session?: AuthSessionPayload;
  member?: { status: string };
  error?: string;
};

function messageForCode(code?: string) {
  switch (code) {
    case 'USERNAME_TAKEN':
      return 'Username sudah digunakan.';
    case 'EMAIL_TAKEN':
      return 'Email sudah terdaftar.';
    case 'INVALID_USERNAME':
      return 'Username harus 4–20 karakter: huruf kecil, angka, titik, atau underscore.';
    case 'WEAK_PASSWORD':
      return 'Password minimal 8 karakter dan harus mengandung huruf serta angka.';
    case 'INVALID_EMAIL':
      return 'Format email tidak valid.';
    case 'INVALID_BIRTH_DATE':
      return 'Tanggal lahir tidak valid.';
    case 'REFERRAL_CODE_NOT_FOUND':
      return 'Kode referral tidak ditemukan.';
    case 'ACCOUNT_SUSPENDED':
      return 'Akun sedang ditangguhkan. Hubungi Starpoint Garage.';
    case 'INVALID_CREDENTIALS':
      return 'Username atau password salah.';
    default:
      return 'Terjadi kendala. Silakan coba kembali.';
  }
}

async function memberAuthRequest(body: Record<string, unknown>) {
  const response = await fetch(`${Env.supabaseUrl}/functions/v1/member-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: Env.supabasePublishableKey,
      Authorization: `Bearer ${Env.supabasePublishableKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as MemberAuthResponse;

  if (!response.ok || !data.session) {
    throw new Error(messageForCode(data.error));
  }

  const { error } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  if (error) throw new Error('Sesi login gagal dibuat.');

  return data;
}

export async function loginWithUsername(username: string, password: string) {
  return memberAuthRequest({
    action: 'login',
    username: username.trim().toLowerCase(),
    password,
  });
}

export async function registerMember(input: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  birthDate: string;
  referralCode?: string;
}) {
  return memberAuthRequest({
    action: 'register',
    fullName: input.fullName.trim(),
    username: input.username.trim().toLowerCase(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    birthDate: input.birthDate,
    referralCode: input.referralCode?.trim() || null,
  });
}

export async function requestPasswordReset(email: string) {
  const redirectTo = Linking.createURL('/reset-password');
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  });
  if (error) throw error;
}

export async function establishRecoverySession(url: string) {
  const parsed = new URL(url);
  const code = parsed.searchParams.get('code');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return;
  }

  throw new Error('Link reset password tidak valid atau sudah kedaluwarsa.');
}
