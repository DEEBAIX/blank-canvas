import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";

import { ProgressBar, SectionCard } from "@/components/app/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInsert, useProject, useSections, useUpdate } from "@/lib/queries";
import { partProgress, proposalProgress, sectionProgress } from "@/lib/scoring";

const PARTS = [
  { key: "excellence", label: "1. Excellence" },
  { key: "impact", label: "2. Impact" },
  { key: "implementation", label: "3. Implementation" },
];

export function ProposalPanel({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);
  const { data: sections = [] } = useSections(projectId);
  const updateSection = useUpdate("proposal_sections", ["proposal_sections"]);
  const addSection = useInsert("proposal_sections", ["proposal_sections"]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [buffer, setBuffer] = useState("");
  const [newSection, setNewSection] = useState({ title: "", part: "excellence" });

  function compile() {
    const lines = [
      `${project?.title ?? "Proposal"}`,
      `Call: ${project?.code ?? ""}`,
      "",
    ];
    PARTS.forEach((part) => {
      lines.push(part.label.toUpperCase(), "");
      sections
        .filter((s) => s.part === part.key)
        .forEach((s) => {
          lines.push(s.title, "", s.content || "[section not drafted yet]", "");
        });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.code ?? "proposal"}-draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Proposal compiled");
  }

  return (
    <div className="grid gap-6">
      <SectionCard
        title="Proposal progress"
        description="Draft each section here; the readiness score updates automatically."
        actions={
          <Button onClick={compile}>
            <Download className="h-4 w-4" /> Compile proposal
          </Button>
        }
      >
        <ProgressBar value={proposalProgress(sections)} label="Overall completion" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PARTS.map((part) => (
            <ProgressBar key={part.key} value={partProgress(sections, part.key)} label={part.label} />
          ))}
        </div>
      </SectionCard>

      {PARTS.map((part) => (
        <SectionCard key={part.key} title={part.label}>
          <div className="space-y-3">
            {sections.filter((s) => s.part === part.key).length === 0 && (
              <p className="text-sm text-muted-foreground">No sections in this part yet.</p>
            )}
            {sections
              .filter((s) => s.part === part.key)
              .map((s) => {
                const open = openId === s.id;
                return (
                  <article key={s.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-medium">{s.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {sectionProgress(s)}% complete
                          {s.organizations?.name ? ` · contributed by ${s.organizations.name}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={s.status === "final" ? "default" : "secondary"} className="capitalize">
                          {String(s.status).replace("_", " ")}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOpenId(open ? null : s.id);
                            setBuffer(s.content ?? "");
                          }}
                        >
                          {open ? "Close" : "Edit"}
                        </Button>
                      </div>
                    </div>
                    {open && (
                      <div className="mt-3 grid gap-3">
                        <Textarea rows={14} value={buffer} onChange={(e) => setBuffer(e.target.value)} />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateSection.mutate(
                                { id: s.id, values: { content: buffer, status: "drafting" } },
                                {
                                  onSuccess: () => toast.success("Section saved"),
                                  onError: (e: Error) => toast.error(e.message),
                                },
                              )
                            }
                          >
                            Save draft
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateSection.mutate({ id: s.id, values: { content: buffer, status: "final" } })
                            }
                          >
                            Mark as final
                          </Button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-border pt-4">
            <Input
              className="max-w-xs"
              placeholder="New section title"
              value={newSection.part === part.key ? newSection.title : ""}
              onChange={(e) => setNewSection({ title: e.target.value, part: part.key })}
            />
            <Button
              variant="outline"
              disabled={newSection.part !== part.key || !newSection.title}
              onClick={() =>
                addSection.mutate(
                  {
                    project_id: projectId,
                    part: part.key,
                    title: newSection.title,
                    section_key: newSection.title.toLowerCase().replace(/\s+/g, "-").slice(0, 40),
                    content: "",
                    status: "empty",
                    position: sections.filter((s) => s.part === part.key).length,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Section added");
                      setNewSection({ title: "", part: part.key });
                    },
                    onError: (e: Error) => toast.error(e.message),
                  },
                )
              }
            >
              Add section
            </Button>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
