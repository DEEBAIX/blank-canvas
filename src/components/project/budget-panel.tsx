import { useState } from "react";
import { toast } from "sonner";

import { ProgressBar, SectionCard } from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBudgetLines, useInsert, useMembers, useProject, useRemove, useWorkPackages } from "@/lib/queries";

const CATEGORIES = ["Personnel", "Travel", "Equipment", "Subcontracting", "Other direct costs", "Indirect costs"];

export function BudgetPanel({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);
  const { data: lines = [] } = useBudgetLines(projectId);
  const { data: members = [] } = useMembers(projectId);
  const { data: wps = [] } = useWorkPackages(projectId);
  const addLine = useInsert("budget_lines", ["budget_lines"]);
  const removeLine = useRemove("budget_lines", ["budget_lines"]);

  const orgs = Array.from(new Map(members.filter((m) => m.organizations).map((m) => [m.org_id, m.organizations])).entries());
  const [form, setForm] = useState({ category: CATEGORIES[0], org_id: "", wp_id: "", amount: "", description: "" });

  const total = lines.reduce((s, l) => s + Number(l.amount ?? 0), 0);
  const target = Number(project?.total_budget ?? 0);
  const perOrg = new Map<string, number>();
  lines.forEach((l) => {
    const name = l.organizations?.name ?? "Unassigned";
    perOrg.set(name, (perOrg.get(name) ?? 0) + Number(l.amount ?? 0));
  });

  return (
    <div className="grid gap-6">
      <SectionCard title="Budget allocation" description="Distribution of the indicative call budget across partners.">
        <ProgressBar
          value={target ? (total / target) * 100 : 0}
          label={`€${total.toLocaleString("en-IE")} allocated${target ? ` of €${target.toLocaleString("en-IE")}` : ""}`}
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(perOrg.entries()).map(([name, amount]) => (
            <div key={name} className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium">{name}</p>
              <p className="font-display mt-1 text-lg">€{amount.toLocaleString("en-IE")}</p>
              <p className="text-xs text-muted-foreground">{total ? Math.round((amount / total) * 100) : 0}% of allocated</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Budget lines">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Partner</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4 text-right">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="py-2 pr-4">{l.category}</td>
                  <td className="py-2 pr-4">{l.organizations?.name ?? "—"}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{l.description}</td>
                  <td className="py-2 pr-4 text-right">€{Number(l.amount).toLocaleString("en-IE")}</td>
                  <td className="py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => removeLine.mutate(l.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-muted-foreground">No budget lines yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-3 border-t border-border pt-5 md:grid-cols-5">
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Partner</Label>
            <Select value={form.org_id} onValueChange={(v) => setForm({ ...form, org_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {orgs.map(([id, org]: any) => <SelectItem key={id} value={id}>{org.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Work package</Label>
            <Select value={form.wp_id} onValueChange={(v) => setForm({ ...form, wp_id: v })}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                {wps.map((w) => <SelectItem key={w.id} value={w.id}>WP{w.number}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="b-desc">Description</Label>
            <Input id="b-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="b-amount">Amount (EUR)</Label>
            <Input id="b-amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
        </div>
        <Button
          className="mt-3"
          disabled={!form.amount || addLine.isPending}
          onClick={() =>
            addLine.mutate(
              {
                project_id: projectId,
                category: form.category,
                org_id: form.org_id || null,
                wp_id: form.wp_id || null,
                description: form.description || null,
                amount: Number(form.amount),
              },
              {
                onSuccess: () => {
                  toast.success("Budget line added");
                  setForm({ ...form, amount: "", description: "" });
                },
                onError: (e: Error) => toast.error(e.message),
              },
            )
          }
        >
          Add budget line
        </Button>
      </SectionCard>
    </div>
  );
}
