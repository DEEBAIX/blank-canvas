import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const EmailInput = z.object({ email: z.string().trim().email().max(255) });

/**
 * Public: only sends a magic link when the address was invited to a project.
 * The response never reveals whether the address is known.
 */
export const requestAccessLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invited } = await supabaseAdmin
      .from("project_members")
      .select("id")
      .ilike("email", email)
      .limit(1);

    let allowed = (invited?.length ?? 0) > 0;

    if (!allowed) {
      // Bootstrap: the very first account to sign in becomes the SSD platform admin.
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
      allowed = (existing?.users?.length ?? 0) === 0;
    }

    if (!allowed) return { sent: false as const };

    const origin =
      getRequest()?.headers.get("origin") ??
      process.env["APP_ORIGIN"] ??
      "";

    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { error } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: origin || undefined },
    });
    if (error) {
      console.error("[access] magic link failed", error.message);
      return { sent: false as const };
    }
    return { sent: true as const };
  });

/** Signed in: create the profile, attach pending invitations, bootstrap the first admin. */
export const claimAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const email = String(context.claims["email"] ?? "").toLowerCase();

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, email }, { onConflict: "id", ignoreDuplicates: true });

    if (email) {
      await supabaseAdmin
        .from("project_members")
        .update({ user_id: userId, joined_at: new Date().toISOString() })
        .ilike("email", email)
        .is("user_id", null);
    }

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if ((count ?? 0) === 0) {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "super_admin" });
      await supabaseAdmin.from("audit_log").insert({
        user_id: userId,
        action: "bootstrap_super_admin",
        entity: "user_roles",
      });
    }

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    return { roles: (roles ?? []).map((r) => r.role) };
  });
