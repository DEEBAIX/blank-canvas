import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { claimAccess } from "@/lib/access.functions";
import { AppShell } from "@/components/app/app-shell";

let claimed = false;

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/" });
    if (!claimed) {
      claimed = true;
      try {
        await claimAccess();
      } catch (e) {
        console.error("claimAccess failed", e);
      }
    }
    return { user: data.user };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
