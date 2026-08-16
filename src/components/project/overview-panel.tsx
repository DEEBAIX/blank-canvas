import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { CountryTag } from "@/components/app/brand";
import { ProgressBar, ScoreRing, SectionCard, StatCard } from "@/components/app/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useBudgetLines,
  useMembers,
  useProject,
  useRequirements,
  useSections,
  useTasks,
  useUpdate,
  useWorkPackages,
} from "@/lib/queries";
import { alertsFrom, readiness } from "@/lib/scoring";

export function OverviewPanel({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);
  const { data: members = [] } = useMembers(projectId);
  const { data: workPackages = [] } = useWorkPackages(projectId);
  const { data: sections = [] } = useSections(projectId);
  const { data: requirements = [] } = useRequirements(projectId);
  const { data: budgetLines = [] } = useBudgetLines(projectId);
  const { data: tasks = [] } = useTasks(projectId);
  const updateReq = useUpdate("call_requirements", ["call_requirements"]);

  const budgetTotal = budgetLines.reduce((sum, l) => sum + Number(l.amount ?? 0), 0);
  const input = {
    sections,
    members,
    workPackages,
    requirements,
    budgetTotal,
    projectBudget: Number(project?.total_budget ?? 0),
  };
  const { score, factors } = readiness(input);
  const alerts = alertsFrom(input);
  const countries = new Set(members.map((m) => m.organizations?.country_code).filter(Boolean));

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Partners" value={members.length} hint={`${countries.size} countries`} />
        <StatCard label="Work packages" value={workPackages.length} />
        <StatCard label="Open tasks" value={tasks.filter((t) => t.status !== "done").length} />
        <StatCard label="Allocated budget" value={`€${budgetTotal.toLocaleString("en-IE")}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <SectionCard title="Proposal readiness" description="Composite score across the six success factors of an EU application.">
          <ScoreRing value={score} caption="Estimated readiness of the current application" />
          <div className="mt-6 grid gap-4">
            {factors.map((factor) => (
              <div key={factor.label}>
                <ProgressBar value={factor.score} label={factor.label} />
                <p className="mt-1 text-xs text-muted-foreground">{factor.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard title="Call summary" description={project?.call_url ?? undefined}>
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {project?.abstract || "No abstract has been added for this call yet."}
            </p>
            {project?.call_url && (
              <Button asChild variant="outline" size="sm" className="mt-4">
                <a href={project.call_url} target="_blank" rel="noreferrer">
                  Open official call page
                </a>
              </Button>
            )}
          </SectionCard>

          <SectionCard title="Gaps and alerts" description="Automatically detected weaknesses in the current application.">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blocking gaps detected. Keep refining the narrative.</p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <li key={alert} className="flex gap-2 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Call requirements" description="What the call expects, and which partner covers it.">
        {requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No requirements captured yet. Use the AI workspace to analyse the call text.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {requirements.map((req) => (
              <li key={req.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{req.requirement}</p>
                  {req.needed_expertise && (
                    <p className="text-xs text-muted-foreground">Needs: {req.needed_expertise}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {req.organizations && (
                    <CountryTag code={req.organizations.country_code} country={req.organizations.name} />
                  )}
                  <Badge variant={req.status === "covered" ? "default" : "secondary"} className="capitalize">
                    {String(req.status).replace("_", " ")}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateReq.mutate(
                        { id: req.id, values: { status: req.status === "covered" ? "gap" : "covered" } },
                        { onError: (e: Error) => toast.error(e.message) },
                      )
                    }
                  >
                    Toggle
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
