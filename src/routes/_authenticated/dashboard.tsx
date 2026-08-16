import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Users, Layers, FileText } from "lucide-react";

import { CountryTag } from "@/components/app/brand";
import { Countdown, EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/app/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Row } from "@/lib/queries";
import { useMembers, useMyProfile, useProjects, useSections, useTasks, useWorkPackages } from "@/lib/queries";
import { proposalProgress } from "@/lib/scoring";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SSD Consortium OS" },
      { name: "description", content: "Overview of your EU consortium projects, deadlines and pending work." },
      { property: "og:title", content: "Dashboard — SSD Consortium OS" },
      { property: "og:description", content: "Overview of your EU consortium projects, deadlines and pending work." },
    ],
  }),
  component: Dashboard,
});

function ProjectSummary({ project }: { project: Row }) {
  const { data: members = [] } = useMembers(project.id);
  const { data: wps = [] } = useWorkPackages(project.id);
  const { data: tasks = [] } = useTasks(project.id);
  const { data: sections = [] } = useSections(project.id);
  const openTasks = tasks.filter((t) => t.status !== "done").length;

  return (
    <Link
      to="/projects/$projectId/$tab"
      params={{ projectId: project.id, tab: "overview" }}
      className="panel block p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">{project.programme}</p>
          <h2 className="font-display mt-1 text-lg font-semibold">{project.title}</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{project.code}</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {String(project.status).replace("_", " ")}
        </Badge>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-4">
        <div className="text-sm">
          <p className="text-muted-foreground">Deadline</p>
          <p className="mt-1 font-medium">
            <Countdown deadline={project.deadline} />
          </p>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground">Partners</p>
          <p className="mt-1 font-medium">{members.length}</p>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground">Work packages</p>
          <p className="mt-1 font-medium">{wps.length}</p>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground">Open tasks</p>
          <p className="mt-1 font-medium">{openTasks}</p>
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar value={proposalProgress(sections)} label="Proposal completion" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from(
          new Map(
            members
              .filter((m) => m.organizations)
              .map((m) => [m.organizations.country_code, m.organizations]),
          ).values(),
        ).map((org: any) => (
          <CountryTag key={org.country_code} code={org.country_code} country={org.country} />
        ))}
      </div>
    </Link>
  );
}

function Dashboard() {
  const { data: profile } = useMyProfile();
  const { data: projects, isLoading } = useProjects();
  const list = projects ?? [];
  const nextDeadline = list.find((p) => p.deadline);

  return (
    <div>
      <PageHeader
        eyebrow="Consortium OS"
        title={`Welcome${profile?.full_name ? `, ${String(profile.full_name).split(" ")[0]}` : ""}`}
        description="Your shared workspace for preparing EU funding proposals with the Smart Society Development consortium."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active projects" value={list.length} icon={<Layers className="h-4 w-4" />} />
        <StatCard
          label="Next deadline"
          value={<Countdown deadline={nextDeadline?.deadline} />}
          hint={nextDeadline?.code}
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <StatCard
          label="Your organisation"
          value={profile?.organizations?.name ?? "—"}
          hint={profile?.organizations?.country ?? undefined}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard label="Role" value={profile?.position || "Consortium member"} icon={<FileText className="h-4 w-4" />} />
      </div>

      {isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : list.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="You have not been added to a consortium project. Contact the SSD coordination team."
        />
      ) : (
        <div className="grid gap-5">
          {list.map((project) => (
            <ProjectSummary key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
