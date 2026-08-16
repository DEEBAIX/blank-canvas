import { createFileRoute, Link, Outlet, useParams } from "@tanstack/react-router";

import { Countdown } from "@/components/app/ui-bits";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const TABS = [
  { key: "overview", label: "Overview" },
  { key: "consortium", label: "Consortium" },
  { key: "workflow", label: "Workflow" },
  { key: "ideas", label: "Ideas & chat" },
  { key: "ai", label: "AI workspace" },
  { key: "budget", label: "Budget" },
  { key: "proposal", label: "Proposal" },
  { key: "library", label: "Library" },
] as const;

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectLayout,
});

function ProjectLayout() {
  const { projectId } = useParams({ from: "/_authenticated/projects/$projectId" });
  const { data: project } = useProject(projectId);

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{project?.programme}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">{project?.title ?? "Loading…"}</h1>
          {project?.status && (
            <Badge variant="secondary" className="capitalize">
              {String(project.status).replace("_", " ")}
            </Badge>
          )}
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="font-mono">{project?.code}</span>
          <Countdown deadline={project?.deadline} />
          {project?.total_budget && <span>Indicative budget €{Number(project.total_budget).toLocaleString("en-IE")}</span>}
        </p>
      </header>

      <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            to="/projects/$projectId/$tab"
            params={{ projectId, tab: tab.key }}
            className="shrink-0 rounded-t-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: cn("border-b-2 border-accent text-foreground font-medium") }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
