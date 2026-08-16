import { createFileRoute, Link } from "@tanstack/react-router";

import { Countdown, EmptyState, PageHeader } from "@/components/app/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — SSD Consortium OS" },
      { name: "description", content: "All EU funding projects you take part in with Smart Society Development." },
      { property: "og:title", content: "Projects — SSD Consortium OS" },
      { property: "og:description", content: "All EU funding projects you take part in with Smart Society Development." },
    ],
  }),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Every call your organisation has been invited to prepare with the consortium."
      />
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (projects ?? []).length === 0 ? (
        <EmptyState title="No projects available" description="Ask the coordinator to add you to a project." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(projects ?? []).map((project) => (
            <Link
              key={project.id}
              to="/projects/$projectId/$tab"
              params={{ projectId: project.id, tab: "overview" }}
              className="panel block p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">{project.programme}</p>
                <Badge variant="secondary" className="capitalize">
                  {String(project.status).replace("_", " ")}
                </Badge>
              </div>
              <h2 className="font-display mt-2 text-base font-semibold">{project.title}</h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{project.code}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                <Countdown deadline={project.deadline} />
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
