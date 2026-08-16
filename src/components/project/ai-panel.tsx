import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ScoreRing, SectionCard } from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analyzeCall, draftSection, evaluateProposal } from "@/lib/ai.functions";
import { useEvaluations } from "@/lib/queries";

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("429")) return "AI is rate limited right now — please retry in a moment.";
  if (message.includes("402")) return "AI credits are exhausted for this workspace.";
  return message;
}

export function AiPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const runAnalyze = useServerFn(analyzeCall);
  const runDraft = useServerFn(draftSection);
  const runEvaluate = useServerFn(evaluateProposal);
  const { data: evaluations = [] } = useEvaluations(projectId);

  const [callText, setCallText] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", instructions: "", output: "" });
  const [busy, setBusy] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latest: any = evaluations[0]?.scores;

  return (
    <div className="grid gap-6">
      <SectionCard
        title="Call analyser"
        description="Paste the official call text; the assistant extracts the requirements into your checklist."
      >
        <Textarea
          rows={8}
          placeholder="Paste the call for proposals text here…"
          value={callText}
          onChange={(e) => setCallText(e.target.value)}
        />
        <Button
          className="mt-3"
          disabled={callText.trim().length < 50 || busy === "analyze"}
          onClick={async () => {
            setBusy("analyze");
            try {
              const result = await runAnalyze({ data: { projectId, callText: callText.trim() } });
              setAnalysis(result.summary);
              toast.success(`${result.requirements.length} requirements added to the checklist`);
              queryClient.invalidateQueries({ queryKey: ["call_requirements", projectId] });
            } catch (error) {
              toast.error(errorMessage(error));
            } finally {
              setBusy(null);
            }
          }}
        >
          <Sparkles className="h-4 w-4" /> {busy === "analyze" ? "Analysing…" : "Analyse call"}
        </Button>
        {analysis && <p className="mt-4 text-sm whitespace-pre-line text-muted-foreground">{analysis}</p>}
      </SectionCard>

      <SectionCard title="Section drafter" description="Generate an evaluator-ready draft using the consortium data already in the workspace.">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="ai-title">Section</Label>
            <Input
              id="ai-title"
              placeholder="e.g. 1.1 Objectives and ambition"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ai-inst">Instructions (optional)</Label>
            <Textarea
              id="ai-inst"
              rows={3}
              value={draft.instructions}
              onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
            />
          </div>
          <div>
            <Button
              disabled={draft.title.trim().length < 2 || busy === "draft"}
              onClick={async () => {
                setBusy("draft");
                try {
                  const result = await runDraft({
                    data: { projectId, sectionTitle: draft.title.trim(), instructions: draft.instructions },
                  });
                  setDraft({ ...draft, output: result.text });
                } catch (error) {
                  toast.error(errorMessage(error));
                } finally {
                  setBusy(null);
                }
              }}
            >
              <Sparkles className="h-4 w-4" /> {busy === "draft" ? "Writing…" : "Generate draft"}
            </Button>
          </div>
          {draft.output && (
            <div>
              <Textarea rows={14} value={draft.output} onChange={(e) => setDraft({ ...draft, output: e.target.value })} />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(draft.output);
                  toast.success("Draft copied — paste it into the Proposal tab");
                }}
              >
                Copy draft
              </Button>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Evaluator simulation" description="Scores the current application against the standard EU award criteria.">
        <Button
          disabled={busy === "eval"}
          onClick={async () => {
            setBusy("eval");
            try {
              await runEvaluate({ data: { projectId } });
              toast.success("Evaluation complete");
              queryClient.invalidateQueries({ queryKey: ["evaluations", projectId] });
            } catch (error) {
              toast.error(errorMessage(error));
            } finally {
              setBusy(null);
            }
          }}
        >
          <Sparkles className="h-4 w-4" /> {busy === "eval" ? "Evaluating…" : "Run evaluation"}
        </Button>

        {latest && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]">
            <ScoreRing
              value={((Number(latest.excellence) + Number(latest.impact) + Number(latest.implementation)) / 15) * 100}
              caption={`Excellence ${latest.excellence}/5 · Impact ${latest.impact}/5 · Implementation ${latest.implementation}/5`}
            />
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">{latest.summary}</p>
              {[
                ["Strengths", latest.strengths],
                ["Weaknesses", latest.weaknesses],
                ["Recommendations", latest.recommendations],
              ].map(([label, items]) =>
                Array.isArray(items) && items.length ? (
                  <div key={String(label)}>
                    <p className="text-sm font-medium">{label}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {items.map((item: string) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
