import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ShieldCheck, Network, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";

import { BrandLockup, BrandMark } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestAccessLink } from "@/lib/access.functions";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — SSD Consortium OS" },
      {
        name: "description",
        content:
          "Secure passwordless access to the Smart Society Development consortium workspace for European funding proposals.",
      },
      { property: "og:title", content: "Sign in — SSD Consortium OS" },
      {
        property: "og:description",
        content: "Consortium workspace for European funding proposals by Smart Society Development NGO.",
      },
    ],
  }),
  component: SignInPage,
});

const emailSchema = z.string().trim().email("Enter a valid work email address").max(255);

function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const sendLink = useServerFn(requestAccessLink);
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      await sendLink({ data: { email: parsed.data } });
    } catch {
      // Never reveal membership — always report the same neutral outcome.
    }
    setStatus("sent");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="brand-gradient relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:26px_26px]" />
        <div className="relative">
          <BrandLockup invert subtitle="Consortium Operating System" />
        </div>
        <div className="relative max-w-lg space-y-6 text-primary-foreground">
          <div className="h-1 w-24 accent-rule rounded-full" />
          <h1 className="font-display text-4xl leading-tight font-semibold">
            From an EU call to a submission-ready consortium.
          </h1>
          <p className="text-primary-foreground/75">
            One secure workspace for partner mapping, work packages, budgets, documents and the
            proposal itself — operated by Smart Society Development MTÜ, Estonia.
          </p>
          <ul className="space-y-3 text-sm text-primary-foreground/85">
            <li className="flex items-start gap-3">
              <Network className="mt-0.5 h-4 w-4 text-brand-green" />
              Consortium structure, roles and work packages in one live map
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-brand-green" />
              AI project officer for gap analysis, drafting and evaluator simulation
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-brand-green" />
              Passwordless access, project-level isolation, audited activity
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/50">
          Confidential workspace · Access by invitation only
        </p>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex justify-center lg:hidden">
            <BrandMark className="h-16 w-16" />
          </div>
          <h2 className="font-display text-2xl font-semibold">Partner sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the official email address registered for your organisation. We send a single-use
            secure link — there are no passwords to manage.
          </p>

          {status === "sent" ? (
            <div className="panel mt-8 p-6 text-sm">
              <p className="font-medium">Check your inbox</p>
              <p className="mt-2 text-muted-foreground">
                If <span className="font-medium text-foreground">{email}</span> is registered in an
                active consortium, a secure sign-in link is on its way. The link expires shortly and
                can be used once.
              </p>
              <Button
                variant="ghost"
                className="mt-4 px-0"
                onClick={() => {
                  setStatus("idle");
                  setEmail("");
                }}
              >
                Use a different address
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Work email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@organisation.eu"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={status === "sending"}>
                {status === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send secure link <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
            Access is restricted to invited consortium partners. All activity in this workspace is
            logged. For access requests contact the SSD coordination team.
          </p>
        </div>
      </section>
    </main>
  );
}
