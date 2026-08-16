import { useState } from "react";
import { toast } from "sonner";

import { CountryTag } from "@/components/app/brand";
import { EmptyState, SectionCard } from "@/components/app/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInsert, useMembers, useMyMembership, useMyRoles, useOrganizations } from "@/lib/queries";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "SSD admin",
  coordinator: "Coordinator",
  partner_admin: "Partner admin",
  partner_member: "Partner member",
  reviewer: "Reviewer",
};

export function ConsortiumPanel({ projectId }: { projectId: string }) {
  const { data: members = [] } = useMembers(projectId);
  const { data: orgs = [] } = useOrganizations();
  const { data: membership } = useMyMembership(projectId);
  const { data: roles = [] } = useMyRoles();
  const invite = useInsert("project_members", ["members"]);
  const [form, setForm] = useState({ email: "", org_id: "", role: "partner_member" });

  const canManage = roles.includes("super_admin") || membership?.role === "coordinator";

  const byOrg = new Map<string, { org: any; people: any[] }>();
  members.forEach((m) => {
    const key = m.org_id ?? "unassigned";
    if (!byOrg.has(key)) byOrg.set(key, { org: m.organizations, people: [] });
    byOrg.get(key)!.people.push(m);
  });

  return (
    <div className="grid gap-6">
      <SectionCard
        title="Consortium map"
        description={`${byOrg.size} organisations across ${new Set(members.map((m) => m.organizations?.country_code).filter(Boolean)).size} countries.`}
      >
        {members.length === 0 ? (
          <EmptyState title="No partners yet" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from(byOrg.entries()).map(([key, group]) => (
              <article key={key} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display truncate font-semibold">{group.org?.name ?? "Unassigned"}</h3>
                    <p className="text-xs text-muted-foreground">PIC {group.org?.pic_number || "—"}</p>
                  </div>
                  {group.org && <CountryTag code={group.org.country_code} country={group.org.country} />}
                </div>
                {group.org?.proposed_contribution && (
                  <p className="mt-2 text-sm text-muted-foreground">{group.org.proposed_contribution}</p>
                )}
                <ul className="mt-3 space-y-2">
                  {group.people.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">
                        {p.profiles?.full_name || p.email}
                        {p.profiles?.position && (
                          <span className="text-muted-foreground"> · {p.profiles.position}</span>
                        )}
                      </span>
                      <Badge variant={p.joined_at ? "secondary" : "outline"}>
                        {ROLE_LABEL[p.role] ?? p.role}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      {canManage && (
        <SectionCard title="Invite a partner" description="Access is granted the moment they sign in with this email address.">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Organisation</Label>
              <Select value={form.org_id} onValueChange={(v) => setForm({ ...form, org_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner_admin">Partner admin</SelectItem>
                  <SelectItem value="partner_member">Partner member</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="mt-4"
            disabled={!form.email || invite.isPending}
            onClick={() =>
              invite.mutate(
                { project_id: projectId, email: form.email.trim().toLowerCase(), org_id: form.org_id || null, role: form.role },
                {
                  onSuccess: () => {
                    toast.success("Partner invited");
                    setForm({ ...form, email: "" });
                  },
                  onError: (e: Error) => toast.error(e.message),
                },
              )
            }
          >
            Invite partner
          </Button>
        </SectionCard>
      )}
    </div>
  );
}
