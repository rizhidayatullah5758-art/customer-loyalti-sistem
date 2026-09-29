import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanUsername(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function validPassword(value: string) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return json({ error: "SERVER_NOT_CONFIGURED" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const publicClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "INVALID_JSON" }, 400);
  }

  const action = String(body.action ?? "");

  if (action === "register") {
    const fullName = String(body.fullName ?? "").trim();
    const username = cleanUsername(body.username);
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const birthDate = String(body.birthDate ?? "").trim();
    const referralCode = String(body.referralCode ?? "").trim() || null;

    if (!fullName) return json({ error: "FULL_NAME_REQUIRED" }, 400);
    if (!/^[a-z0-9._]{4,20}$/.test(username)) return json({ error: "INVALID_USERNAME" }, 400);
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "INVALID_EMAIL" }, 400);
    if (!validPassword(password)) return json({ error: "WEAK_PASSWORD" }, 400);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return json({ error: "INVALID_BIRTH_DATE" }, 400);

    const { data: usernameRow, error: usernameError } = await admin
      .from("member_profiles")
      .select("user_id")
      .eq("username", username)
      .maybeSingle();

    if (usernameError) return json({ error: "LOOKUP_FAILED" }, 500);
    if (usernameRow) return json({ error: "USERNAME_TAKEN" }, 409);

    if (referralCode) {
      const { data: referralRow, error: referralError } = await admin
        .from("member_profiles")
        .select("user_id")
        .eq("referral_code", referralCode)
        .neq("status", "deleted")
        .maybeSingle();

      if (referralError) return json({ error: "REFERRAL_LOOKUP_FAILED" }, 500);
      if (!referralRow) return json({ error: "REFERRAL_CODE_NOT_FOUND" }, 400);
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        account_type: "member",
        username,
        full_name: fullName,
        birth_date: birthDate,
        referral_code: referralCode,
      },
    });

    if (createError || !created.user) {
      const message = createError?.message?.toLowerCase() ?? "";
      if (message.includes("already") || message.includes("registered")) {
        return json({ error: "EMAIL_TAKEN" }, 409);
      }
      return json({ error: "REGISTER_FAILED" }, 400);
    }

    const { data: signedIn, error: signInError } = await publicClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signedIn.session) {
      return json({ error: "SESSION_CREATE_FAILED" }, 500);
    }

    return json({
      session: {
        access_token: signedIn.session.access_token,
        refresh_token: signedIn.session.refresh_token,
      },
      user: { id: created.user.id },
    });
  }

  if (action === "login") {
    const username = cleanUsername(body.username);
    const password = String(body.password ?? "");

    if (!username || !password) return json({ error: "INVALID_CREDENTIALS" }, 400);

    const { data: member, error: lookupError } = await admin
      .from("member_profiles")
      .select("email,status")
      .eq("username", username)
      .maybeSingle();

    if (lookupError || !member) return json({ error: "INVALID_CREDENTIALS" }, 401);
    if (member.status === "suspended") return json({ error: "ACCOUNT_SUSPENDED" }, 403);
    if (member.status === "deleted") return json({ error: "INVALID_CREDENTIALS" }, 401);

    const { data: signedIn, error: signInError } = await publicClient.auth.signInWithPassword({
      email: member.email,
      password,
    });

    if (signInError || !signedIn.session) return json({ error: "INVALID_CREDENTIALS" }, 401);

    return json({
      session: {
        access_token: signedIn.session.access_token,
        refresh_token: signedIn.session.refresh_token,
      },
      member: { status: member.status },
    });
  }

  return json({ error: "UNKNOWN_ACTION" }, 400);
});
