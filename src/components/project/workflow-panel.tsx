import { useState } from "react";
import { toast } from "sonner";

import { CountryTag } from "@/components/app/brand";
import { EmptyState, ProgressBar, SectionCard } from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInsert, useMembers, useRemove, useTasks, useUpdate, useWorkPackages } from "@/lib/queries";

const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "In review" },
  { key: "done", label: "Done" },
];

export function WorkflowPanel({ projectId }: { projectId: string }) {
  const { data: workPackages = [] } = useWorkPackages(projectId);
  const { data: tasks = [] } = useTasks(projectId);
  const { data: members = [] } = useMembers(projectId);
  const addWp = useInsert("work_packages", ["work_packages"]);
  const updateWp = useUpdate("work_packages", ["work_packages"]);
  const addTask = useInsert("tasks", ["tasks"]);
  const updateTask = useUpdate("tasks", ["tasks"]);
  const removeTask = useRemove("tasks", ["tasks"]);

  const orgs = Array.from(
    new Map(members.filter((m) => m.organizations).map((m) => [m.org_id, m.organizations])).entries(),
  );

  const [wp, setWp] = useState({ number: "", title: "", objective: "", lead_org_id: "" });
  const [task, setTask] = useState({ title: "", wp_id: "", assignee_org_id: "", due_date: "" });

  return (
    <div className="grid gap-6">
      <SectionCard title="Work packages" description="Structure of the project and who leads each block of work.">
        {workPackages.length === 0 ? (
          <EmptyState title="No work packages yet" description="Add the first WP below." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {workPackages.map((w) => (
              <article key={w.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold">
                    WP{w.number} · {w.title}
                  </h3>
                  {w.organizations ? (
                    <CountryTag code={w.organizations.country_code} country={w.organizations.name} />
                  ) : (
                    <span className="text-xs text-destructive">No lead</span>
                  )}
                </div>
                {w.objective && <p className="mt-2 text-sm text-muted-foreground">{w.objective}</p>}
                <div className="mt-3">
                  <ProgressBar value={Number(w.progress ?? 0)} label="Progress" />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Select
                    value={w.lead_org_id ?? ""}
                    onValueChange={(v) => updateWp.mutate({ id: w.id, values: { lead_org_id: v } })}
                  >
                    <SelectTrigger><SelectValue placeholder="Assign lead partner" /></SelectTrigger>
                    <SelectContent>
                      {orgs.map(([id, org]: any) => (
                        <SelectItem key={id} value={id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={w.progress ?? 0}
                    onBlur={(e) => updateWp.mutate({ id: w.id, values: { progress: Number(e.target.value) } })}
                  />
                </div>
                {w.kpis && <p className="mt-3 text-xs text-muted-foreground">KPIs: {w.kpis}</p>}
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-3 border-t border-border pt-5 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="wp-num">WP number</Label>
            <Input id="wp-num" type="number" value={wp.number} onChange={(e) => setWp({ ...wp, number: e.target.value })} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="wp-title">Title</Label>
            <Input id="wp-title" value={wp.title} onChange={(e) => setWp({ ...wp, title: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Lead partner</Label>
            <Select value={wp.lead_org_id} onValueChange={(v) => setWp({ ...wp, lead_org_id: v })}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                {orgs.map(([id, org]: any) => (
                  <SelectItem key={id} value={id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 md:col-span-4">
            <Label htmlFor="wp-obj">Objective</Label>
            <Textarea id="wp-obj" rows={2} value={wp.objective} onChange={(e) => setWp({ ...wp, objective: e.target.value })} />
          </div>
        </div>
        <Button
          className="mt-3"
          disabled={!wp.number || !wp.title || addWp.isPending}
          onClick={() =>
            addWp.mutate(
              {
                project_id: projectId,
                number: Number(wp.number),
                title: wp.title,
                objective: wp.objective || null,
                lead_org_id: wp.lead_org_id || null,
              },
              {
                onSuccess: () => {
                  toast.success("Work package added");
                  setWp({ number: "", title: "", objective: "", lead_org_id: "" });
                },
                onError: (e: Error) => toast.error(e.message),
              },
            )
          }
        >
          Add work package
        </Button>
      </SectionCard>

      <SectionCard title="Task board" description="Shared to-do list across the consortium.">
        <div className="grid gap-4 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="rounded-lg bg-secondary/60 p-3">
              <p className="mb-3 text-xs font-medium tracking-wide uppercase">{col.label}</p>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === col.key)
                  .map((t) => (
                    <div key={t.id} className="rounded-md bg-card p-3 shadow-sm">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.organizations?.name ?? "Unassigned"}
                        {t.due_date ? ` · due ${new Date(t.due_date).toLocaleDateString("en-GB")}` : ""}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Select
                          value={t.status}
                          onValueChange={(v) => updateTask.mutate({ id: t.id, values: { status: v } })}
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {COLUMNS.map((c) => (
                              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" onClick={() => removeTask.mutate(t.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 border-t border-border pt-5 md:grid-cols-4">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="t-title">New task</Label>
            <Input id="t-title" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Work package</Label>
            <Select value={task.wp_id} onValueChange={(v) => setTask({ ...task, wp_id: v })}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                {workPackages.map((w) => (
                  <SelectItem key={w.id} value={w.id}>WP{w.number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="t-due">Due date</Label>
            <Input id="t-due" type="date" value={task.due_date} onChange={(e) => setTask({ ...task, due_date: e.target.value })} />
          </div>
        </div>
        <Button
          className="mt-3"
          disabled={!task.title || addTask.isPending}
          onClick={() =>
            addTask.mutate(
              {
                project_id: projectId,
                title: task.title,
                wp_id: task.wp_id || null,
                due_date: task.due_date || null,
                status: "todo",
                position: tasks.length,
              },
              {
                onSuccess: () => {
                  toast.success("Task added");
                  setTask({ title: "", wp_id: "", assignee_org_id: "", due_date: "" });
                },
                onError: (e: Error) => toast.error(e.message),
              },
            )
          }
        >
          Add task
        </Button>
      </SectionCard>
    </div>
  );
}
