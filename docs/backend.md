# Starpoint Garage Backend

Dedicated Supabase project:

- Project: `starpoint-garage-production`
- Project ref: `lscwmlxsvmakhnzknvrr`
- Region: Singapore (`ap-southeast-1`)
- URL: `https://lscwmlxsvmakhnzknvrr.supabase.co`

The app uses a publishable client key through environment configuration. No server secret or service-role key is stored in the repository.

## Database foundation

Core entities include:

- member_profiles / member_directory
- staff_profiles / staff_access_allowlist
- membership_levels
- services / service_prices
- booking_slots / bookings
- payments
- point_ledger
- referrals
- reward_catalog / member_rewards
- membership_benefit_templates
- birthday_rewards
- checkins
- stories / views / reactions / reports
- banners
- coating_warranties
- push_devices / notifications
- audit_logs

RLS is enabled on all public tables. Storage buckets are private and protected with policies.

## Storage

- `member-avatars`
- `story-media`
- `payment-proofs`
- `banners`

## Realtime

Realtime is enabled for operational tables including bookings, payments, points, rewards, check-ins, stories, reactions, banners and notifications.

## App environment

Set these values outside source control:

```env
EXPO_PUBLIC_SUPABASE_URL=https://lscwmlxsvmakhnzknvrr.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xP2C7pPrFpjzbo4WS-C2sw_pYi5hHph
EXPO_PUBLIC_APP_ENV=production
```

The publishable key is client-safe by design, while all privileged keys must remain server-side.


## Payment mode

Starpoint Garage V1 uses **manual payment only**.

Enabled methods:
- QRIS BRI
- BRI bank transfer
- Cash at outlet

Payment flow:
1. Member submits payment or selects "Saya Sudah Bayar".
2. Payment status becomes `waiting_verification`.
3. Staff verifies the payment.
4. On approval, payment becomes `paid`.
5. Booking/payment/points update through the backend.

Third-party payment gateways are disabled. No Duitku credential, KYC, gateway webhook, or gateway transaction fee is required for V1.

Birthday Premium Signature Wash is valid for **2 calendar days starting on the member's birthday**.
