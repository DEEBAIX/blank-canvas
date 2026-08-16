import { createFileRoute, useParams } from "@tanstack/react-router";

import { EmptyState } from "@/components/app/ui-bits";
import { OverviewPanel } from "@/components/project/overview-panel";
import { ConsortiumPanel } from "@/components/project/consortium-panel";
import { WorkflowPanel } from "@/components/project/workflow-panel";
import { IdeasPanel } from "@/components/project/ideas-panel";
import { AiPanel } from "@/components/project/ai-panel";
import { BudgetPanel } from "@/components/project/budget-panel";
import { ProposalPanel } from "@/components/project/proposal-panel";
import { LibraryPanel } from "@/components/project/library-panel";

export const Route = createFileRoute("/_authenticated/projects/$projectId/$tab")({
  component: TabPage,
});

function TabPage() {
  const { projectId, tab } = useParams({ from: "/_authenticated/projects/$projectId/$tab" });

  switch (tab) {
    case "overview":
      return <OverviewPanel projectId={projectId} />;
    case "consortium":
      return <ConsortiumPanel projectId={projectId} />;
    case "workflow":
      return <WorkflowPanel projectId={projectId} />;
    case "ideas":
      return <IdeasPanel projectId={projectId} />;
    case "ai":
      return <AiPanel projectId={projectId} />;
    case "budget":
      return <BudgetPanel projectId={projectId} />;
    case "proposal":
      return <ProposalPanel projectId={projectId} />;
    case "library":
      return <LibraryPanel projectId={projectId} />;
    default:
      return <EmptyState title="Unknown section" description="Choose one of the workspace tabs above." />;
  }
}
