import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  ShieldCheck,
  UserRound,
  LogOut,
  Menu,
  Moon,
  Sun,
} from "lucide-react";

import { BrandLockup } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useMyRoles } from "@/lib/queries";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/organizations", label: "Organisations", icon: Building2 },
  { to: "/profile", label: "My profile", icon: UserRound },
] as const;

function NavLinks({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = isAdmin
    ? [...nav, { to: "/admin", label: "Admin panel", icon: ShieldCheck } as const]
    : nav;

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data: roles } = useMyRoles();
  const { data: profile } = useMyProfile();
  const isAdmin = (roles ?? []).includes("super_admin");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <BrandLockup invert />
      <NavLinks isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
      <div className="mt-auto space-y-3 border-t border-sidebar-border pt-4">
        <div className="px-1 text-xs text-sidebar-foreground/60">
          <div className="truncate font-medium text-sidebar-foreground">
            {profile?.full_name || profile?.email || "Signed in"}
          </div>
          <div className="truncate">
            {isAdmin ? "SSD platform admin" : profile?.organizations?.name || "Consortium partner"}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start text-sidebar-foreground/80" onClick={toggleTheme}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {dark ? "Light" : "Dark"}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start text-sidebar-foreground/80" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden bg-sidebar text-sidebar-foreground lg:block">{sidebar}</aside>

      <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <BrandLockup invert />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {sidebar}
          </SheetContent>
        </Sheet>
      </header>

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
