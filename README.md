# Starpoint Garage Member App

Android-first member application for **Starpoint Garage**, published by **RAPS Creative**.

This repository is intentionally separate from the public Starpoint Garage website repository.

## Foundation status

Phase 1 / Task 1 provides:

- Expo SDK 57 + React Native + TypeScript
- Expo Router
- Android package: `com.rapscreative.starpointgarage`
- EAS preview APK and production AAB profiles
- Four locked member tabs:
  - BERANDA
  - LAYANAN
  - RIWAYAT
  - PROFILE
- Initial auth routes:
  - Login with username + password
  - Registration with username + email + password
  - Password reset by email
- Dark premium Starpoint theme
- Environment placeholders for the dedicated Supabase project
- Initial screens aligned to the V1 product specification

## Requirements

- Node.js 22.13+
- npm
- Expo account for EAS Build when we reach APK build/release

## Install

```bash
npm install
npx expo-doctor
npm run typecheck
```

## Run

```bash
npm start
```

Web preview:

```bash
npm run web
```

## Android builds

Internal APK:

```bash
npx eas-cli build --platform android --profile preview
```

Google Play AAB:

```bash
npx eas-cli build --platform android --profile production
```

## Environment

Copy `.env.example` to `.env`.

Never commit production secrets. Only publishable client values may use the `EXPO_PUBLIC_` prefix.

## Architecture

```text
app/                    Expo Router routes
  (auth)/               Authentication flow
  (tabs)/               Four locked member tabs
src/
  components/           Shared UI components
  config/               App/environment configuration
  theme/                Starpoint design tokens
```

Supabase database, RLS, Auth integration, Storage, Realtime, booking, payments, loyalty and Story data are added in the next backend phases.
